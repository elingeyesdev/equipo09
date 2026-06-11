import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { login } from '../api/investor.api';
import { persistUserRoleFromServer } from '../utils/authRole';
import { AlertCircle, ArrowRight, CheckCircle2, Mail, Lock, TrendingUp, DollarSign } from 'lucide-react';

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
      await registerApi.post('/users/register', { email, password, preferredLanguage: 'es', signupRole: role });
      const response = await login({ email, password });
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('userEmail', response.user?.email ?? email);
      persistUserRoleFromServer(response.user?.roles, role);
      if (role === 'entrepreneur') navigate('/entrepreneur-profile');
      else navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al registrar el usuario.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const isInvestor = role === 'investor';
  const font = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

  return (
    <div className="min-h-screen bg-white flex" style={font}>
      {/* Columna izquierda */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="w-full max-w-[420px] mx-auto">

          <Link to="/" className="inline-flex items-center gap-2.5 mb-10" style={{ textDecoration: 'none' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#02A95C' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
              </svg>
            </div>
            <span className="text-[18px] font-bold text-gray-900">Crowd<span style={{ color: '#02A95C' }}>Funding</span></span>
          </Link>

          <h1 className="text-[28px] font-bold text-gray-900 mb-1.5">Crea tu cuenta</h1>
          <p className="text-[15px] text-gray-500 mb-8">Elige cómo quieres participar en la plataforma.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-sm font-medium mb-6 flex items-center gap-2.5">
              <AlertCircle size={18} strokeWidth={2} className="shrink-0 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Role selector */}
            <div>
              <label className="text-[13px] font-semibold text-gray-700 mb-2.5 block">¿Cómo quieres participar?</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRole('investor')}
                  className="relative p-4 rounded-xl border-2 text-left cursor-pointer transition-all"
                  style={{ borderColor: isInvestor ? '#02A95C' : '#E5E7EB', background: isInvestor ? '#F0FDF8' : '#fff', ...font }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                    style={{ background: isInvestor ? '#02A95C' : '#F3F4F6' }}>
                    <DollarSign size={16} strokeWidth={2} style={{ color: isInvestor ? 'white' : '#6B7280' }} />
                  </div>
                  <p className="text-[14px] font-semibold text-gray-900">Inversor</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">Aportar capital</p>
                  {isInvestor && <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#02A95C' }}><CheckCircle2 size={11} strokeWidth={3} className="text-white" /></div>}
                </button>
                <button type="button" onClick={() => setRole('entrepreneur')}
                  className="relative p-4 rounded-xl border-2 text-left cursor-pointer transition-all"
                  style={{ borderColor: !isInvestor ? '#02A95C' : '#E5E7EB', background: !isInvestor ? '#F0FDF8' : '#fff', ...font }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                    style={{ background: !isInvestor ? '#02A95C' : '#F3F4F6' }}>
                    <TrendingUp size={16} strokeWidth={2} style={{ color: !isInvestor ? 'white' : '#6B7280' }} />
                  </div>
                  <p className="text-[14px] font-semibold text-gray-900">Emprendedor</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">Buscar financiamiento</p>
                  {!isInvestor && <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#02A95C' }}><CheckCircle2 size={11} strokeWidth={3} className="text-white" /></div>}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-[13px] font-semibold text-gray-700">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
                <input id="reg-email" type="email" placeholder="nuevo@ejemplo.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-[15px] text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#02A95C] focus:ring-3 focus:ring-[#02A95C]/10"
                  style={font} />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-[13px] font-semibold text-gray-700">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
                <input id="reg-password" type="password" placeholder="Mínimo 8 caracteres" value={password}
                  onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-[15px] text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#02A95C] focus:ring-3 focus:ring-[#02A95C]/10"
                  style={font} />
              </div>
              <p className="text-[12px] text-gray-400 mt-0.5 ml-1">Debe incluir mayúsculas y números.</p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white text-[15px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-2.5 border-none mt-1"
              style={{ background: '#02A95C', ...font, opacity: loading ? 0.8 : 1 }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#017A42'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#02A95C'; }}>
              {loading ? (<><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Registrando...</span></>) : (<><span>Crear cuenta</span><ArrowRight size={17} strokeWidth={2.5} /></>)}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <span className="text-[14px] text-gray-500">¿Ya tienes cuenta? </span>
            <Link to="/login" className="text-[14px] font-semibold" style={{ color: '#02A95C', textDecoration: 'none' }}>Iniciar sesión</Link>
          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="hidden lg:flex w-[55%] flex-col items-center justify-center p-16 relative overflow-hidden"
        style={{ background: isInvestor ? '#F0FDF8' : '#FFFBF0' }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle, #02A95C22 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="w-full max-w-[380px] relative z-10">
          <span className="inline-block px-3 py-1 rounded-full text-[12px] font-semibold mb-5"
            style={{ background: isInvestor ? '#02A95C18' : '#FEF9C3', color: isInvestor ? '#017A42' : '#854D0E' }}>
            {isInvestor ? '✓ Portafolio diversificado' : '✓ Sin comisiones ocultas'}
          </span>
          <h2 className="text-[28px] font-bold text-gray-900 leading-tight mb-3">
            {isInvestor ? 'Haz crecer tu capital con proyectos reales.' : 'Tu idea merece el respaldo que necesita.'}
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
            {isInvestor ? 'Accede a campañas curadas con métricas claras y transparentes.' : 'Crea tu campaña en minutos y conéctate con inversores comprometidos.'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {isInvestor ? (
              <>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"><p className="text-[24px] font-bold text-gray-900">$2.4M</p><p className="text-[12px] text-gray-500 mt-0.5">Capital invertido</p></div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"><p className="text-[24px] font-bold" style={{ color: '#02A95C' }}>+12%</p><p className="text-[12px] text-gray-500 mt-0.5">Retorno promedio</p></div>
              </>
            ) : (
              <>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"><p className="text-[24px] font-bold text-gray-900">320+</p><p className="text-[12px] text-gray-500 mt-0.5">Campañas activas</p></div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"><p className="text-[24px] font-bold" style={{ color: '#02A95C' }}>91%</p><p className="text-[12px] text-gray-500 mt-0.5">Tasa de éxito</p></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
