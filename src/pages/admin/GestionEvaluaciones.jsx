import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { 
  Calendar, Plus, Search, Edit2, Trash2, AlertCircle, 
  CheckCircle2, XCircle, Clock, PlayCircle, StopCircle, RefreshCcw, X,
  FileText, Printer, FileDown, BookOpen, GraduationCap
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReportesAsistencia from './ReportesAsistencia';

export default function GestionEvaluaciones() {
  const [evaluaciones, setEvaluaciones] = useState([
    { id: 1, nombre: 'Primer Bimestre', fechaInicio: '2026-03-01', fechaFin: '2026-05-15', estado: 'CERRADO' },
    { id: 2, nombre: 'Segundo Bimestre', fechaInicio: '2026-05-16', fechaFin: '2026-07-31', estado: 'ACTIVO' },
    { id: 3, nombre: 'Tercer Bimestre', fechaInicio: '2026-08-01', fechaFin: '2026-10-15', estado: 'PROGRAMADO' },
    { id: 4, nombre: 'Cuarto Bimestre', fechaInicio: '2026-10-16', fechaFin: '2026-12-20', estado: 'PROGRAMADO' }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [evaluacionAEditar, setEvaluacionAEditar] = useState(null);
  const [form, setForm] = useState({ nombre: '', fechaInicio: '', fechaFin: '', estado: 'PROGRAMADO' });
  const [searchTerm, setSearchTerm] = useState('');
  const [errorForm, setErrorForm] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // TABS STATE
  const [activeTab, setActiveTab] = useState('cronograma'); // 'cronograma' | 'libretas'
  const [filtroPeriodo, setFiltroPeriodo] = useState('2'); 
  const [filtroGrado, setFiltroGrado] = useState('');

  // ESTADO PARA EL MODAL DE DETALLES
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [detalleEstudiante, setDetalleEstudiante] = useState(null);

  // ESTADO PARA CONFIGURACIÓN DE INSTITUCIÓN Y FIRMAS
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [estudiantePendienteDescarga, setEstudiantePendienteDescarga] = useState(null);
  const [configInstitucion, setConfigInstitucion] = useState({ colegio: '', director: '', tutor: '', logoBase64: '' });
  
  // Cargar configuración desde el backend
  useEffect(() => {
    api.get('/instituciones/me')
      .then(res => {
        const inst = res.data;
        setConfigInstitucion({
          colegio: inst.nombreColegio || '',
          director: 'Por Asignar', 
          tutor: '',
          logoBase64: inst.logoUrl || ''
        });
      })
      .catch(err => console.error("Error cargando configuración de institución", err));
  }, []);

  const mockEstudiantes = [
    { id: 1, nombre: 'Ana García', promedio: 16.5, estado: 'Aprobado', asistencia: '95%' },
    { id: 2, nombre: 'Carlos Ruiz', promedio: 10.2, estado: 'Desaprobado', asistencia: '80%' },
    { id: 3, nombre: 'Lucía Torres', promedio: 18.0, estado: 'Aprobado', asistencia: '100%' },
    { id: 4, nombre: 'Marcos Díaz', promedio: 13.5, estado: 'Aprobado', asistencia: '92%' },
  ];

  const openNewModal = () => {
    setEvaluacionAEditar(null);
    setForm({ nombre: '', fechaInicio: '', fechaFin: '', estado: 'PROGRAMADO' });
    setErrorForm('');
    setShowModal(true);
  };

  const openEditModal = (evaluacion) => {
    setEvaluacionAEditar(evaluacion);
    setForm({ ...evaluacion });
    setErrorForm('');
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorForm('');

    if (form.fechaInicio >= form.fechaFin) {
      setErrorForm('La fecha de fin debe ser estrictamente posterior a la fecha de inicio.');
      return;
    }

    // Validar solapamiento de fechas
    for (const ev of evaluaciones) {
      if (evaluacionAEditar && ev.id === evaluacionAEditar.id) continue;
      
      const overlap = Math.max(new Date(form.fechaInicio).getTime(), new Date(ev.fechaInicio).getTime()) 
                      <= Math.min(new Date(form.fechaFin).getTime(), new Date(ev.fechaFin).getTime());
      
      if (overlap) {
        setErrorForm(`Las fechas se cruzan con el periodo "${ev.nombre}".`);
        return;
      }
    }

    if (evaluacionAEditar) {
      setEvaluaciones(evaluaciones.map(ev => ev.id === evaluacionAEditar.id ? { ...form, id: ev.id } : ev));
      mostrarToast('Periodo actualizado correctamente.');
    } else {
      setEvaluaciones([...evaluaciones, { ...form, id: Date.now(), estado: 'PROGRAMADO' }]);
      mostrarToast('Periodo creado correctamente.');
    }
    setShowModal(false);
  };

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // BACKEND SIMULADO: Función asíncrona para traer notas por competencias
  const fetchDetallesEstudiante = async (estudianteNombre) => {
    setCargandoDetalles(true);
    setShowDetalleModal(true);
    setDetalleEstudiante(null);

    // Simulamos el retraso de internet (700ms)
    await new Promise(resolve => setTimeout(resolve, 700));

    // Generamos una data rica basada en el nombre para dar sensación de backend real
    const mockDetalle = {
      nombre: estudianteNombre,
      grado: "1ro de Secundaria - Sección A",
      periodo: "Segundo Bimestre",
      cursos: [
        {
          nombre: "Matemáticas",
          promedio: estudianteNombre === 'Carlos Ruiz' ? 10.5 : 16.5,
          competencias: [
            { nombre: "Resuelve problemas de cantidad", nota: estudianteNombre === 'Carlos Ruiz' ? 10 : 17 },
            { nombre: "Resuelve problemas de regularidad, equivalencia y cambio", nota: estudianteNombre === 'Carlos Ruiz' ? 11 : 16 }
          ]
        },
        {
          nombre: "Comunicación",
          promedio: estudianteNombre === 'Carlos Ruiz' ? 9.5 : 17.0,
          competencias: [
            { nombre: "Lee diversos tipos de textos", nota: estudianteNombre === 'Carlos Ruiz' ? 9 : 18 },
            { nombre: "Escribe diversos tipos de textos", nota: estudianteNombre === 'Carlos Ruiz' ? 10 : 16 }
          ]
        },
        {
          nombre: "Ciencias y Tecnología",
          promedio: estudianteNombre === 'Carlos Ruiz' ? 10.6 : 15.5,
          competencias: [
            { nombre: "Indaga mediante métodos científicos", nota: estudianteNombre === 'Carlos Ruiz' ? 10 : 15 },
            { nombre: "Explica el mundo físico", nota: estudianteNombre === 'Carlos Ruiz' ? 11 : 16 }
          ]
        }
      ]
    };

    setDetalleEstudiante(mockDetalle);
    setCargandoDetalles(false);
  };

  // BACKEND SIMULADO: Comprobación de Configuración y Descarga
  const handleDescargarLibreta = (estudianteNombre = "Aula_Completa") => {
    if (!configInstitucion.colegio || !configInstitucion.director || !configInstitucion.tutor) {
      setEstudiantePendienteDescarga(estudianteNombre);
      setShowConfigModal(true);
      return;
    }
    generarPDFoficial(estudianteNombre);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfigInstitucion({ ...configInstitucion, logoBase64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    api.put('/instituciones/me', {
      nombreColegio: configInstitucion.colegio,
      logoUrl: configInstitucion.logoBase64
    }).then(() => {
      setShowConfigModal(false);
      mostrarToast('Configuración institucional guardada.');
      if (estudiantePendienteDescarga) {
        generarPDFoficial(estudiantePendienteDescarga);
        setEstudiantePendienteDescarga(null);
      }
    }).catch(err => {
      console.error("Error guardando configuración", err);
      alert("Error al guardar la configuración");
    });
  };

  const generarPDFoficial = (estudianteNombre) => {
    mostrarToast(`Generando y descargando PDF oficial de ${estudianteNombre}...`);
    
    setTimeout(() => {
      const mockDetalle = {
        nombre: estudianteNombre === "Aula_Completa" ? "Consolidado de Aula" : estudianteNombre,
        grado: "1ro de Secundaria - Sección A",
        periodo: "Segundo Bimestre",
        cursos: [
          {
            nombre: "Matemáticas",
            promedio: estudianteNombre === 'Carlos Ruiz' ? 10.5 : 16.5,
            competencias: [
              { nombre: "Resuelve problemas de cantidad", nota: estudianteNombre === 'Carlos Ruiz' ? 10 : 17 },
              { nombre: "Resuelve problemas de regularidad", nota: estudianteNombre === 'Carlos Ruiz' ? 11 : 16 }
            ]
          },
          {
            nombre: "Comunicación",
            promedio: estudianteNombre === 'Carlos Ruiz' ? 9.5 : 17.0,
            competencias: [
              { nombre: "Lee diversos tipos de textos", nota: estudianteNombre === 'Carlos Ruiz' ? 9 : 18 },
              { nombre: "Escribe diversos tipos de textos", nota: estudianteNombre === 'Carlos Ruiz' ? 10 : 16 }
            ]
          },
          {
            nombre: "Ciencias y Tecnología",
            promedio: estudianteNombre === 'Carlos Ruiz' ? 10.6 : 15.5,
            competencias: [
              { nombre: "Indaga mediante métodos científicos", nota: estudianteNombre === 'Carlos Ruiz' ? 10 : 15 },
              { nombre: "Explica el mundo físico", nota: estudianteNombre === 'Carlos Ruiz' ? 11 : 16 }
            ]
          }
        ]
      };

      const doc = new jsPDF();
      
      // CONFIGURACIÓN DE COLORES
      const primaryColor = [79, 70, 229]; // Indigo-600
      const textColor = [30, 41, 59]; // Slate-800
      const lightText = [100, 116, 139]; // Slate-500

      // --- DISEÑO MODERNO DE CABECERA ---
      let startY = 20;

      // Escudo/Logo (Izquierda)
      if (configInstitucion.logoBase64) {
         try {
           doc.addImage(configInstitucion.logoBase64, 'JPEG', 15, 15, 25, 25);
         } catch(e) { console.error('Error insertando logo:', e); }
      }

      // Nombre del Colegio
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont(undefined, 'bold');
      doc.text(configInstitucion.colegio.toUpperCase(), configInstitucion.logoBase64 ? 45 : 15, 23);

      // Título del Documento
      doc.setFontSize(10);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.setFont(undefined, 'normal');
      doc.text("INFORME DE PROGRESO DEL ESTUDIANTE - 2026", configInstitucion.logoBase64 ? 45 : 15, 29);

      // Línea separadora elegante
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.5);
      doc.line(15, 45, 195, 45);

      // --- DATOS DEL ESTUDIANTE (Limpios y sin cajas feas) ---
      doc.setFontSize(10);
      
      // Fila 1: Estudiante y Código
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("Estudiante:", 15, 53);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont(undefined, 'bold');
      doc.text(mockDetalle.nombre, 38, 53);

      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.setFont(undefined, 'normal');
      doc.text("Código:", 140, 53);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont(undefined, 'bold');
      doc.text("20261054", 155, 53);

      // Fila 2: Nivel, Grado, Sección
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.setFont(undefined, 'normal');
      doc.text("Nivel:", 15, 60);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont(undefined, 'bold');
      doc.text("Secundaria", 28, 60);

      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.setFont(undefined, 'normal');
      doc.text("Grado y Sección:", 70, 60);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont(undefined, 'bold');
      doc.text("1ro A", 100, 60);

      // Espaciado antes de la tabla
      startY = 70;

      // Tabla Complex MINEDU
      const tableBody = [];
      mockDetalle.cursos.forEach(curso => {
        curso.competencias.forEach((comp, index) => {
          if (index === 0) {
            tableBody.push([
              { content: curso.nombre.toUpperCase(), rowSpan: curso.competencias.length },
              comp.nombre,
              comp.nota.toFixed(1), // Bim 1
              '', // Bim 2
              '', // Bim 3
              '', // Bim 4
              { content: curso.promedio.toFixed(1), rowSpan: curso.competencias.length }, // Promedio Area
              { content: '', rowSpan: curso.competencias.length } // Recuperacion
            ]);
          } else {
            tableBody.push([
              comp.nombre,
              comp.nota.toFixed(1), // Bim 1
              '', // Bim 2
              '', // Bim 3
              ''  // Bim 4
            ]);
          }
        });
        
        // Fila de CALIF. PROMEDIO AREA
        tableBody.push([
          { content: `CALIF. PROMEDIO ÁREA`, colSpan: 2, styles: { fillColor: [230, 230, 230], fontStyle: 'bold', halign: 'right' } },
          { content: curso.promedio.toFixed(1), styles: { fillColor: [230, 230, 230], fontStyle: 'bold', halign: 'center' } },
          { content: '', styles: { fillColor: [230, 230, 230] } },
          { content: '', styles: { fillColor: [230, 230, 230] } },
          { content: '', styles: { fillColor: [230, 230, 230] } },
          { content: '', styles: { fillColor: [230, 230, 230] } },
          { content: '', styles: { fillColor: [230, 230, 230] } },
        ]);
      });

      autoTable(doc, {
        startY: startY,
        head: [
          [
            { content: 'ÁREA', rowSpan: 2 },
            { content: 'CRITERIOS DE EVALUACIÓN', rowSpan: 2 },
            { content: 'BIMESTRE / TRIMESTRE', colSpan: 4 },
            { content: 'Calif.\nFinal del\nÁrea', rowSpan: 2 },
            { content: 'Eval. de\nRecuperación', rowSpan: 2 }
          ],
          ['1', '2', '3', '4']
        ],
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, valign: 'middle', textColor: [30, 41, 59], lineColor: [226, 232, 240], lineWidth: 0.1 },
        headStyles: { fillColor: [248, 250, 252], textColor: [79, 70, 229], fontStyle: 'bold', halign: 'center', lineColor: [226, 232, 240] }, // indigo text, light bg
        columnStyles: { 
          0: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 70 },
          2: { halign: 'center', cellWidth: 10 },
          3: { halign: 'center', cellWidth: 10 },
          4: { halign: 'center', cellWidth: 10 },
          5: { halign: 'center', cellWidth: 10 },
          6: { halign: 'center', cellWidth: 15, fontStyle: 'bold' },
          7: { halign: 'center', cellWidth: 20 }
        }
      });
      
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 150;

      // Firmas
      doc.setDrawColor(148, 163, 184); // slate-400
      doc.line(40, finalY + 40, 80, finalY + 40); // Linea firma 1
      doc.line(130, finalY + 40, 170, finalY + 40); // Linea firma 2
      
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text("Director(a)", 60, finalY + 46, { align: "center" });
      doc.text(configInstitucion.director, 60, finalY + 51, { align: "center" });
      
      doc.text("Tutor(a)", 150, finalY + 46, { align: "center" });
      doc.text(configInstitucion.tutor, 150, finalY + 51, { align: "center" });

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // text-slate-400
      doc.text(`Documento generado automáticamente por el Centro de Evaluaciones - ${configInstitucion.colegio}.`, 105, finalY + 70, { align: "center" });

      doc.save(`Libreta_${mockDetalle.nombre.replace(/ /g, '_')}_2026.pdf`);
    }, 1500);
  };

  const handleAbrirPeriodo = (id) => {
    const hayActivo = evaluaciones.some(ev => ev.estado === 'ACTIVO' && ev.id !== id);
    if (hayActivo) {
      alert("⚠️ No puedes iniciar este periodo porque ya existe otro periodo ACTIVO. Por favor, cierra el periodo actual primero.");
      return;
    }
    if (window.confirm('¿Estás seguro de iniciar este periodo de evaluación? Los docentes podrán ingresar notas.')) {
      setEvaluaciones(evaluaciones.map(ev => ev.id === id ? { ...ev, estado: 'ACTIVO' } : ev));
      mostrarToast('Periodo iniciado. Docentes habilitados.');
    }
  };

  const handleCerrarPeriodo = (id) => {
    if (window.confirm('¿Estás seguro de CERRAR este periodo? Ya no se podrán modificar las notas regulares.')) {
      setEvaluaciones(evaluaciones.map(ev => ev.id === id ? { ...ev, estado: 'CERRADO' } : ev));
      mostrarToast('Periodo cerrado exitosamente.');
    }
  };

  const handleReabrirPeriodo = (id) => {
    const hayActivo = evaluaciones.some(ev => ev.estado === 'ACTIVO' && ev.id !== id);
    if (hayActivo) {
      alert("⚠️ No puedes reabrir este periodo porque hay otro periodo ACTIVO actualmente.");
      return;
    }
    const pwd = window.prompt('ACCESO RESTRINGIDO: Escribe "CONFIRMAR" en mayúsculas para reabrir este periodo cerrado.');
    if (pwd === 'CONFIRMAR') {
      setEvaluaciones(evaluaciones.map(ev => ev.id === id ? { ...ev, estado: 'ACTIVO' } : ev));
      mostrarToast('Periodo reabierto excepcionalmente.');
    }
  };

  const deleteEvaluacion = (id) => {
    if (window.confirm('¿Eliminar definitivamente este periodo de evaluación? Solo debes hacerlo si fue un error de creación.')) {
      setEvaluaciones(evaluaciones.filter(ev => ev.id !== id));
      mostrarToast('Periodo eliminado.');
    }
  };

  const filteredEvaluaciones = evaluaciones.filter(ev => 
    ev.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (estado) => {
    switch(estado) {
      case 'ACTIVO': return <span className="bg-emerald-100 text-emerald-700 border-emerald-200 border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Activo</span>;
      case 'PROGRAMADO': return <span className="bg-blue-100 text-blue-700 border-blue-200 border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><Clock size={10} /> Programado</span>;
      case 'CERRADO': return <span className="bg-slate-100 text-slate-600 border-slate-200 border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><AlertCircle size={10} /> Cerrado</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in pb-12 font-sans">
      <header className="mb-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
              <Calendar size={14} strokeWidth={2.5} />
              Centro de Evaluaciones
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Evaluaciones y Libretas
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
              Gestiona el cronograma académico y descarga las libretas de notas.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => setActiveTab('cronograma')}
              className={`px-6 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'cronograma'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Calendar size={16} />
              Cronograma de Periodos
            </button>
            <button
              onClick={() => setActiveTab('libretas')}
              className={`px-6 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'libretas'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText size={16} />
              Consolidado y Libretas
            </button>
            <button
              onClick={() => setActiveTab('asistencia')}
              className={`px-6 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'asistencia'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 size={16} />
              Reportes de Asistencia
            </button>
          </div>
          
          {activeTab === 'cronograma' && (
            <button 
              onClick={openNewModal}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:translate-y-0"
            >
              <Plus size={20} strokeWidth={2.5} />
              NUEVO PERIODO
            </button>
          )}

          {activeTab === 'libretas' && (
            <button 
              onClick={() => handleDescargarLibreta()}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:translate-y-0"
            >
              <Printer size={20} strokeWidth={2.5} />
              IMPRIMIR AULA
            </button>
          )}
        </div>
      </header>

      {/* CONTENIDO TAB 1: CRONOGRAMA */}
      {activeTab === 'cronograma' && (
        <div className="animate-slide-up">
          <div className="bg-white rounded-2xl p-2 border border-slate-200/70 shadow-sm mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar periodo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-indigo-500 outline-none text-sm font-medium"
              />
            </div>
          </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-[15px] font-bold text-slate-700">Cronograma de Evaluaciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Periodo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha Inicio</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha Fin</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvaluaciones.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800 text-[15px]">{ev.nombre}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{ev.fechaInicio}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{ev.fechaFin}</td>
                  <td className="px-6 py-4">{getStatusBadge(ev.estado)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      {ev.estado === 'PROGRAMADO' && (
                        <button onClick={() => handleAbrirPeriodo(ev.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm" title="Iniciar Periodo">
                          <PlayCircle size={14} /> Iniciar
                        </button>
                      )}
                      {ev.estado === 'ACTIVO' && (
                        <button onClick={() => handleCerrarPeriodo(ev.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm" title="Cerrar Periodo">
                          <StopCircle size={14} /> Cerrar
                        </button>
                      )}
                      {ev.estado === 'CERRADO' && (
                        <button onClick={() => handleReabrirPeriodo(ev.id)} className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1" title="Reabrir Excepcionalmente">
                          <RefreshCcw size={16} />
                        </button>
                      )}
                      
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      
                      <button onClick={() => openEditModal(ev)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors" title="Editar Periodo">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteEvaluacion(ev.id)} 
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" 
                        disabled={ev.estado !== 'PROGRAMADO'}
                        title={ev.estado !== 'PROGRAMADO' ? "Solo puedes eliminar periodos programados" : "Eliminar Periodo"}
                      >
                        <Trash2 size={16} className={ev.estado !== 'PROGRAMADO' ? 'opacity-30' : ''} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* CONTENIDO TAB 2: LIBRETAS */}
      {activeTab === 'libretas' && (
        <div className="animate-slide-up">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm mb-6 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-widest">Seleccionar Periodo</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                value={filtroPeriodo}
                onChange={e => setFiltroPeriodo(e.target.value)}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
              >
                {evaluaciones.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre} ({ev.estado})</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-widest">Seleccionar Grado y Aula</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                value={filtroGrado}
                onChange={e => setFiltroGrado(e.target.value)}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
              >
                <option value="">1ro de Secundaria - Sección A</option>
                <option value="2">2do de Secundaria - Sección B</option>
                <option value="3">3ro de Secundaria - Sección A</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-[15px] font-bold text-slate-700">Rendimiento y Libretas Oficiales</h2>
              <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">{mockEstudiantes.length} Estudiantes encontrados</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estudiante</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Asistencia</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Promedio Final</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acciones de Libreta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockEstudiantes.map(est => (
                    <tr key={est.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-800 text-[14px] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">{est.nombre.charAt(0)}</div>
                        {est.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{est.asistencia}</td>
                      <td className="px-6 py-4 font-bold text-[15px]">
                        <span className={est.promedio >= 11 ? 'text-emerald-600' : 'text-red-600'}>{est.promedio.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max ${est.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                          {est.estado === 'Aprobado' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {est.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => fetchDetallesEstudiante(est.nombre)}
                            className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm" 
                            title="Ver Detalle de Notas"
                          >
                            <BookOpen size={14} /> Detalle
                          </button>
                          <button 
                            onClick={() => handleDescargarLibreta(est.nombre)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm" 
                            title="Generar Libreta Individual"
                          >
                            <FileDown size={14} /> Libreta
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO TAB 3: ASISTENCIA */}
      {activeTab === 'asistencia' && (
        <div className="animate-fade-in">
          <ReportesAsistencia isEmbedded={true} />
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-[9999]">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="font-bold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* MODAL PORTAL */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)} />
          <div className="relative w-[90vw] md:w-[480px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fade-in shrink-0">
            <div className="px-6 py-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-b border-indigo-700/50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight">
                  {evaluacionAEditar ? 'Editar Periodo' : 'Nuevo Periodo'}
                </h3>
                <p className="text-indigo-200 mt-1 font-medium text-xs">Define las fechas del bimestre o trimestre</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col">
              <div className="p-6 space-y-5 bg-slate-50 flex-1 overflow-y-auto">
                {errorForm && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 animate-fade-in shadow-sm">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-500" strokeWidth={2.5} />
                    <p className="text-sm font-bold leading-tight">{errorForm}</p>
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Nombre del Periodo</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-[14px] text-slate-800 shadow-sm transition-all" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej. Primer Trimestre" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Fecha Inicio</label>
                    <input required type="date" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-[14px] text-slate-800 shadow-sm transition-all" value={form.fechaInicio} onChange={e => setForm({...form, fechaInicio: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Fecha Fin</label>
                    <input required type="date" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-[14px] text-slate-800 shadow-sm transition-all" value={form.fechaFin} onChange={e => setForm({...form, fechaFin: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-slate-200 bg-white flex gap-3 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="flex-[0.4] py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors text-[14px]">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/20 active:translate-y-0 hover:-translate-y-0.5 transition-all text-[14px]">Guardar Periodo</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE DETALLES DE LIBRETA (COMPETENCIAS) */}
      {showDetalleModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setShowDetalleModal(false)} />
          <div className="relative w-[95vw] md:w-[700px] max-h-[90vh] bg-slate-50 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fade-in shrink-0">
            {/* Header del Modal */}
            <div className="px-6 py-6 bg-white border-b border-slate-200 flex justify-between items-start shrink-0">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-xl shadow-inner">
                  {cargandoDetalles ? <RefreshCcw className="animate-spin" /> : detalleEstudiante?.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
                    {cargandoDetalles ? 'Cargando expediente...' : detalleEstudiante?.nombre}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-md">{cargandoDetalles ? '...' : detalleEstudiante?.grado}</span>
                    <span className="text-indigo-600 font-bold text-xs bg-indigo-50 px-2.5 py-1 rounded-md flex items-center gap-1"><Calendar size={12}/> {cargandoDetalles ? '...' : detalleEstudiante?.periodo}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowDetalleModal(false)} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Cuerpo del Modal */}
            <div className="p-6 overflow-y-auto flex-1">
              {cargandoDetalles ? (
                <div className="space-y-6">
                  {/* Skeletons */}
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                      <div className="space-y-3">
                        <div className="h-3 bg-slate-100 rounded w-full"></div>
                        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 text-blue-800">
                    <AlertCircle size={20} className="shrink-0 mt-0.5 text-blue-500" />
                    <div>
                      <h4 className="font-bold text-sm">Distribución por Competencias</h4>
                      <p className="text-xs font-medium text-blue-600/80 mt-1">Las notas que se muestran provienen del promedio ponderado de las evaluaciones registradas por los docentes durante el periodo.</p>
                    </div>
                  </div>

                  {detalleEstudiante?.cursos.map((curso, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-colors">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h4 className="font-extrabold text-slate-700 text-[15px] flex items-center gap-2">
                          <BookOpen size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                          {curso.nombre}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Promedio</span>
                          <span className={`px-2.5 py-1 rounded-lg font-extrabold text-sm ${curso.promedio >= 11 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {curso.promedio.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="p-0">
                        <table className="w-full text-left">
                          <tbody className="divide-y divide-slate-100">
                            {curso.competencias.map((comp, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3 text-[13px] font-medium text-slate-600">{comp.nombre}</td>
                                <td className="px-5 py-3 text-right w-24">
                                  <span className={`font-bold text-[14px] ${comp.nota >= 11 ? 'text-slate-700' : 'text-red-600'}`}>{comp.nota.toFixed(1)}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-5 border-t border-slate-200 bg-white flex justify-end shrink-0 gap-3">
               <button onClick={() => setShowDetalleModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors text-[14px]">Cerrar</button>
               <button onClick={() => handleDescargarLibreta(detalleEstudiante?.nombre)} disabled={cargandoDetalles} className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors text-[14px] flex items-center gap-2 disabled:opacity-50">
                 <Printer size={18} />
                 Imprimir Detalles
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE CONFIGURACIÓN INSTITUCIONAL */}
      {showConfigModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setShowConfigModal(false)} />
          <div className="relative w-[90vw] md:w-[480px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fade-in shrink-0">
            <div className="px-6 py-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-b border-slate-700 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight">Datos de Emisión Oficial</h3>
                <p className="text-slate-300 mt-1 font-medium text-xs">Configura los datos que saldrán impresos en la Libreta</p>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <form onSubmit={handleSaveConfig} className="flex flex-col">
              <div className="p-6 space-y-5 bg-slate-50 flex-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Nombre de la Institución Educativa</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-[14px] text-slate-800 shadow-sm" value={configInstitucion.colegio} onChange={e => setConfigInstitucion({...configInstitucion, colegio: e.target.value})} placeholder="Ej. I.E. San Juan Bautista" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Logo / Escudo Institucional</label>
                  <div className="flex items-center gap-4">
                    {configInstitucion.logoBase64 && (
                      <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1 shrink-0">
                        <img src={configInstitucion.logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Sube una imagen (PNG o JPG). Se imprimirá en la esquina de la libreta.</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Nombre del Director(a)</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-[14px] text-slate-800 shadow-sm" value={configInstitucion.director} onChange={e => setConfigInstitucion({...configInstitucion, director: e.target.value})} placeholder="Ej. Mg. Carlos Ramírez" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Nombre del Tutor(a) de Aula</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-[14px] text-slate-800 shadow-sm" value={configInstitucion.tutor} onChange={e => setConfigInstitucion({...configInstitucion, tutor: e.target.value})} placeholder="Ej. Prof. Ana Lucía" />
                </div>
              </div>
              <div className="p-5 border-t border-slate-200 bg-white flex gap-3 shrink-0">
                <button type="button" onClick={() => setShowConfigModal(false)} className="flex-[0.4] py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-[14px]">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:translate-y-0 hover:-translate-y-0.5 transition-all text-[14px]">
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
