import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { login } from '../api/investor.api';
import { persistUserRoleFromServer } from '../utils/authRole';
import { Rocket, Sparkles, AlertCircle, ArrowRight, CheckCircle2, Gem, Mail, Lock, ShieldCheck, TrendingUp, DollarSign } from 'lucide-react';

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
      await registerApi.post('/users/register', {
        email,
        password,
        preferredLanguage: 'es',
        signupRole: role,
      });

      const response = await login({ email, password });

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('userEmail', response.user?.email ?? email);
      persistUserRoleFromServer(response.user?.roles, role);

      if (role === 'entrepreneur') {
        navigate('/entrepreneur-profile');
      } else {
        navigate('/dashboard'); 
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al registrar el usuario.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-[15px] outline-none transition-all duration-300 focus:bg-white focus:border-[#2e7d32] focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 font-medium text-slate-800";
  const labelClass = "text-[13px] font-bold text-slate-700 mb-2 block tracking-wide ml-1";

  const isInvestor = role === 'investor';

  return (
    <div className="min-h-screen bg-white flex font-['Sora',sans-serif]">
      
      {/* ── Columna Izquierda: Formulario de Registro ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-16 relative">
        <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {/* Brand/Logo */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-3 text-decoration-none group mb-6">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#1c2b1e] to-[#2e7d32] rounded-[14px] flex items-center justify-center text-emerald-300 shadow-md group-hover:scale-105 transition-transform duration-300">
                <Gem size={24} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black text-[#1c2b1e] tracking-tight">CrowdFunding</span>
            </Link>
            
            <h1 className="text-3xl font-extrabold text-[#1c2b1e] tracking-tight mb-2">
              Crea tu cuenta
            </h1>
            <p className="text-[15px] font-medium text-slate-400">
              Elige tu perfil y únete hoy mismo a la red.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100/50 text-[#c62828] p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} strokeWidth={2.5} className="shrink-0" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            
            {/* Selector de Rol en Verde Uniforme */}
            <div>
              <label className={labelClass}>¿Cómo quieres participar?</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                
                {/* Inversor Card */}
                <div 
                  onClick={() => setRole('investor')}
                  className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 flex flex-col gap-3 group hover:-translate-y-0.5 active:scale-95
                    ${isInvestor 
                      ? 'border-[#2e7d32] bg-[#2e7d32]/5 shadow-sm' 
                      : 'border-slate-100 bg-white hover:border-[#2e7d32]/30 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                    ${isInvestor ? 'border-[#2e7d32] bg-[#2e7d32]' : 'border-slate-300'}
                  `}>
                    {isInvestor && <CheckCircle2 size={12} strokeWidth={4} className="text-white" />}
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                    ${isInvestor ? 'bg-[#2e7d32] text-white' : 'bg-slate-100 text-slate-400 group-hover:text-[#2e7d32]'}
                  `}>
                    <Sparkles size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className={`font-black text-[14px] ${isInvestor ? 'text-[#2e7d32]' : 'text-slate-700'}`}>Inversor</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">Quiero aportar capital.</p>
                  </div>
                </div>

                {/* Emprendedor Card */}
                <div 
                  onClick={() => setRole('entrepreneur')}
                  className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 flex flex-col gap-3 group hover:-translate-y-0.5 active:scale-95
                    ${!isInvestor 
                      ? 'border-[#2e7d32] bg-[#2e7d32]/5 shadow-sm' 
                      : 'border-slate-100 bg-white hover:border-[#2e7d32]/30 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                    ${!isInvestor ? 'border-[#2e7d32] bg-[#2e7d32]' : 'border-slate-300'}
                  `}>
                    {!isInvestor && <CheckCircle2 size={12} strokeWidth={4} className="text-white" />}
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                    ${!isInvestor ? 'bg-[#2e7d32] text-white' : 'bg-slate-100 text-slate-400 group-hover:text-[#2e7d32]'}
                  `}>
                    <Rocket size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className={`font-black text-[14px] ${!isInvestor ? 'text-[#2e7d32]' : 'text-slate-700'}`}>Emprendedor</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">Busco financiamiento.</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
                <label htmlFor="email" className={labelClass}>Correo electrónico</label>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="nuevo@ejemplo.com"
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
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputClass}
                    autoComplete="new-password"
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 mt-2 ml-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                  Debe incluir una mayúscula y un número
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 text-white border-none rounded-2xl py-4 px-6 text-[16px] font-bold cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-lg bg-[#2e7d32] hover:bg-[#1b5e20] shadow-emerald-500/10 flex items-center justify-center gap-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <span>Registrarme</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center flex flex-col gap-4">
            <span className="text-[14px] font-semibold text-slate-500">¿Ya tienes una cuenta creada?</span>
            <Link 
              to="/login" 
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-3.5 px-6 rounded-2xl text-[15px] font-bold no-underline transition-all duration-250 active:scale-[0.98] inline-block"
            >
              Iniciar sesión
            </Link>
          </div>

        </div>
      </div>

      {/* ── Columna Derecha: UI Dinámica Reactiva (Verde Uniforme) ── */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-16 relative overflow-hidden border-l border-slate-200/50 bg-[#f4f7f4]">
        
        {/* Patrón sutil geométrico */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1c2b1e_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
        
        <div className="w-full max-w-[440px] flex flex-col gap-8 relative z-10 animate-in fade-in duration-500">
          
          {/* Textos Dinámicos */}
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-[#2e7d32] font-bold text-xs uppercase tracking-wider mb-4">
              <ShieldCheck size={14} /> {isInvestor ? 'Perfil de Inversión' : 'Perfil de Emprendimiento'}
            </div>
            <h2 className="text-3xl font-black text-[#1c2b1e] tracking-tight leading-tight mb-3">
              {isInvestor ? 'Descubre el próximo gran unicornio.' : 'Consigue el respaldo que tu idea necesita.'}
            </h2>
            <p className="text-[15px] font-medium text-slate-500 leading-relaxed">
              {isInvestor 
                ? 'Accede a un flujo curado de campañas de alto crecimiento y diversifica tu portafolio de manera inteligente.' 
                : 'Crea tu campaña en minutos, conéctate con miles de inversores y financia tus sueños sin complicaciones.'}
            </p>
          </div>

          {/* UI Dinámica en CSS (Verde Esmeralda Uniforme) */}
          <div className="relative">
            {isInvestor ? (
              /* CARD MOCK: Portafolio de Inversor */
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-xl shadow-slate-250/10 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tu Portafolio</p>
                    <p className="text-3xl font-black text-[#1c2b1e] mt-1">$24,500.00 USD</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-[#2e7d32] flex items-center justify-center">
                    <DollarSign size={20} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 border-b border-slate-100 pb-2">Distribución Activa</p>
                  
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-slate-700">EcoVolt Tejas Solares</span>
                    </div>
                    <span className="font-bold text-[#2e7d32]">+12% retorno</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-700"></div>
                      <span className="text-slate-700">AgroInteligente Semilla</span>
                    </div>
                    <span className="font-bold text-[#2e7d32]">+8.5% retorno</span>
                  </div>
                </div>

                <div className="w-full py-3.5 bg-emerald-50 hover:bg-emerald-100 rounded-2xl text-center text-[#2e7d32] font-extrabold text-[13px] tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2 mt-6">
                  <Sparkles size={14} /> Explorar Oportunidades
                </div>
              </div>
            ) : (
              /* CARD MOCK: Panel de Emprendedor */
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-xl shadow-slate-250/10 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tu Campaña</p>
                    <p className="text-3xl font-black text-[#1c2b1e] mt-1">$45,600 USD</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-[#2e7d32] flex items-center justify-center">
                    <TrendingUp size={20} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                      <span>Progreso de Financiamiento</span>
                      <span className="text-[#2e7d32]">91%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-[#2e7d32] rounded-full animate-pulse" style={{ width: '91%' }}></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <div className="w-2 h-2 rounded-full bg-[#2e7d32] animate-ping"></div>
                    <p className="text-xs font-bold text-emerald-800 leading-snug">
                      ¡Inversor aportó $2,500 USD!
                    </p>
                  </div>
                </div>

                <div className="w-full py-3.5 bg-emerald-50 hover:bg-emerald-100 rounded-2xl text-center text-[#2e7d32] font-extrabold text-[13px] tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2 mt-6">
                  <Rocket size={14} /> Ir a mis Campañas
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
