import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { login } from '../api/investor.api';
import { persistUserRoleFromServer } from '../utils/authRole';

// Usamos el proxy para el de registro
const registerApi = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'investor' | 'entrepreneur'>('investor');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Crear el usuario en el backend
      await registerApi.post('/users/register', {
        email,
        password,
        preferredLanguage: 'es',
        signupRole: role,
      });

      // 2. Hacer login automático (el backend devuelve roles en user)
      const response = await login({ email, password });

      // 3. Guardar autenticación; el rol sale del servidor (user_roles)
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('userEmail', response.user?.email ?? email);
      persistUserRoleFromServer(response.user?.roles, role);

      // 4. Redirigir según el perfil seleccionado
      if (role === 'entrepreneur') {
        navigate('/entrepreneur-profile');
      } else {
        navigate('/profile'); // Perfil del Inversor
      }

    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al registrar el usuario.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card card-sm">
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', margin: '0 auto 16px',
          }}>
            🌟
          </div>
          <h1 className="page-title" style={{ fontSize: '1.4rem', textAlign: 'center' }}>
            Únete a CrowdFunding
          </h1>
          <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: 0 }}>
            Registra tu cuenta y forma parte de la revolución
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Formulario de Registro */}
        <form className="form" onSubmit={handleSubmit} noValidate>
          
          <div className="form-group">
            <label htmlFor="role">Quiero ingresar como <span className="required">*</span></label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'investor' | 'entrepreneur')}
              required
            >
              <option value="investor">Inversor (Quiero apoyar proyectos)</option>
              <option value="entrepreneur">Emprendedor (Quiero recaudar fondos)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico <span className="required">*</span></label>
            <input
              id="email"
              type="email"
              placeholder="nuevo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña <span className="required">*</span></label>
            <input
              id="password"
              type="password"
              placeholder="Min. 8 caracteres, 1 mayús. y 1 num."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>
              La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={role === 'entrepreneur' ? { background: 'linear-gradient(135deg, #3b82f6, #6366f1)' } : { background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta →'
            )}
          </button>
        </form>

        {/* Enlace al login */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>¿Ya tienes una cuenta? </span>
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
