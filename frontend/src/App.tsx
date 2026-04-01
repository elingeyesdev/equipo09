import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { InvestorProfilePage } from './pages/InvestorProfilePage';
import { EntrepreneurProfilePage } from './pages/EntrepreneurProfilePage';

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
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <InvestorProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/entrepreneur-profile"
          element={
            <PrivateRoute>
              <EntrepreneurProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            localStorage.getItem('accessToken')
              ? (localStorage.getItem('userRole') === 'entrepreneur' 
                  ? <Navigate to="/entrepreneur-profile" replace /> 
                  : <Navigate to="/profile" replace />)
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
