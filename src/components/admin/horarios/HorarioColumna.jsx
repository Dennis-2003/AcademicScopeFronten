import React, { useState } from 'react';
import HorarioTarjeta from './HorarioTarjeta';

export default function HorarioColumna({ dia, items, onEliminar, onDragStart, onDropItem, onEdit }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault(); // Necesario para permitir el drop
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onDropItem(e, dia);
  };

  return (
    <div 
      className={`flex flex-col min-w-0 transition-colors duration-200 ${isDragOver ? 'bg-primary-container/20 ring-2 ring-primary ring-inset rounded-xl' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="px-4 py-2 mx-2 mt-2 bg-surface-container-high text-on-surface-variant rounded-xl flex justify-between items-center sticky top-2 z-10 backdrop-blur-md">
        <span className="font-bold text-[13px] uppercase tracking-wider">{dia}</span>
      </div>
      
      <div className="p-2 flex-1 space-y-3 mt-1">
        {items.map(item => (
          <HorarioTarjeta 
            key={item.id} 
            item={item} 
            onEliminar={onEliminar} 
            onDragStart={onDragStart}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
