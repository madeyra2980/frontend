import { useSearchParams } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://backend-2-jbcd.onrender.com';

export default function Login() {
  const [searchParams] = useSearchParams();
  const fromError = searchParams.get('error');

  const googleLogin = () => {
    window.location.href = `${BACKEND_URL || ''}/auth/google`;
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: '48px auto' }}>
      <h1 style={{ marginBottom: 8 }}>Вход</h1>
      {fromError && (
        <p className="error-message">
          {fromError === 'auth_failed' && 'Ошибка входа через Google'}
          {fromError === 'oauth_not_configured' && 'OAuth не настроен на сервере'}
          {fromError === 'missing_token' && 'Не получен токен авторизации'}
          {!['auth_failed', 'oauth_not_configured', 'missing_token'].includes(fromError) && fromError}
        </p>
      )}
      <p style={{ marginTop: 24 }}>
        <button type="button" className="btn btn-primary" onClick={googleLogin} style={{ width: '100%' }}>
          Войти через Google
        </button>
      </p>
    </div>
  );
}
