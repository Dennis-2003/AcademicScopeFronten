import { useState, useEffect } from 'react';
import { 
  Settings, 
  School, 
  Building2, 
  Save,
  CheckCircle2
} from 'lucide-react';

export default function ConfiguracionInstitucion() {
  const [tipo, setTipo] = useState('PUBLICO');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Leer configuración existente si la hay
    const config = localStorage.getItem('academicScope_config');
    if (config) {
      setTipo(JSON.parse(config).tipoInstitucion);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('academicScope_config', JSON.stringify({ tipoInstitucion: tipo }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="w-full max-w-[800px] mx-auto animate-fade-in pb-12 font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
            <Settings size={14} strokeWidth={2.5} />
            Sistema
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Configuración
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
            Ajusta los parámetros globales de la institución. Estos cambios afectarán el comportamiento de varios módulos.
          </p>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Modelo de la Institución</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Selecciona el tipo de colegio para adaptar el módulo financiero automáticamente.</p>
        </div>
        
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Opción Público */}
            <div 
              onClick={() => setTipo('PUBLICO')}
              className={`cursor-pointer rounded-2xl p-6 border-2 transition-all ${tipo === 'PUBLICO' ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-slate-200 hover:border-indigo-300'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tipo === 'PUBLICO' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <School size={24} />
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${tipo === 'PUBLICO' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {tipo === 'PUBLICO' && <CheckCircle2 size={16} className="text-white" />}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Colegio Público (Estatal)</h3>
              <p className="text-sm font-medium text-slate-500">
                El módulo de finanzas se configurará para gestionar <strong>Cuotas y Aportes</strong> puntuales (Ej. Cuotas APAFA, Actividades).
              </p>
            </div>

            {/* Opción Privado */}
            <div 
              onClick={() => setTipo('PRIVADO')}
              className={`cursor-pointer rounded-2xl p-6 border-2 transition-all ${tipo === 'PRIVADO' ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-slate-200 hover:border-indigo-300'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tipo === 'PRIVADO' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Building2 size={24} />
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${tipo === 'PRIVADO' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {tipo === 'PRIVADO' && <CheckCircle2 size={16} className="text-white" />}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Colegio Privado (Particular)</h3>
              <p className="text-sm font-medium text-slate-500">
                El módulo de finanzas se configurará para gestionar <strong>Pensiones Mensuales</strong> (Matrícula, Marzo, Abril, etc.).
              </p>
            </div>

          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end">
            <div className="flex items-center gap-4">
              {saved && <span className="text-emerald-600 font-bold text-sm animate-pulse flex items-center gap-1"><CheckCircle2 size={16}/> Guardado correctamente</span>}
              <button 
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20"
              >
                <Save size={20} strokeWidth={2.5} />
                GUARDAR CAMBIOS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
