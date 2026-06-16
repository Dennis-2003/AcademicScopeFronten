import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 border border-indigo-100 shadow-sm">
        <Construction size={40} className="text-indigo-500" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
        Módulo en Construcción
      </h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        Estamos trabajando para traer esta funcionalidad muy pronto. Este módulo será parte integral del nuevo ecosistema de gestión escolar.
      </p>
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
      >
        <ArrowLeft size={18} />
        Volver atrás
      </button>
    </div>
  );
}
