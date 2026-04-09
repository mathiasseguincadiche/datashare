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
