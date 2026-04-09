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
