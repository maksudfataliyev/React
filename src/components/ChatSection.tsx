import { useContext, useState, useRef } from 'react';
import { Send, ArrowLeft, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/features/auth/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: Message[];
}


export const ChatSection = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: crypto.randomUUID(),
      senderId: 'current',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { 
            ...conv, 
            messages: [...conv.messages, message],
            lastMessage: message.text,
            lastMessageTime: (t as any).chat?.justNow || 'Just now',
          }
        : conv
    ));

    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
    } : null);

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;
    // create a local URL for preview; in production upload to server instead
    const url = URL.createObjectURL(file);

    const message: Message = {
      id: crypto.randomUUID(),
      senderId: 'current',
      text: file.name,
      timestamp: new Date().toISOString(),
      imageUrl: url,
    };

    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { 
            ...conv, 
            messages: [...conv.messages, message],
            lastMessage: message.text,
            lastMessageTime: (t as any).chat?.justNow || 'Just now',
          }
        : conv
    ));

    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
    } : null);

    // reset input so same file can be selected again later
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (selectedConversation) {
    return (
      <div className="flex flex-col h-[500px] bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSelectedConversation(null)}
            className="sm:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedConversation.participantAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {selectedConversation.participantName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{selectedConversation.participantName}</h3>
            <p className="text-xs text-muted-foreground">{(t as any).chat?.activeNow || 'Active now'}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedConversation(null)}
            className="hidden sm:flex"
          >
            {(t as any).chat?.backToList || 'Back to list'}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex',
                msg.senderId === 'current' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[75%] p-3 rounded-2xl',
                  msg.senderId === 'current'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                )}
              >
                <p className="text-sm">{msg.text}</p>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt={msg.text} className="mt-2 max-h-40 rounded-md" />
                )}
                <p className={cn(
                  'text-xs mt-1',
                  msg.senderId === 'current' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border bg-background">
          <div className="flex gap-2 items-center">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <Button size="icon" variant="ghost" onClick={handleAttachClick} aria-label="Attach image">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              placeholder={(t as any).chat?.typeMessagePlaceholder || 'Type a message...'}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => setSelectedConversation(conv)}
          className={cn(
            'flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer hover:border-primary/50',
            conv.unread ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
          )}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={conv.participantAvatar} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {conv.participantName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground">{conv.participantName}</span>
              {conv.unread && (
                <span className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{conv.lastMessageTime}</span>
        </div>
      ))}
    </div>
  );
};
