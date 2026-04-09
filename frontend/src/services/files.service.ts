import api, { publicApi } from './api';
import {
  FileInfo,
  HistoryItem,
  UploadOptions,
  UploadResponse,
} from '../types/file.types';

export async function uploadFile(
  file: File,
  options?: UploadOptions,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  if (options?.expiresInDays) {
    formData.append('expiresInDays', options.expiresInDays.toString());
  }

  if (options?.password) {
    formData.append('password', options.password);
  }

  const response = await api.post<UploadResponse>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function getHistory(): Promise<HistoryItem[]> {
  const response = await api.get<HistoryItem[]>('/files/history');
  return response.data;
}

export async function deleteFile(fileId: string): Promise<void> {
  await api.delete(`/files/${fileId}`);
}

export async function getFileInfo(token: string): Promise<FileInfo> {
  const response = await publicApi.get<FileInfo>(`/files/${token}/info`);
  return response.data;
}

function getFileNameFromDispositionHeader(contentDisposition?: string): string {
  if (!contentDisposition) {
    return 'fichier';
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const fallbackMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (fallbackMatch?.[1]) {
    return fallbackMatch[1];
  }

  return 'fichier';
}

export async function downloadFile(
  token: string,
  password?: string,
): Promise<void> {
  const response = await publicApi.post(
    `/files/${token}/download`,
    { password },
    { responseType: 'blob' },
  );

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute(
    'download',
    getFileNameFromDispositionHeader(response.headers['content-disposition']),
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
