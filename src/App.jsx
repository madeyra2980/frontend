import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Specialists from './pages/Specialists';
import Organizations from './pages/Organizations';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div><p>Загрузка...</p></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div><p>Загрузка...</p></div>;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/login/oauth-callback" element={<OAuthCallback />} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="orders" element={<Orders />} />
        <Route path="specialists" element={<Specialists />} />
        <Route path="organizations" element={<Organizations />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
