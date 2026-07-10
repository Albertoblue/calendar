import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from '@fluentui/react-components';
import { useAuth } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { SpaceOnboarding } from './features/space/SpaceOnboarding';
import { CalendarPage } from './features/calendar/CalendarPage';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <Spinner label="Cargando..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : !user.spaceId ? (
            <SpaceOnboarding />
          ) : (
            <CalendarPage />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
