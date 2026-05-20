import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../api/investor.api';
import { persistUserRoleFromServer } from '../utils/authRole';
import { Gem, AlertCircle, ArrowRight, CheckCircle2, Mail, Lock, Sparkles, ShieldCheck } from 'lucide-react';

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

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-[15px] outline-none transition-all duration-300 focus:bg-white focus:border-[#2e7d32] focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 font-medium text-slate-800";
  const labelClass = "text-[13px] font-bold text-slate-700 mb-2 block tracking-wide ml-1";

  return (
    <div className="min-h-screen bg-white flex font-['Sora',sans-serif]">
      
      {/* ── Columna Izquierda: Formulario de Login ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-16 relative">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {/* Brand/Logo */}
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-3 text-decoration-none group mb-8">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#1c2b1e] to-[#2e7d32] rounded-[14px] flex items-center justify-center text-emerald-300 shadow-md group-hover:scale-105 transition-transform duration-300">
                <Gem size={24} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black text-[#1c2b1e] tracking-tight">CrowdFunding</span>
            </Link>
            
            <h1 className="text-3xl font-extrabold text-[#1c2b1e] tracking-tight mb-2">
              Ingresa a tu cuenta
            </h1>
            <p className="text-[15px] font-medium text-slate-400">
              Gestiona tus proyectos e inversiones desde un solo lugar.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-100/50 text-[#c62828] p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} strokeWidth={2.5} className="shrink-0" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label htmlFor="email" className={labelClass}>Correo electrónico</label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
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
            </div>

            <div className="flex flex-col">
              <label htmlFor="password" className={labelClass}>Contraseña</label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
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
            </div>

            <div className="flex items-center gap-3 ml-1 mt-1">
              <div className="relative flex items-center justify-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 appearance-none border-2 border-slate-300 rounded-md checked:bg-[#2e7d32] checked:border-[#2e7d32] transition-all duration-200 cursor-pointer peer focus:outline-none"
                />
                <CheckCircle2 size={14} strokeWidth={3} className="text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-all duration-200 scale-50 peer-checked:scale-100" />
              </div>
              <label htmlFor="rememberMe" className="text-[14px] font-semibold text-slate-600 cursor-pointer select-none">
                Recordar mi correo
              </label>
            </div>

            <button
              id="btn-login"
              type="submit"
              className="mt-2 bg-[#2e7d32] hover:bg-[#1b5e20] text-white border-none rounded-2xl py-4 px-6 text-[16px] font-bold cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-lg shadow-emerald-700/10 flex items-center justify-center gap-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Validando acceso...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center flex flex-col gap-4">
            <span className="text-[14px] font-semibold text-slate-500">¿Eres nuevo en la plataforma?</span>
            <Link 
              to="/register" 
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-3.5 px-6 rounded-2xl text-[15px] font-bold no-underline transition-all duration-250 active:scale-[0.98] inline-block"
            >
              Crear cuenta nueva
            </Link>
          </div>

        </div>
      </div>

      {/* ── Columna Derecha: UI Real de Campaña (0% IA, Puro Código Limpio) ── */}
      <div className="hidden lg:flex w-1/2 bg-[#f4f7f4] items-center justify-center p-16 relative overflow-hidden border-l border-slate-200/50">
        
        {/* Patrón de fondo geométrico sutil */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1c2b1e_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
        
        <div className="w-full max-w-[440px] flex flex-col gap-8 relative z-10 animate-in fade-in slide-in-from-right-8 duration-700">
          
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#2e7d32] font-bold text-xs uppercase tracking-wider mb-4">
              <ShieldCheck size={14} /> Proyectos Verificados
            </div>
            <h2 className="text-3xl font-black text-[#1c2b1e] tracking-tight leading-tight mb-3">
              Descubre proyectos reales.
            </h2>
            <p className="text-[15px] font-medium text-slate-500 leading-relaxed">
              Invierte en campañas con impacto tecnológico, social y ecológico verificadas por expertos.
            </p>
          </div>

          {/* Tarjeta de Campaña Real de la Aplicación en CSS */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xl shadow-slate-250/20 hover:scale-[1.02] transition-transform duration-300">
            
            {/* Header del proyecto mock */}
            <div className="h-[180px] w-full rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 flex flex-col justify-between relative overflow-hidden text-white mb-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-start">
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-300 border border-white/10">
                  Energía Limpia
                </span>
                <span className="bg-emerald-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  Activo
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-1">EcoVolt: Tejas Solares</h3>
                <p className="text-xs text-emerald-200/80 font-medium">Por Sofía Rodríguez · CEO</p>
              </div>
            </div>

            {/* Progreso */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                  <span>Progreso de Recaudación</span>
                  <span className="text-[#2e7d32]">72%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-[#2e7d32] rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Recaudado</p>
                  <p className="text-base font-black text-[#1c2b1e]">$72,400 USD</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Inversores</p>
                  <p className="text-base font-black text-[#1c2b1e]">148 activos</p>
                </div>
              </div>

              {/* Botón de acción mock */}
              <div className="w-full py-3.5 bg-emerald-50 hover:bg-emerald-100 rounded-2xl text-center text-[#2e7d32] font-extrabold text-[13px] tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2">
                <Sparkles size={14} /> Ver detalles de campaña
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
