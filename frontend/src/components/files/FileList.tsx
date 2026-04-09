import { HistoryItem } from '../../types/file.types';
import FileCard from './FileCard';

interface FileListProps {
  files: HistoryItem[];
  onCopy: (token: string) => void;
  onDelete: (id: string) => void;
}

export default function FileList({
  files,
  onCopy,
  onDelete,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="empty-state" data-cy="empty-state">
        <h2>Aucun fichier trouvé</h2>
        <p>Aucun fichier ne correspond à ce filtre.</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          expired={new Date(file.expiresAt) < new Date()}
          onCopy={onCopy}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
