import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import * as filesService from '../services/files.service';
import { extractApiErrorMessage } from '../services/api';
import { formatSize } from '../utils/formatSize';
import { formatDate } from '../utils/formatDate';
import { FileInfo } from '../types/file.types';

export default function DownloadPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [password, setPassword] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    filesService
      .getFileInfo(token)
      .then((info) => {
        setFileInfo(info);
      })
      .catch((loadError: unknown) => {
        setError(
          extractApiErrorMessage(loadError, 'Fichier introuvable ou expiré.'),
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!token) return;
    setError(null);
    setDownloading(true);

    try {
      await filesService.downloadFile(token, password || undefined);
      setSuccess(true);
    } catch (downloadError) {
      setError(
        extractApiErrorMessage(downloadError, 'Mot de passe incorrect ou téléchargement impossible.'),
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <section className="page-grid" data-cy="download-page">
      <div className="panel panel--download">
        <div className="panel__meta">
          <h1>Télécharger un fichier</h1>

          {fileInfo ? (
            <>
              <p>
                📄 <strong>{fileInfo.originalName}</strong>
              </p>
              {fileInfo.size ? <p>{formatSize(fileInfo.size)}</p> : null}
              {fileInfo.expiresAt ? (
                <p>Expire le {formatDate(fileInfo.expiresAt)}</p>
              ) : null}
            </>
          ) : null}
        </div>

        {error ? <Alert tone="error" message={error} /> : null}

        {!success && fileInfo?.hasPassword ? (
          <form className="download-form" onSubmit={handleDownload}>
            <Input
              label="Mot de passe"
              type="password"
              placeholder="Requis pour accéder au fichier"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Button type="submit" block disabled={downloading}>
              {downloading ? 'Téléchargement...' : 'Télécharger'}
            </Button>
          </form>
        ) : null}

        {!success && fileInfo && !fileInfo.hasPassword ? (
          <div className="download-form">
            <Button block onClick={() => handleDownload()} disabled={downloading}>
              {downloading ? 'Téléchargement...' : 'Télécharger'}
            </Button>
          </div>
        ) : null}

        {success ? (
          <div className="download-success">
            <Alert tone="success" message="Fichier téléchargé avec succès !" />
            <p>Le fichier a été téléchargé dans ton dossier de téléchargements.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
