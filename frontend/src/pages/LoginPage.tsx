import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../api/investor.api';
import { persistUserRoleFromServer } from '../utils/authRole';
import { Gem, AlertCircle, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from || null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar email guardado si existe
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
      
      // Guardar token y redirigir
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('userEmail', response.user?.email ?? email);

      // Funcionalidad Recordar Usuario
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

      // If redirected from another page (e.g. campaign detail), go back there
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

  const inputClass = "w-full border-gray-200 border-[1.5px] rounded-xl px-4 py-3 text-[15px] outline-none transition-all bg-gray-50/50 focus:bg-white focus:border-[#2e7d32] focus:ring-4 focus:ring-emerald-500/10 placeholder:text-gray-400 font-medium";
  const labelClass = "text-[12px] font-black text-[#1c2b1e]/60 mb-2 block uppercase tracking-wider ml-1";
  const checkboxClass = "w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer accent-[#2e7d32]";

  return (
    <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center p-6 relative overflow-hidden font-['Sora',sans-serif]">
      {/* Decorative background elements - Green Financial Palette */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-100/40 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-lime-100/30 blur-[120px]"></div>
      
      <div className="bg-white rounded-[32px] w-[440px] max-w-full shadow-[0_32px_64px_-16px_rgba(28,43,30,0.1)] p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500 relative z-10 border border-white/40">
        
        {/* Brand/Logo Section */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#2e7d32] to-[#00897b] rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-500/20 animate-bounce cursor-default">
            <Gem size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-[#1c2b1e] tracking-tight mb-2">CrowdFunding</h1>
          <p className="text-[14px] font-medium text-slate-400">Impulsando tus mejores ideas con capital inteligente</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-[#c62828] p-4 rounded-xl text-sm font-bold mb-8 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle size={20} strokeWidth={2.5} />
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <div className="flex flex-col">
            <label htmlFor="email" className={labelClass}>Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className={labelClass}>Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center gap-2 ml-1">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={checkboxClass}
            />
            <label htmlFor="rememberMe" className="text-[13px] font-medium text-slate-500 cursor-pointer select-none">
              Recordar mi correo
            </label>
          </div>

          <button
            id="btn-login"
            type="submit"
            className="mt-4 bg-[#2e7d32] hover:bg-[#1c2b1e] text-white border-none rounded-xl py-4 text-[15px] font-black cursor-pointer transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Validando Acceso...
              </>
            ) : (
              <>
                Ingresar a mi cuenta
                <ArrowRight size={20} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Registration Link */}
        <div className="text-center mt-10">
          <span className="text-[14px] font-medium text-slate-400">¿Aún no tienes cuenta? </span>
          <Link to="/register" className="text-[14px] font-black text-[#2e7d32] no-underline hover:underline decoration-2 underline-offset-4">
            Empezar ahora
          </Link>
        </div>
      </div>
    </div>
  );
}
