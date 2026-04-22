import { useState } from 'react';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import UploadForm from '../components/files/UploadForm';
import { useFileUpload } from '../hooks/useFileUpload';
import { formatDate } from '../utils/formatDate';
import { formatSize } from '../utils/formatSize';

export default function UploadPage() {
  const {
    error,
    loading,
    result,
    selectedFile,
    setSelectedFile,
    resetUploadState,
    submitUpload,
  } = useFileUpload();
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCopied(false);
    await submitUpload({
      expiresInDays,
      password: password || undefined,
    });
  };

  const handleCopyLink = async () => {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.downloadUrl);
    setCopied(true);
  };

  return (
    <section className="page-grid" data-cy="upload-page">
      <div className="panel panel--hero">
        <p className="page-eyebrow">Téléversement</p>
        <h1>Ajouter un fichier</h1>
        <p>
          Choisis une durée de validité, ajoute un mot de passe si besoin et
          partage ton lien public aussitôt.
        </p>
      </div>

      {error ? <Alert tone="error" message={error} /> : null}

      <UploadForm
        file={selectedFile}
        expiresInDays={expiresInDays}
        password={password}
        loading={loading}
        onFileChange={(file) => {
          resetUploadState();
          setSelectedFile(file);
        }}
        onExpiresInDaysChange={setExpiresInDays}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />

      {result ? (
        <div className="panel panel--success" data-cy="upload-result">
          <p className="page-eyebrow">Lien généré</p>
          <h2>{result.originalName}</h2>
          <p>
            Félicitations, ce fichier sera conservé chez nous pendant une semaine !
          </p>
          <p>
            {formatSize(result.size)} · Expire le {formatDate(result.expiresAt)}
          </p>
          <input
            data-cy="download-link"
            className="input"
            readOnly
            value={result.downloadUrl}
            onFocus={(event) => event.target.select()}
          />
          <div className="panel__actions">
            <Button variant="secondary" data-cy="copy-link" onClick={handleCopyLink}>
              Copier le lien
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedFile(null);
                setPassword('');
                resetUploadState();
              }}
            >
              Préparer un autre envoi
            </Button>
          </div>
          {copied ? (
            <Alert tone="success" message="Lien copié dans le presse-papiers !" />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
