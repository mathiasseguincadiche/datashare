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
