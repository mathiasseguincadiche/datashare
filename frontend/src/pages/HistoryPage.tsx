import { useEffect, useState } from 'react';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import Switch from '../components/ui/Switch';
import FileList from '../components/files/FileList';
import * as filesService from '../services/files.service';
import { extractApiErrorMessage } from '../services/api';
import { HistoryItem } from '../types/file.types';

type FileFilter = 'all' | 'active' | 'expired';

const FILTER_OPTIONS: { label: string; value: FileFilter }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Actifs', value: 'active' },
  { label: 'Expiré', value: 'expired' },
];

function isExpired(file: HistoryItem): boolean {
  return new Date(file.expiresAt) < new Date();
}

export default function HistoryPage() {
  const [files, setFiles] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filter, setFilter] = useState<FileFilter>('all');

  useEffect(() => {
    void loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const history = await filesService.getHistory();
      setFiles(history);
    } catch (historyError) {
      setError(
        extractApiErrorMessage(
          historyError,
          "Impossible de charger l'historique.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (token: string) => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/download/${token}`,
    );
    setFeedback('Lien public copié dans le presse-papiers.');
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm('Supprimer ce fichier définitivement ?')) {
      return;
    }

    try {
      await filesService.deleteFile(fileId);
      setFiles((currentFiles) =>
        currentFiles.filter((currentFile) => currentFile.id !== fileId),
      );
      setFeedback('Fichier supprimé avec succès.');
    } catch (deleteError) {
      setError(
        extractApiErrorMessage(deleteError, 'Erreur lors de la suppression.'),
      );
    }
  };

  const filteredFiles = files.filter((file) => {
    if (filter === 'active') return !isExpired(file);
    if (filter === 'expired') return isExpired(file);
    return true;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <section className="page-grid" data-cy="history-page">
      <div className="panel panel--hero">
        <p className="page-eyebrow">Mon espace</p>
        <h1>Mes fichiers</h1>
      </div>

      <Switch options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

      {error ? <Alert tone="error" message={error} /> : null}
      {feedback ? <Alert tone="success" message={feedback} /> : null}

      <FileList files={filteredFiles} onCopy={handleCopy} onDelete={handleDelete} />
    </section>
  );
}
