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
