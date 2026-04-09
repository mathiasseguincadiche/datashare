import Button from '../ui/Button';
import UploadOptions from './UploadOptions';
import { formatSize } from '../../utils/formatSize';

interface UploadFormProps {
  file: File | null;
  expiresInDays: number;
  password: string;
  loading: boolean;
  onFileChange: (file: File | null) => void;
  onExpiresInDaysChange: (value: number) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export default function UploadForm({
  file,
  expiresInDays,
  password,
  loading,
  onFileChange,
  onExpiresInDaysChange,
  onPasswordChange,
  onSubmit,
}: UploadFormProps) {
  return (
    <form className="form-card form-card--wide" data-cy="upload-form" onSubmit={onSubmit}>
      <div className="dropzone">
        <span className="dropzone__caption">Sélectionne un fichier à partager</span>
        <input
          data-cy="file-input"
          type="file"
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
          required
        />
        {file ? (
          <p className="dropzone__meta">
            {file.name} · {formatSize(file.size)}
          </p>
        ) : (
          <p className="dropzone__meta">
            Le lien public sera généré après validation.
          </p>
        )}
      </div>

      <UploadOptions
        expiresInDays={expiresInDays}
        password={password}
        onExpiresInDaysChange={onExpiresInDaysChange}
        onPasswordChange={onPasswordChange}
      />

      <Button data-cy="submit" type="submit" block disabled={loading || !file}>
        {loading ? 'Upload en cours...' : 'Téléverser'}
      </Button>
    </form>
  );
}
