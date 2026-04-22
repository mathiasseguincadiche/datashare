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
  return (
    <form className="form-card" data-cy="register-form" onSubmit={onSubmit}>
      <Input
        label="Email"
        type="email"
        placeholder="exemple@email.com"
        data-cy="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        required
      />
      <Input
        label="Mot de passe"
        type="password"
        placeholder="Minimum 6 caractères"
        data-cy="password"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        required
      />
      <Button data-cy="submit" type="submit" block disabled={loading}>
        {loading ? 'Inscription...' : 'Créer mon compte'}
      </Button>
    </form>
  );
}
