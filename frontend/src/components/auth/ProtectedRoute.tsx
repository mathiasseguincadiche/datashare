import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import Loader from '../ui/Loader';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader label="Verification de la session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
