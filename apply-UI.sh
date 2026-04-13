#!/usr/bin/env bash
# =============================================================
# apply-UI.sh — Fiche 9 COMPLET + Corrections Figma v2
# Exécuter depuis la racine du projet /datashare : ./apply-all.sh
# =============================================================
set -euo pipefail

BASE="frontend/src"

echo "🚀 Application complète — 15 fichiers (Fiche 9 + Figma v2)"
echo "=============================================================="

# --- Vérification ---
if [ ! -d "$BASE" ]; then
  echo "❌ Dossier $BASE introuvable. Lance ce script depuis la racine du projet."
  exit 1
fi

# --- Création des dossiers manquants ---
mkdir -p "$BASE/components/auth"
mkdir -p "$BASE/components/files"
mkdir -p "$BASE/components/layout"
mkdir -p "$BASE/components/ui"
mkdir -p "$BASE/pages"

echo ""

# =============================================================
# 1) RegisterForm.tsx
# =============================================================
echo "🔴 1/15 — components/auth/RegisterForm.tsx"
cat > "$BASE/components/auth/RegisterForm.tsx" << 'EOF'
import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface RegisterFormProps {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export default function RegisterForm({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: RegisterFormProps) {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setConfirmError(null);

    if (password !== confirmPassword) {
      setConfirmError('Les mots de passe ne correspondent pas.');
      return;
    }

    onSubmit(event);
  };

  return (
    <form className="form-card" data-cy="register-form" onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        placeholder="exemple@email.com"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        required
      />
      <Input
        label="Mot de passe"
        type="password"
        placeholder="Minimum 6 caractères"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        required
      />
      <Input
        label="Vérification du mot de passe"
        type="password"
        placeholder="Retapez le mot de passe"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={confirmError || undefined}
        required
      />
      <Button data-cy="submit" type="submit" block disabled={loading}>
        {loading ? 'Inscription...' : 'Créer mon compte'}
      </Button>
    </form>
  );
}
EOF

# =============================================================
# 2) RegisterPage.tsx
# =============================================================
echo "🔴 2/15 — pages/RegisterPage.tsx"
cat > "$BASE/pages/RegisterPage.tsx" << 'EOF'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import Alert from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { extractApiErrorMessage } from '../services/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register({ email, password });
      navigate('/login');
    } catch (registerError) {
      setError(
        extractApiErrorMessage(registerError, "Erreur lors de l'inscription."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page" data-cy="register-page">
      <div className="auth-page__intro">
        <h1>Créer un compte</h1>
      </div>

      {error ? <Alert tone="error" message={error} /> : null}

      <RegisterForm
        email={email}
        password={password}
        loading={loading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />

      <p className="auth-page__aside">
        <Link to="/login">J'ai déjà un compte</Link>
      </p>
    </section>
  );
}
EOF

# =============================================================
# 3) Switch.tsx (NOUVEAU)
# =============================================================
echo "🔴 3/15 — components/ui/Switch.tsx (nouveau)"
cat > "$BASE/components/ui/Switch.tsx" << 'EOF'
interface SwitchOption<T extends string> {
  label: string;
  value: T;
}

interface SwitchProps<T extends string> {
  options: SwitchOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function Switch<T extends string>({
  options,
  value,
  onChange,
}: SwitchProps<T>) {
  return (
    <div className="switch" data-cy="switch">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`switch__option ${
            value === option.value ? 'switch__option--active' : ''
          }`}
          data-cy={`switch-${option.value}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
EOF

# =============================================================
# 4) FileCard.tsx (v2 — icônes 📄 + 🔒)
# =============================================================
echo "🔴 4/15 — components/files/FileCard.tsx (v2)"
cat > "$BASE/components/files/FileCard.tsx" << 'EOF'
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
EOF

# =============================================================
# 5) FileList.tsx
# =============================================================
echo "🔴 5/15 — components/files/FileList.tsx"
cat > "$BASE/components/files/FileList.tsx" << 'EOF'
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
EOF

# =============================================================
# 6) HistoryPage.tsx
# =============================================================
echo "🔴 6/15 — pages/HistoryPage.tsx"
cat > "$BASE/pages/HistoryPage.tsx" << 'EOF'
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
EOF

# =============================================================
# 7) Navbar.tsx (v2 — contextuel Figma)
# =============================================================
echo "🟠 7/15 — components/layout/Navbar.tsx (v2)"
cat > "$BASE/components/layout/Navbar.tsx" << 'EOF'
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  return (
    <header className="shell__header">
      <div className="brand">
        <NavLink to="/" className="brand__title">
          DataShare
        </NavLink>
      </div>

      <nav className="nav">
        {isAuthenticated ? (
          isHome ? (
            <Button
              variant="primary"
              onClick={() => navigate('/upload')}
            >
              Mon espace
            </Button>
          ) : (
            <>
              <NavLink to="/history" className="nav__link">
                Mes fichiers
              </NavLink>
              <Button variant="ghost" onClick={handleLogout}>
                Déconnexion
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/upload')}
              >
                Ajouter des fichiers
              </Button>
            </>
          )
        ) : (
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
          >
            Se connecter
          </Button>
        )}
      </nav>
    </header>
  );
}
EOF

# =============================================================
# 8) LoginPage.tsx
# =============================================================
echo "🟠 8/15 — pages/LoginPage.tsx"
cat > "$BASE/pages/LoginPage.tsx" << 'EOF'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import Alert from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { extractApiErrorMessage } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      navigate('/upload');
    } catch (loginError) {
      setError(
        extractApiErrorMessage(loginError, 'Identifiants invalides.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page" data-cy="login-page">
      <div className="auth-page__intro">
        <h1>Connexion</h1>
      </div>

      {error ? <Alert tone="error" message={error} /> : null}

      <LoginForm
        email={email}
        password={password}
        loading={loading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />

      <p className="auth-page__aside">
        <Link to="/register">Créer un compte</Link>
      </p>
    </section>
  );
}
EOF

# =============================================================
# 9) LoginForm.tsx
# =============================================================
echo "🟠 9/15 — components/auth/LoginForm.tsx"
cat > "$BASE/components/auth/LoginForm.tsx" << 'EOF'
import Button from '../ui/Button';
import Input from '../ui/Input';

interface LoginFormProps {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export default function LoginForm({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <form className="form-card" data-cy="login-form" onSubmit={onSubmit}>
      <Input
        label="Email"
        type="email"
        placeholder="exemple@email.com"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        required
      />
      <Input
        label="Mot de passe"
        type="password"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        required
      />
      <Button data-cy="submit" type="submit" block disabled={loading}>
        {loading ? 'Connexion...' : 'Connexion'}
      </Button>
    </form>
  );
}
EOF

# =============================================================
# 10) UploadForm.tsx
# =============================================================
echo "🟠 10/15 — components/files/UploadForm.tsx"
cat > "$BASE/components/files/UploadForm.tsx" << 'EOF'
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
EOF

# =============================================================
# 11) UploadPage.tsx
# =============================================================
echo "🟠 11/15 — pages/UploadPage.tsx"
cat > "$BASE/pages/UploadPage.tsx" << 'EOF'
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
EOF

# =============================================================
# 12) Footer.tsx
# =============================================================
echo "🟠 12/15 — components/layout/Footer.tsx"
cat > "$BASE/components/layout/Footer.tsx" << 'EOF'
export default function Footer() {
  return (
    <footer className="shell__footer">
      <p>Copyright DataShare® 2025</p>
    </footer>
  );
}
EOF

# =============================================================
# 13) HomePage.tsx (NOUVEAU)
# =============================================================
echo "🔴 13/15 — pages/HomePage.tsx (nouveau)"
cat > "$BASE/pages/HomePage.tsx" << 'EOF'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(isAuthenticated ? '/upload' : '/login');
  };

  return (
    <section className="page-grid" data-cy="home-page">
      <div className="home-landing">
        <h1>Tu veux partager un fichier ?</h1>
        <button
          className="home-landing__icon"
          data-cy="home-upload-btn"
          onClick={handleClick}
          aria-label="Partager un fichier"
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>
      </div>
    </section>
  );
}
EOF

# =============================================================
# 14) App.tsx
# =============================================================
echo "🔴 14/15 — App.tsx"
cat > "$BASE/App.tsx" << 'EOF'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import { AuthProvider } from './context/AuthContext';
import DownloadPage from './pages/DownloadPage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import './App.css';

function AppShell() {
  return (
    <div className="shell">
      <Navbar />
      <main className="shell__content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/download/:token" element={<DownloadPage />} />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
EOF

# =============================================================
# 15) App.css — COMPLET v2 (switch saumon + boutons saumon + download)
# =============================================================
echo "🎨 15/15 — App.css (remplacement complet v2)"
cat > "$BASE/App.css" << 'EOF'
:root {
  --bg: #f6f3ec;
  --bg-accent: linear-gradient(180deg, #e8967a 0%, #f0b08a 30%, #f5cba7 55%, #f6ead8 80%, #f6f3ec 100%);
  --surface: rgba(255, 255, 255, 0.82);
  --surface-strong: rgba(255, 255, 255, 0.92);
  --border: rgba(26, 54, 54, 0.12);
  --text: #173433;
  --muted: #5d6f6c;
  --primary: #106b61;
  --primary-dark: #0b5049;
  --accent: #e8967a;
  --accent-dark: #d4755e;
  --secondary: #f0a500;
  --danger: #b64735;
  --shadow: 0 18px 50px rgba(30, 40, 52, 0.08);
  --radius-lg: 28px;
  --radius-md: 18px;
  --radius-sm: 12px;
}

body {
  background: var(--bg-accent);
  background-attachment: fixed;
  color: var(--text);
}

a {
  color: inherit;
}

.shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.shell__header,
.shell__footer,
.shell__content {
  width: min(1120px, calc(100vw - 2rem));
  margin: 0 auto;
}

.shell__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem 0;
}

.shell__content {
  padding: 1rem 0 3rem;
}

.shell__footer {
  padding: 1.25rem 0 2rem;
  color: var(--muted);
  font-size: 0.95rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.brand__title {
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.nav__link {
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  color: var(--muted);
  transition: 180ms ease;
}

.nav__link.active,
.nav__link:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.75);
}

.page-grid {
  display: grid;
  gap: 1.25rem;
}

.page-eyebrow {
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.76rem;
  color: var(--primary);
  font-weight: 700;
}

.panel,
.form-card,
.empty-state,
.auth-page {
  border: 1px solid var(--border);
  background: var(--surface);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.panel {
  padding: 1.6rem;
}

.panel--hero {
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.92),
    rgba(246, 243, 236, 0.78)
  ),
  linear-gradient(135deg, rgba(16, 107, 97, 0.15), rgba(240, 165, 0, 0.12));
}

.panel--success {
  background: linear-gradient(
    180deg,
    rgba(245, 255, 250, 0.95) 0%,
    rgba(255, 255, 255, 0.88) 100%
  );
}

.panel--download {
  max-width: 36rem;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.96),
    rgba(240, 248, 246, 0.9)
  ),
  radial-gradient(circle at top right, rgba(16, 107, 97, 0.18), transparent 32%);
}

.panel__meta h1,
.panel__meta h2,
.panel--hero h1,
.auth-page h1 {
  margin: 0 0 0.65rem;
}

.panel__meta p:last-child,
.panel--hero p:last-child,
.auth-page p:last-child {
  margin-bottom: 0;
}

.panel__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.auth-page {
  max-width: 34rem;
  margin: 2rem auto;
  padding: 2rem;
  display: grid;
  gap: 1.25rem;
}

.auth-page__intro p {
  color: var(--muted);
}

.auth-page__aside {
  margin: 0;
  color: var(--muted);
}

.form-card {
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
}

.form-card--wide {
  gap: 1.25rem;
}

.field {
  display: grid;
  gap: 0.4rem;
}

.field__label {
  font-weight: 600;
}

.field__hint,
.field__error {
  font-size: 0.9rem;
}

.field__hint {
  color: var(--muted);
}

.field__error {
  color: var(--danger);
}

.input {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(23, 52, 51, 0.16);
  background: var(--surface-strong);
  color: var(--text);
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.input:focus {
  border-color: rgba(16, 107, 97, 0.55);
  box-shadow: 0 0 0 4px rgba(16, 107, 97, 0.12);
}

.input--error {
  border-color: rgba(182, 71, 53, 0.45);
}

.button {
  border: none;
  border-radius: 999px;
  padding: 0.92rem 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
}

.button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.button--block {
  width: 100%;
}

.button--primary {
  color: white;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  box-shadow: 0 10px 20px rgba(16, 107, 97, 0.2);
}

.button--secondary {
  color: var(--text);
  background: linear-gradient(135deg, #ffd166, #f0a500);
}

.button--ghost {
  color: var(--text);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--border);
}

.button--danger {
  color: white;
  background: linear-gradient(135deg, #d96350, var(--danger));
}

/* === v2 — Navbar buttons DARK (Figma Components Header) === */
.shell__header .button--primary {
  background: linear-gradient(135deg, #1a3636, #132b2a);
  box-shadow: 0 10px 20px rgba(23, 52, 51, 0.3);
}

/* === v2 — Boutons formulaire saumon (Figma) === */
.form-card .button--primary,
.auth-page .button--primary,
.download-form .button--primary,
.download-form .button {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  box-shadow: 0 10px 20px rgba(232, 150, 122, 0.25);
  color: white;
}

/* === v2 — Bouton Accéder FileCard saumon === */
.file-card__actions .button--secondary {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 10px 20px rgba(232, 150, 122, 0.2);
}

.alert {
  padding: 1rem 1.1rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
}

.alert p {
  margin: 0;
}

.alert--info {
  color: #173433;
  background: rgba(16, 107, 97, 0.08);
  border-color: rgba(16, 107, 97, 0.15);
}

.alert--success {
  color: #0b5049;
  background: rgba(81, 183, 146, 0.12);
  border-color: rgba(81, 183, 146, 0.24);
}

.alert--error {
  color: #7f2a1d;
  background: rgba(182, 71, 53, 0.09);
  border-color: rgba(182, 71, 53, 0.18);
}

.loader {
  min-height: 14rem;
  display: grid;
  place-content: center;
  gap: 0.9rem;
  color: var(--muted);
  text-align: center;
}

.loader__spinner {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  border: 4px solid rgba(16, 107, 97, 0.12);
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
  justify-self: center;
}

.dropzone {
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px dashed rgba(16, 107, 97, 0.35);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.76) 0%,
    rgba(240, 248, 246, 0.9) 100%
  );
}

.dropzone__caption {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.dropzone__meta {
  margin: 0.75rem 0 0;
  color: var(--muted);
}

.upload-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.file-list {
  display: grid;
  gap: 1rem;
}

.file-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.85);
  border-radius: var(--radius-md);
  padding: 1.1rem 1.2rem;
}

.file-card__content h3 {
  margin: 0 0 0.35rem;
}

.file-card__content p {
  margin: 0.15rem 0;
  color: var(--muted);
}

.file-card__actions {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.file-card__lock {
  font-size: 0.85em;
  margin-left: 0.3rem;
}

.file-card__lock-badge {
  font-size: 0.85rem;
  align-self: center;
}

.file-card--expired {
  opacity: 0.55;
}

.file-card--expired h3 {
  text-decoration: line-through;
}

.empty-state {
  padding: 2rem;
  text-align: center;
}

/* === v2 — Switch saumon (Figma) === */
.switch {
  display: inline-flex;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface);
}

.switch__option {
  padding: 0.6rem 1.2rem;
  border: none;
  background: transparent;
  color: var(--muted);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease;
}

.switch__option:hover {
  color: var(--text);
}

.switch__option--active {
  background: var(--accent);
  color: white;
  border-radius: 999px;
}

.home-landing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  gap: 2rem;
}

.home-landing h1 {
  font-size: 1.6rem;
  color: var(--text);
}

.home-landing__icon {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--text), #2a4a49);
  color: white;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.home-landing__icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 60px rgba(30, 40, 52, 0.15);
}

/* === v2 — Download page (Figma Desktop-9 à 12) === */
.download-form {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

.download-success {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 720px) {
  .shell__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .file-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .file-card__actions {
    width: 100%;
    justify-content: stretch;
  }

  .file-card__actions .button {
    width: 100%;
  }

  .panel--download {
    margin: 1rem auto;
  }
}
EOF

# =============================================================
# 16) DownloadPage.tsx — Refonte Figma (Desktop-9 à 12)
# =============================================================
echo "🔧 BONUS — pages/DownloadPage.tsx (refonte Figma v2)"
cat > "$BASE/pages/DownloadPage.tsx" << 'EOF'
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
EOF

# =============================================================
# Nettoyage — suppression de HomeRedirect si existant
# =============================================================
if [ -f "$BASE/components/auth/HomeRedirect.tsx" ]; then
  echo ""
  echo "🗑️  Suppression de HomeRedirect.tsx (plus utilisé)"
  rm "$BASE/components/auth/HomeRedirect.tsx"
fi

echo ""
echo "=============================================================="
echo "✅ 16/16 fichiers appliqués avec succès !"
echo "=============================================================="
echo ""
echo "👉 Lance maintenant :  cd frontend && npm run dev"
echo "   puis ouvre http://localhost:5173"
