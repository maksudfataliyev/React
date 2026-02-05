import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { tokenStorage } from '@/shared/tokenStorage';
import { createConversation, getMessages, postMessage, postMessageWithFiles } from '@/features/services/Chat/chat.service';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { Navbar } from '@/components/layout/Navbar';
import { Paperclip } from 'lucide-react';

interface ChatWindowProps {
  participantId?: string; // other party clientProfileId
  conversationId?: string; // optional existing conv id
  onOpen?: (conversationId: string) => void;
}

const HUB_URL = import.meta.env.VITE_CHAT_HUB_URL ?? 'http://localhost:8001/hubs/chat';

type Msg = {
  id: string;
  conversationId: string;
  senderClientProfileId: string;
  content?: string | null;
  images?: string[];
  createdAt: string;
  _optimistic?: boolean;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ participantId, conversationId: convIdProp, onOpen }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const chat = (t as any)?.chat ?? {};
  const params = useParams<{ id?: string }>();
  const paramId = params.id?.trim();

  const [conversationId, setConversationId] = useState<string | null>(convIdProp ?? paramId ?? null);
  useEffect(() => { if (paramId && paramId !== conversationId) setConversationId(paramId); /* eslint-disable-next-line */ }, [paramId]);

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [otherTyping, setOtherTyping] = useState(false);
  const [myClientProfileId, setMyClientProfileId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const localStopTypingTimerRef = useRef<number | null>(null);

  const scrollToBottom = () => setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight }), 50);

  useEffect(() => {
    // decode token to find client profile id
    try {
      const tok = tokenStorage.get();
      if (tok) {
        const parts = tok.split('.');
        if (parts.length >= 2) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))));
          const cp = payload?.client_profile_id ?? payload?.clientProfileId ?? null;
          if (cp) setMyClientProfileId(String(cp));
        }
      }
    } catch { /* ignore */ }

    let mounted = true;
    const setup = async () => {
      try {
        let convId = conversationId;
        if (!convId) {
          if (!participantId) return;
          const resp = await apiCallWithManualRefresh(() => createConversation(participantId));
          const payload = resp?.data ?? resp ?? null;
          const conv = payload?.data ?? payload ?? null;
          convId = conv?.id ?? conv?.conversationId ?? null;
          if (!convId) return;
          if (mounted) setConversationId(convId);
          if (onOpen) onOpen(convId);
        } else {
          if (onOpen) onOpen(convId);
        }

        // load recent messages
        try {
          const res = await getMessages(convId!, 1, 200);
          const raw = res?.data?.items ?? res?.items ?? res?.data ?? res ?? [];
          const items = Array.isArray(raw) ? raw.slice().reverse() : [];
          if (mounted) setMessages(items);
          scrollToBottom();
        } catch (err) {
          console.warn('ChatWindow: failed to load messages', err);
        }

        // start SignalR
        const token = tokenStorage.get();
        const conn = new HubConnectionBuilder()
          .withUrl(HUB_URL, { accessTokenFactory: () => token ?? '' })
          .configureLogging(LogLevel.Error)
          .withAutomaticReconnect()
          .build();

        conn.on('MessageReceived', (payload: any) => {
          const msg = payload?.message ?? payload ?? null;
          if (!msg) return;
          setMessages((prev) => {
            // if we already have this exact server id, nothing to do
            if (prev.some((m) => m.id === msg.id)) return prev;

            // remove any optimistic placeholder that likely represents this message
            const withoutOptimistic = prev.filter((m) => {
              if (!m._optimistic) return true;
              const contentsMatch = !!m.content && !!msg.content && m.content === msg.content;
              const imagesMatch = Array.isArray(m.images) && Array.isArray(msg.images) && m.images.length === msg.images.length;
              // if content OR images count match, assume it's the same message and drop the optimistic one
              if (contentsMatch || imagesMatch) return false;
              return true;
            });

            return [...withoutOptimistic, msg];
          });
          scrollToBottom();
        });

        const handleTypingEvent = (payload: any) => {
          try {
            const pConvId = payload?.conversationId ?? payload?.conversation?.id ?? null;
            if (pConvId && String(pConvId).trim() !== String(convId).trim()) return;
            const senderId = payload?.userId ?? payload?.user?.clientProfileId ?? payload?.senderClientProfileId ?? null;
            if (senderId && myClientProfileId && String(senderId) === String(myClientProfileId)) return;
            setOtherTyping(true);
            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = window.setTimeout(() => setOtherTyping(false), 2500);
          } catch { /* ignore */ }
        };

        conn.on('UserTyping', handleTypingEvent);
        conn.on('Typing', handleTypingEvent);

        conn.onclose((e) => console.debug('Chat hub closed', e));

        await conn.start();
        await conn.invoke('JoinConversation', String(convId).trim());
        setConnection(conn);
      } catch (e) {
        console.error('ChatWindow setup error', e);
      }
    };

    void setup();

    return () => {
      mounted = false;
      if (connection) {
        try { connection.off('Typing'); connection.off('UserTyping'); } catch { }
        try { connection.invoke('LeaveConversation', conversationId).catch(() => { }); } catch { }
        connection.stop().catch(() => { });
      }
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
      if (localStopTypingTimerRef.current) window.clearTimeout(localStopTypingTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantId, conversationId, myClientProfileId]);

  const notifyTyping = (started = true) => {
    if (!conversationId || !connection) return;
    try {
      if ((connection as any).state === 'Connected') {
        if (started) void connection.invoke('StartTyping', conversationId).catch(() => { });
        else void connection.invoke('StopTyping', conversationId).catch(() => { });
      } else {
        void connection.invoke('SetTyping', conversationId, started).catch(() => { });
      }
    } catch { }
  };

  const handleInputChange = (val: string) => {
    setText(val);
    notifyTyping(true);
    if (localStopTypingTimerRef.current) window.clearTimeout(localStopTypingTimerRef.current);
    localStopTypingTimerRef.current = window.setTimeout(() => notifyTyping(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setPendingFiles(files);
  };

  const isMessageFromMe = (senderId?: string | null) => {
    if (!senderId) return false;
    if (senderId === 'me') return true;
    if (myClientProfileId && String(senderId) === String(myClientProfileId)) return true;
    return false;
  };

  const send = async () => {
    if ((!text || text.trim().length === 0) && pendingFiles.length === 0) return;
    if (!conversationId) return;
    setIsSending(true);
    const tmpId = 'tmp-' + Date.now();

    const previewUrls = pendingFiles.map((f) => URL.createObjectURL(f));
    const optimistic: Msg = { id: tmpId, conversationId, senderClientProfileId: 'me', content: text || null, images: previewUrls.length ? previewUrls : undefined, createdAt: new Date().toISOString(), _optimistic: true };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    try {
      if (pendingFiles.length > 0) {
        // use multipart endpoint
        const resp = await apiCallWithManualRefresh(() => postMessageWithFiles(conversationId, text || null, pendingFiles));
        const payload = resp?.data?.message ?? resp?.data ?? resp ?? null;
        if (payload) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.id)) return prev;
            const withoutOptimistic = prev.filter((m) => {
              if (!m._optimistic) return true;
              const contentsMatch = !!m.content && !!payload.content && m.content === payload.content;
              const imagesMatch = Array.isArray(m.images) && Array.isArray(payload.images) && m.images.length === payload.images.length;
              if (contentsMatch || imagesMatch) return false;
              return true;
            });
            return [...withoutOptimistic, payload];
          });
        }
        setText('');
        setPendingFiles([]);
        setIsSending(false);
        return;
      }

      // try SignalR send
      if (connection && connection.state === 'Connected') {
        try {
          await connection.invoke('SendMessage', conversationId, { content: text || null, imageObjectNames: [] });
          setText('');
          setIsSending(false);
          return;
        } catch (err) {
          console.warn('ChatWindow: hub send failed, falling back to REST', err);
        }
      }

      // fallback REST handling
      const resp = await apiCallWithManualRefresh(() => postMessage(conversationId, text || null, []));
      const payload = resp?.data?.message ?? resp?.data ?? resp ?? null;
      if (payload) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          const withoutOptimistic = prev.filter((m) => {
            if (!m._optimistic) return true;
            const contentsMatch = !!m.content && !!payload.content && m.content === payload.content;
            const imagesMatch = Array.isArray(m.images) && Array.isArray(payload.images) && m.images.length === payload.images.length;
            if (contentsMatch || imagesMatch) return false;
            return true;
          });
          return [...withoutOptimistic, payload];
        });
      }
      setText('');
    } catch (e: any) {
      console.error('ChatWindow: send failed', e?.response?.data ?? e?.message ?? e);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-16 md:pt-20 h-[calc(100vh-4rem)] w-full bg-muted/10 flex items-stretch">
        <div className="bg-card border border-border rounded-none p-4 flex flex-col w-full h-full">
          <header className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">←</Button>
              <h3 className="font-semibold">{chat?.title || 'Chat'}</h3>
            </div>
            <div className="text-xs text-muted-foreground">{conversationId ? String(conversationId).slice(0, 8).toUpperCase() : ''}</div>
          </header>

          <div ref={messagesRef} className="flex-1 overflow-auto space-y-3 p-2 bg-muted/10 rounded mb-3">
            {messages.map((m) => {
              const fromMe = isMessageFromMe(m.senderClientProfileId);
              return (
                <div key={m.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-lg shadow-sm ${fromMe ? 'bg-sky-500 text-white rounded-br-none' : 'bg-white border border-border text-foreground rounded-bl-none'}`}>
                    <div className="text-xs text-muted-foreground mb-1 text-white">{fromMe ? (chat?.you || 'You') : (chat?.interlocutor || 'Interlocutor')}</div>
                    {m.content && <div className="whitespace-pre-wrap">{m.content}</div>}
                    {m.images && m.images.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {m.images.map((img, i) => (
                          <img key={i} src={img} alt={`img-${i}`} className="w-full h-24 object-cover rounded" />
                        ))}
                      </div>
                    )}
                    <div className={`text-xs mt-2 ${fromMe ? 'text-white/80 text-right' : 'text-muted-foreground text-right'}`}>{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 items-end">
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isSending || pendingFiles.length >= 1} aria-label={chat?.attach || 'Attach file'}>
                <Paperclip className="w-4 h-4" />
              </Button>
              {pendingFiles.length > 0 && <div className="text-xs text-muted-foreground">{pendingFiles.length} {pendingFiles.length === 1 ? (chat?.imageSelectedLabel || 'image selected') : (chat?.imagesSelectedLabel || 'images selected')}</div>}
            </div>

            <div className="flex-1">
              <Input value={text} onChange={(e) => handleInputChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder={chat?.typeMessagePlaceholder || chat?.placeholder || 'Write a message...'} />
              {otherTyping && <div className="text-xs text-muted-foreground italic mt-1">{chat?.typing || 'Typing...'}</div>}
            </div>

            <Button onClick={send} disabled={isSending || (text.trim().length === 0 && pendingFiles.length === 0)}>{isSending ? (chat?.sending || 'Sending...') : (chat?.send || 'Send')}</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;
