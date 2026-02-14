import { useSearchParams } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://backend-2-jbcd.onrender.com';

function GoogleLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const fromError = searchParams.get('error');

  const googleLogin = () => {
    window.location.href = `${BACKEND_URL || ''}/auth/google`;
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: '48px auto', textAlign: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--color-brand-dark-blue)',
          letterSpacing: '-0.02em',
        }}>
          Komek
        </div>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--color-brand-green)',
          letterSpacing: '0.08em',
          marginTop: 2,
        }}>
          kz
        </div>
      </div>
      <h1 style={{ marginBottom: 8, fontSize: 20 }}>Вход</h1>
      {fromError && (
        <p className="error-message">
          {fromError === 'auth_failed' && 'Ошибка входа через Google'}
          {fromError === 'oauth_not_configured' && 'OAuth не настроен на сервере'}
          {fromError === 'missing_token' && 'Не получен токен авторизации'}
          {!['auth_failed', 'oauth_not_configured', 'missing_token'].includes(fromError) && fromError}
        </p>
      )}
      <p style={{ marginTop: 24 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={googleLogin}
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <GoogleLogo size={22} />
          Войти через Google
        </button>
      </p>
    </div>
  );
}
