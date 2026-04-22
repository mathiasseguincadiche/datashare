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
        data-cy="email"
        label="Email"
        type="email"
        placeholder="exemple@email.com"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        required
      />
      <Input
        data-cy="password"
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
