import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { HistoryItem } from '../../types/file.types';
import { formatDate } from '../../utils/formatDate';
import { formatSize } from '../../utils/formatSize';

interface FileCardProps {
  file: HistoryItem;
  expired: boolean;
  onCopy: (token: string) => void;
  onDelete: (id: string) => void;
}

export default function FileCard({
  file,
  expired,
  onCopy,
  onDelete,
}: FileCardProps) {
  const navigate = useNavigate();
  const hasPassword = 'hasPassword' in file && Boolean((file as Record<string, unknown>).hasPassword);

  return (
    <div
      className={`file-card ${expired ? 'file-card--expired' : ''}`}
      data-cy="file-card"
    >
      <div className="file-card__content">
        <h3>
          📄 {file.originalName}
          {hasPassword ? <span className="file-card__lock"> 🔒</span> : null}
        </h3>
        <p>
          {formatSize(file.size)} · Envoyé le {formatDate(file.createdAt)}
        </p>
        <p>
          {expired
            ? 'Ce fichier a expiré, il n\'est plus stocké chez nous'
            : `Expire le ${formatDate(file.expiresAt)}`}
        </p>
      </div>

      <div className="file-card__actions">
        {!expired ? (
          <>
            <Button
              variant="danger"
              data-cy="delete-btn"
              onClick={() => onDelete(file.id)}
            >
              Supprimer
            </Button>
            <Button
              variant="secondary"
              data-cy="access-btn"
              onClick={() => navigate(`/download/${file.token}`)}
            >
              Accéder
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
