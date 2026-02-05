import { authHttp } from './httpClient';
import type { AxiosProgressEvent } from 'axios';

export async function getConversations(): Promise<any> {
  const url = `/conversations`;
  const response = await authHttp.get(url);
  return response;
}

export async function createConversation(participantId: string): Promise<any> {
  const url = `/conversations`;
  const response = await authHttp.post(url, { participantId });
  console.log('createConversation response:', response);
  return response;
}

export async function getMessages(conversationId: string, page = 1, pageSize = 50): Promise<any> {
  const url = `/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`;
  const response = await authHttp.get(url);
  return response;
}

export async function postMessage(conversationId: string, content?: string | null, imageObjectNames: string[] = []): Promise<any> {
  const url = `/conversations/${conversationId}/messages`;
  // Some APIs expect conversationId in the request body as well for validation
  const response = await authHttp.post(url, { conversationId, content, imageObjectNames });
  return response;
}

export async function postMessageWithFiles(
  conversationId: string,
  content: string | null,
  files: File[],
  existingObjectNames?: string[]
): Promise<any> {
  // Use an upload-specific route if your backend exposes one; fall back to messages endpoint otherwise
  const url = `/conversations/${encodeURIComponent(conversationId)}/messages/upload`;

  const fd = new FormData();
  // Use field names matching the server binding (case-insensitive on many backends)
  if (content) fd.append('Content', content);

  // Append files under 'Files' so ASP.NET IFormFile list binding (List<IFormFile> Files) works
  files.forEach((f) => fd.append('Files', f));

  // Allow passing previously-uploaded object names (if server supports it)
  if (existingObjectNames && existingObjectNames.length) {
    existingObjectNames.forEach((name) => fd.append('ExistingImageObjectNames', name));
  }

  // Do not set Content-Type header; axios/authHttp will set it including the boundary
  const response = await authHttp.post(url, fd, {
    // optional: track upload progress in the browser
    onUploadProgress: (ev: AxiosProgressEvent) => {
      try {
        const loaded = (ev as any)?.loaded ?? 0;
        const total = (ev as any)?.total ?? 1;
        const pct = Math.round((loaded * 100) / (total || 1));
        // keep console for now; consumers can replace with a callback if needed
        console.debug('postMessageWithFiles upload:', pct, '%');
      } catch {}
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });

  return response;
}
