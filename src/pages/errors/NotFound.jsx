import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f7fc] flex items-center justify-center p-6 font-sans">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-indigo-600/20 mb-4">404</div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-3">
          Página no encontrada
        </h1>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          La página que buscas no existe o fue movida. 
          Verifica la URL o vuelve al inicio.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <Link 
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
          >
            <Home size={16} /> Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
