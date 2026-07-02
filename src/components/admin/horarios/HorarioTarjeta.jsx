
import { Clock, MapPin, User, Trash2, Coffee, BookOpen } from 'lucide-react';

export default function HorarioTarjeta({ item, onEliminar, onDragStart, onEdit }) {
  // BLOQUE DE RECREO
  if (item.esRecreo) {
    return (
      <div className="bg-tertiary-fixed border border-outline-variant p-3 md:p-4 rounded-xl shadow-sm border-l-4 border-l-tertiary">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-[14px] text-on-tertiary-fixed tracking-wide uppercase">Recreo</h3>
          <Coffee size={18} className="text-tertiary animate-pulse" />
        </div>
        <p className="font-semibold text-[12px] text-on-tertiary-fixed-variant mt-1">{item.horaInicio} - {item.horaFin}</p>
      </div>
    );
  }

  // TARJETA DE CLASE NORMAL (Arrastrable)
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDoubleClick={() => onEdit && onEdit(item)}
      className="group bg-surface-container-lowest border border-outline-variant p-3.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing border-l-4 border-l-primary hover:-translate-y-1 relative"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-[14px] leading-tight text-on-surface group-hover:text-primary transition-colors pr-6">
          {item.curso?.nombre || 'Curso sin nombre'}
        </h3>
        <BookOpen size={16} className="text-primary opacity-80" />
      </div>
      
      <p className="font-medium text-[12px] text-on-surface-variant mb-2">
        {item.horaInicio} - {item.horaFin}
      </p>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant uppercase truncate max-w-full">
          {item.curso?.grado?.nombre || (item.curso?.tipo === 'TALLER' ? 'Taller' : 'Sin Grado')}
        </span>
      </div>
      
      <div className="space-y-1.5 mt-auto">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant min-w-0">
          <User size={12} strokeWidth={2.5} className="text-outline" />
          <span className="truncate">{item.curso?.docente ? `${item.curso.docente.nombre} ${item.curso.docente.apellido}` : 'Sin asignar'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant min-w-0">
          <MapPin size={12} strokeWidth={2.5} className="text-outline" />
          <span className="truncate">Aula: {item.aula}</span>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onEliminar(item.id); }}
        className="absolute top-3 right-2 text-outline hover:text-error hover:bg-error-container p-1 rounded transition-colors opacity-0 group-hover:opacity-100 z-10"
        title="Eliminar Bloque"
      >
        <Trash2 size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
