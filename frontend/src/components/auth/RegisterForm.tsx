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
    <form onSubmit={onSubmit}>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        required
        data-cy="email"
      />
      <Input
        label="Mot de passe"
        type="password"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        required
        minLength={8}
        hint="8 caractères minimum"
        data-cy="password"
      />
      <Button type="submit" disabled={loading} data-cy="submit">
        {loading ? 'Inscription...' : 'Créer mon compte'}
      </Button>
    </form>
  );
}
