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
