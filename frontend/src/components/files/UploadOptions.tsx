import Input from '../ui/Input';

interface UploadOptionsProps {
  expiresInDays: number;
  password: string;
  onExpiresInDaysChange: (value: number) => void;
  onPasswordChange: (value: string) => void;
}

export default function UploadOptions({
  expiresInDays,
  password,
  onExpiresInDaysChange,
  onPasswordChange,
}: UploadOptionsProps) {
  return (
    <div className="upload-options">
      <label className="field">
        <span className="field__label">Expiration</span>
        <select
          className="input"
          value={expiresInDays}
          onChange={(event) => onExpiresInDaysChange(Number(event.target.value))}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <option key={day} value={day}>
              {day} jour{day > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </label>

      <Input
        type="password"
        name="password"
        label="Mot de passe optionnel"
        hint="Minimum 6 caracteres si renseigne"
        placeholder="Laisser vide pour aucun mot de passe"
        minLength={6}
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
      />
    </div>
  );
}
