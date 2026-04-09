import { useState } from 'react';
import { extractApiErrorMessage } from '../services/api';
import * as filesService from '../services/files.service';
import { UploadOptions, UploadResponse } from '../types/file.types';

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submitUpload = async (options: UploadOptions) => {
    if (!selectedFile) {
      setError('Selectionne un fichier avant de lancer lenvoi.');
      return null;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await filesService.uploadFile(selectedFile, options);
      setResult(response);
      return response;
    } catch (uploadError) {
      setError(
        extractApiErrorMessage(
          uploadError,
          'Erreur lors de lupload du fichier.',
        ),
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetUploadState = () => {
    setResult(null);
    setError(null);
  };

  return {
    error,
    loading,
    result,
    selectedFile,
    setSelectedFile,
    resetUploadState,
    submitUpload,
  };
}
