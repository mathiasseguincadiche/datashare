import Button from '../ui/Button';
import Input from '../ui/Input';
import { FileInfo } from '../../types/file.types';
import { formatDate } from '../../utils/formatDate';
import { formatSize } from '../../utils/formatSize';

interface DownloadPanelProps {
  fileInfo: FileInfo;
  password: string;
  downloading: boolean;
  onPasswordChange: (value: string) => void;
  onDownload: () => void;
}

export default function DownloadPanel({
  fileInfo,
  password,
  downloading,
  onPasswordChange,
  onDownload,
}: DownloadPanelProps) {
  return (
    <section className="panel panel--download">
      <div data-cy="file-info" className="panel__meta">
        <p className="panel__eyebrow">Lien public</p>
        <h1>{fileInfo.originalName}</h1>
        <p>
          {formatSize(fileInfo.size)} · Expire le {formatDate(fileInfo.expiresAt)}
        </p>
      </div>

      {fileInfo.isPasswordProtected ? (
        <Input
          type="password"
          name="download-password"
          label="Mot de passe requis"
          placeholder="Renseigne le mot de passe du fichier"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
      ) : null}

      <Button data-cy="download-btn" block onClick={onDownload} disabled={downloading}>
        {downloading ? 'Telechargement...' : 'Telecharger'}
      </Button>
    </section>
  );
}
