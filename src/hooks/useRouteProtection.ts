import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useRouteProtection = (requireAuth: boolean = true) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        navigate('/login');
      } else if (!requireAuth && user) {
        navigate('/map');
      }
    }
  }, [user, loading, requireAuth, navigate]);

  return { user, loading };
};