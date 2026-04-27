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
        <Link to="/login">J&apos;ai déjà un compte</Link>
      </p>
    </section>
  );
}
