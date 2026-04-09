export interface UploadOptions {
  expiresInDays?: number;
  password?: string;
}

export interface UploadResponse {
  downloadUrl: string;
  expiresAt: string;
  token: string;
  originalName: string;
  size: number;
}

export interface HistoryItem {
  id: string;
  originalName: string;
  size: number;
  createdAt: string;
  expiresAt: string;
  token: string;
}

export interface FileInfo {
  originalName: string;
  size: number;
  mimeType: string;
  expiresAt: string;
  isPasswordProtected: boolean;
}
