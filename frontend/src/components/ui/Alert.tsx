interface AlertProps {
  tone?: 'info' | 'success' | 'error';
  message: string | string[];
}

export default function Alert({ tone = 'info', message }: AlertProps) {
  const messages = Array.isArray(message) ? message : [message];

  return (
    <div className={`alert alert--${tone}`} role="alert">
      {messages.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  );
}
