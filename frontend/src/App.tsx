import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { InvestorProfilePage } from './pages/InvestorProfilePage';

// Guard simple: si no hay token, redirige a login
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <InvestorProfilePage />
            </PrivateRoute>
          }
        />
        {/* Ruta raíz redirige según si hay sesión */}
        <Route
          path="/"
          element={
            localStorage.getItem('accessToken')
              ? <Navigate to="/profile" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
