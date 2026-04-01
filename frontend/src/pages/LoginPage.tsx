import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/investor.api';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login({ email, password });
      
      // Guardar token y redirigir
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('userEmail', response.user?.email ?? email);
      
      const role = localStorage.getItem('userRole');
        if (role === 'entrepreneur') {
          navigate('/entrepreneur-profile');
        } else {
          // Por defecto va al dashboard principal del inversor
          navigate('/dashboard');
        }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Credenciales incorrectas.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card card-sm">
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', margin: '0 0 32px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', margin: '0 auto 16px',
          }}>
            💎
          </div>
          <h1 className="page-title" style={{ fontSize: '1.4rem', textAlign: 'center', margin: '0 0 4px' }}>
            CrowdFunding
          </h1>
          <p className="page-subtitle" style={{ textAlign: 'center', margin: 0 }}>
            Inicia sesión para gestionar tu perfil
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Form */}
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Ingresando...
              </>
            ) : (
              'Iniciar sesión →'
            )}
          </button>
        </form>

        {/* Link al registro */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>¿No tienes una cuenta? </span>
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
