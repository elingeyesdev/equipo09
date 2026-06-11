import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../api/investor.api';
import { persistUserRoleFromServer } from '../utils/authRole';
import { AlertCircle, ArrowRight, CheckCircle2, Mail, Lock } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from || null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login({ email, password });
      
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('userEmail', response.user?.email ?? email);
      if (response.user?.id) localStorage.setItem('userId', response.user.id);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      const adminAccessLevel = response.user?.adminAccessLevel;
      if (adminAccessLevel) {
        localStorage.setItem('adminAccessLevel', adminAccessLevel);
        if (adminAccessLevel === 'super_admin') {
          navigate('/superadmin');
        } else {
          navigate('/admin');
        }
        return;
      }

      const appRole = persistUserRoleFromServer(response.user?.roles);

      if (redirectTo) {
        navigate(redirectTo);
        return;
      }

      if (appRole === 'entrepreneur') {
        navigate('/entrepreneur-profile');
      } else {
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
    <div className="min-h-screen bg-white flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* ── Columna Izquierda: Formulario ── */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="w-full max-w-[400px] mx-auto">

          {/* Logo */}
          <Link to="/" className="inline-flex items-center mb-10 no-underline" style={{ textDecoration: 'none' }}>
            <img
              src="/logocrowd.jpg"
              alt="Unifundme"
              className="h-12 w-auto object-contain"
            />
          </Link>

          <h1 className="text-[28px] font-bold text-gray-900 mb-1.5 leading-tight">
            Inicia sesión
          </h1>
          <p className="text-[15px] text-gray-500 mb-8">
            Gestiona tus proyectos e inversiones.
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-sm font-medium mb-6 flex items-center gap-2.5">
              <AlertCircle size={18} strokeWidth={2} className="shrink-0 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-semibold text-gray-700">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
                <input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-[15px] text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#02A95C] focus:ring-3 focus:ring-[#02A95C]/10"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] font-semibold text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-[15px] text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#02A95C] focus:ring-3 focus:ring-[#02A95C]/10"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4.5 h-4.5 appearance-none border-2 border-gray-300 rounded checked:border-[#02A95C] checked:bg-[#02A95C] transition-all cursor-pointer peer"
                />
                <CheckCircle2 size={12} strokeWidth={3} className="text-white absolute left-0.5 pointer-events-none opacity-0 peer-checked:opacity-100 transition-all" />
              </div>
              <label htmlFor="rememberMe" className="text-[13px] text-gray-600 cursor-pointer select-none">
                Recordar mi correo
              </label>
            </div>

            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white text-[15px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-2.5 border-none mt-1"
              style={{
                background: '#02A95C',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                opacity: loading ? 0.8 : 1,
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#017A42'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#02A95C'; }}
            >
              {loading ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight size={17} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <span className="text-[14px] text-gray-500">¿Eres nuevo? </span>
            <Link
              to="/register"
              className="text-[14px] font-semibold no-underline"
              style={{ color: '#02A95C', textDecoration: 'none' }}
            >
              Crear una cuenta
            </Link>
          </div>

        </div>
      </div>

      {/* ── Columna Derecha: Ilustración visual ── */}
      <div
        className="hidden lg:flex w-[55%] flex-col items-center justify-center p-16 relative overflow-hidden"
        style={{ background: '#F0FDF8' }}
      >
        {/* Patrón de puntos sutil */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #02A95C22 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="w-full max-w-[400px] relative z-10">
          
          {/* Headline */}
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-[12px] font-semibold bg-[#02A95C]/10 text-[#017A42] mb-4">
              ✓ Proyectos verificados
            </span>
            <h2 className="text-[32px] font-bold text-gray-900 leading-tight mb-3">
              Descubre proyectos que generan impacto real.
            </h2>
            <p className="text-[15px] text-gray-500 leading-relaxed">
              Invierte en campañas de emprendedores bolivianos con propósito y respaldo comunitario.
            </p>
          </div>

          {/* Campaign mock card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Cover */}
            <div
              className="h-[140px] relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #064E3B 0%, #02A95C 100%)' }}
            >
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/20 text-white backdrop-blur-sm">
                  Energía Limpia
                </span>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-[18px] font-bold leading-tight">EcoVolt: Tejas Solares</p>
                <p className="text-[12px] text-white/70 mt-0.5">por Sofía Rodríguez</p>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4">
              <div className="flex justify-between text-[13px] mb-2">
                <span className="font-bold text-gray-900">$72,400 USD</span>
                <span className="text-gray-400">de $100,000 meta</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full" style={{ width: '72%', background: '#02A95C' }} />
              </div>
              <div className="flex items-center justify-between text-[12px] text-gray-500">
                <span><span className="font-semibold text-gray-700">148</span> inversores</span>
                <span className="text-[#02A95C] font-semibold">72% completado</span>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 mt-6">
            {['Seguro', 'Transparente', 'Verificado'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#02A95C' }} />
                {t}
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
