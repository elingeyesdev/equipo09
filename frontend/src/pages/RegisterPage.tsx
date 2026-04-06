import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { login } from '../api/investor.api';
import { persistUserRoleFromServer } from '../utils/authRole';
import { Rocket, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

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
        navigate('/dashboard'); 
      }

    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al registrar el usuario.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border-gray-200 border-[1.5px] rounded-xl px-4 py-3 text-[15px] outline-none transition-all bg-gray-50/50 focus:bg-white focus:border-[#2e7d32] focus:ring-4 focus:ring-emerald-500/10 placeholder:text-gray-400 font-medium";
  const labelClass = "text-[12px] font-black text-slate-500 mb-2 block uppercase tracking-wider ml-1";

  return (
    <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center p-6 relative overflow-hidden font-['Sora',sans-serif]">
      {/* Decorative background elements - Green Financial Theme */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-100/40 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-lime-100/30 blur-[120px]"></div>
      
      <div className="bg-white rounded-[32px] w-[440px] max-w-full shadow-[0_32px_64px_-16px_rgba(28,43,30,0.1)] p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500 relative z-10 border border-white/40">
        
        {/* Brand/Logo Section */}
        <div className="text-center mb-10">
          <div className={`w-16 h-16 bg-gradient-to-tr ${role === 'entrepreneur' ? 'from-[#2e7d32] to-[#aed581]' : 'from-[#00897b] to-[#aed581]'} rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl transition-all duration-500`}>
            {role === 'entrepreneur' ? (
              <Rocket size={32} strokeWidth={2.5} />
            ) : (
              <Sparkles size={32} strokeWidth={2.5} />
            )}
          </div>
          <h1 className="text-2xl font-black text-[#1c2b1e] tracking-tight mb-2 italic tracking-tighter leading-none">Únete a CrowdFunding</h1>
          <p className="text-[14px] font-medium text-slate-400">Emprende tu viaje hacia el éxito financiero</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-[#c62828] p-4 rounded-xl text-sm font-bold mb-8 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle size={20} strokeWidth={2.5} />
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          
          <div className="flex flex-col">
            <label htmlFor="role" className={labelClass}>Tipo de Perfil <span className="text-[#c62828]">*</span></label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'investor' | 'entrepreneur')}
              className={`${inputClass} cursor-pointer appearance-none bg-[url('https://www.svgrepo.com/show/511116/dropdown.svg')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat`}
              required
            >
              <option value="investor">Inversor (Aportar Capital)</option>
              <option value="entrepreneur">Emprendedor (Impulsar Ideas)</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className={labelClass}>Correo electrónico <span className="text-[#c62828]">*</span></label>
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

          <div className="flex flex-col">
            <label htmlFor="password" className={labelClass}>Contraseña <span className="text-[#c62828]">*</span></label>
            <input
              id="password"
              type="password"
              placeholder="Min. 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
              autoComplete="new-password"
            />
            <span className="text-[10px] uppercase font-black text-slate-400 mt-2 tracking-widest leading-tight px-1">
               Incluye al menos una mayúscula y un número
            </span>
          </div>

          <button
            type="submit"
            className={`mt-4 w-full py-4 rounded-xl text-[15px] font-black cursor-pointer transition-all active:scale-95 disabled:opacity-50 shadow-lg flex items-center justify-center gap-3 border-none text-white
              ${role === 'entrepreneur' 
                ? 'bg-gradient-to-r from-[#2e7d32] to-[#00897b] shadow-emerald-500/20' 
                : 'bg-gradient-to-r from-[#00897b] to-[#aed581] shadow-emerald-500/20'
              }
            `}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creando tu cuenta...
              </>
            ) : (
              <>
                Comenzar mi Historia
                <ArrowRight size={20} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-10">
          <span className="text-[14px] font-medium text-slate-400">¿Ya tienes una cuenta? </span>
          <Link to="/login" className="text-[14px] font-black text-[#1c2b1e] no-underline hover:underline decoration-2 underline-offset-4">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
