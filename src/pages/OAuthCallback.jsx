import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Страница OAuth callback: получает token из URL после входа через Google,
 * сохраняет в localStorage и редиректит в основное приложение.
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }
    if (!token) {
      navigate('/login?error=missing_token', { replace: true });
      return;
    }
    localStorage.setItem('token', token);
    refreshUser().then(() => navigate('/', { replace: true }));
  }, [token, error, navigate, refreshUser]);

  return (
    <div>
      <p>Вход выполнен. Перенаправление...</p>
    </div>
  );
}
