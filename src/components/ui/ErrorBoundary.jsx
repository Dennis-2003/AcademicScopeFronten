import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="w-full text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Algo salió mal</h2>
            <p className="text-slate-500 font-medium mb-6">
              Ocurrió un error inesperado. Nuestro equipo ha sido notificado.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
              >
                <RefreshCw size={16} /> Reintentar
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Home size={16} /> Ir al inicio
              </button>
            </div>
            {true && (
              <details open className="mt-6 text-left w-full">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 font-bold uppercase mb-2">Detalle Técnico del Error:</summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-4 rounded-xl overflow-auto max-h-32">
                  {this.state.error?.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
