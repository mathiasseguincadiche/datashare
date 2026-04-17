import { useState } from 'react';
import { extractApiErrorMessage } from '../services/api';
import * as filesService from '../services/files.service';
import { UploadOptions, UploadResponse } from '../types/file.types';

// Aligne avec le backend : MAX_FILE_SIZE = 1 GB.
const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024 * 1024;
const MAX_FILE_SIZE_LABEL = '1 Go';

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

    // Validation cote client : evite un aller-retour reseau inutile si le fichier depasse la limite.
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `Le fichier depasse la taille maximale autorisee (${MAX_FILE_SIZE_LABEL}).`,
      );
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
