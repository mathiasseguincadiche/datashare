interface LoaderProps {
  label?: string;
}

export default function Loader({ label = 'Chargement...' }: LoaderProps) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" />
      <span>{label}</span>
    </div>
  );
}
