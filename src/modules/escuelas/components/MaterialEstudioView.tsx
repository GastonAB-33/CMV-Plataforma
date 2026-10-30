import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  BookOpen,
  FileText,
  Download,
  Plus,
  Trash2,
  X,
  Calendar,
  Sparkles,
  Library,
  BookMarked,
  CheckCircle,
} from 'lucide-react';
import { escuelasService } from '../services/escuelasService';
import { MaterialCategory, MaterialFileType, SchoolType, StudyMaterial } from '../types';

interface MaterialEstudioViewProps {
  onBackToMenu: () => void;
  onSwitchSchool: (school: SchoolType) => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const MaterialEstudioView: React.FC<MaterialEstudioViewProps> = ({
  onBackToMenu,
  onSwitchSchool,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory>('TODOS');
  const [selectedMaterialForReading, setSelectedMaterialForReading] = useState<StudyMaterial | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Formulario para nuevo material
  const [newTitle, setNewTitle] = useState('');
  const [newSchool, setNewSchool] = useState<SchoolType | 'GENERAL'>('eddi-1');
  const [newAuthor, setNewAuthor] = useState('Colegio Pastoral CMV');
  const [newModule, setNewModule] = useState('Módulo 1');
  const [newFileType, setNewFileType] = useState<MaterialFileType>('PDF');
  const [newDescription, setNewDescription] = useState('');
  const [newPages, setNewPages] = useState('32 páginas');
  const [newVerses, setNewVerses] = useState('');
  const [newOutline, setNewOutline] = useState('');

  const materials = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = refreshKey;
    return escuelasService.listStudyMaterials(
      selectedCategory === 'TODOS' ? undefined : (selectedCategory as SchoolType)
    );
  }, [selectedCategory, refreshKey]);

  const filteredMaterials = useMemo(() => {
    if (!searchTerm.trim()) return materials;
    const term = searchTerm.toLowerCase();
    return materials.filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        m.description.toLowerCase().includes(term) ||
        m.author.toLowerCase().includes(term) ||
        m.categoryLabel.toLowerCase().includes(term)
    );
  }, [materials, searchTerm]);

  const handleDownload = (mat: StudyMaterial) => {
    onNotify(`Descargando "${mat.title}" (${mat.fileSizeOrDuration})...`, 'info');
  };

  const handleDelete = (matId: string, title: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el material "${title}"?`)) {
      escuelasService.deleteStudyMaterial(matId);
      setRefreshKey((k) => k + 1);
      onNotify('Material eliminado con éxito.', 'success');
    }
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const versesArray = newVerses
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    const outlineArray = newOutline
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    let catLabel = 'General • Doctrina';
    if (newSchool === 'eddi-1') catLabel = 'EDDI 1 • Doctrina Básica';
    else if (newSchool === 'eddi-2') catLabel = 'EDDI 2 • Crecimiento';
    else if (newSchool === 'eddi-3') catLabel = 'EDDI 3 • Multiplicación';
    else if (newSchool === 'edem') catLabel = 'EDEM • Ministerial';

    escuelasService.addStudyMaterial({
      title: newTitle.trim(),
      schoolType: newSchool,
      categoryLabel: catLabel,
      description: newDescription.trim() || 'Material doctrinal de estudio congregacional.',
      moduleName: newModule,
      author: newAuthor.trim() || 'Docentes CMV',
      fileType: newFileType,
      fileSizeOrDuration: `2.4 MB • ${newPages}`,
      readTimeMinutes: 30,
      contentOutline: outlineArray.length > 0 ? outlineArray : undefined,
      keyVerses: versesArray.length > 0 ? versesArray : undefined,
      summaryText: newDescription.trim(),
    });

    setRefreshKey((k) => k + 1);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewVerses('');
    setNewOutline('');
    onNotify('Nuevo material de estudio agregado exitosamente.', 'success');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Barra de Navegación Superior y Selector Rápido */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/10">
        <button
          type="button"
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          <span>Volver a Menú de Escuelas</span>
        </button>

        {/* Pestañas de Navegación Rápida */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {(['eddi-1', 'eddi-2', 'eddi-3', 'edem', 'material-estudio'] as SchoolType[]).map((type) => {
            const isCurrent = type === 'material-estudio';
            const label =
              type === 'eddi-1'
                ? 'EDDI 1'
                : type === 'eddi-2'
                ? 'EDDI 2'
                : type === 'eddi-3'
                ? 'EDDI 3'
                : type === 'edem'
                ? 'EDEM'
                : 'Material de Estudio';
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSwitchSchool(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cabecera Principal de Material de Estudio */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400">
                BIBLIOTECA VIRTUAL CMV
              </span>
              <span className="text-xs text-slate-500 dark:text-gray-400 font-extrabold uppercase tracking-wider">
                • 5to Ítem de Escuelas
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Material de Estudio y Recursos
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
              Biblioteca oficial con manuales en PDF, guías de estudio para el discípulo, bosquejos docentes y recursos para cada una de las 4 escuelas (EDDI 1, EDDI 2, EDDI 3 y EDEM).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-950/20 active:scale-95 transition-all shrink-0"
          >
            <Plus size={16} />
            <span>SUBIR NUEVO MATERIAL</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros por Escuela y Búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-white/10">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar material por título, tema o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500"
          />
        </div>

        {/* Categorías por Escuela */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'eddi-1', label: 'EDDI 1' },
            { id: 'eddi-2', label: 'EDDI 2' },
            { id: 'eddi-3', label: 'EDDI 3' },
            { id: 'edem', label: 'EDEM' },
            { id: 'GENERAL', label: 'General' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as MaterialCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Materiales de Estudio */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMaterials.map((mat) => {
            const isCustom = mat.id.startsWith('mat-') && !mat.id.match(/^mat-[1-9]$/);
            const badgeColor =
              mat.schoolType === 'eddi-1'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : mat.schoolType === 'eddi-2'
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400'
                : mat.schoolType === 'eddi-3'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : mat.schoolType === 'edem'
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                : 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400';

            return (
              <div
                key={mat.id}
                className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-200/90 dark:border-white/10 hover:border-teal-500/80 dark:hover:border-teal-500/60 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeColor}`}
                    >
                      {mat.categoryLabel}
                    </span>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                      {mat.fileType}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {mat.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-gray-400 font-medium leading-relaxed mb-4 line-clamp-3">
                    {mat.description}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-500 dark:text-gray-400 mb-4">
                    <p>
                      Docente / Autor: <span className="font-bold text-slate-700 dark:text-gray-200">{mat.author}</span>
                    </p>
                    <p>
                      Formato: <span className="font-semibold text-slate-700 dark:text-gray-200">{mat.fileSizeOrDuration}</span>
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMaterialForReading(mat)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    <BookOpen size={13} />
                    <span>Leer Online</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownload(mat)}
                      className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-teal-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                      title="Descargar archivo"
                    >
                      <Download size={15} />
                    </button>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDelete(mat.id, mat.title)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Eliminar material subido"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
            <Library size={22} />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-gray-300">
            No se encontraron materiales para esta búsqueda
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory('TODOS')}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
          >
            <span>Ver Todos los Materiales</span>
          </button>
        </div>
      )}

      {/* Modal Lector / Visor de Material */}
      {selectedMaterialForReading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400">
                  {selectedMaterialForReading.categoryLabel}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight mt-1">
                  {selectedMaterialForReading.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMaterialForReading(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 [scrollbar-width:thin]">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-400 block">
                  Resumen Doctrinal y Propósito
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                  {selectedMaterialForReading.description}
                </p>
              </div>

              {selectedMaterialForReading.keyVerses && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <BookMarked size={14} /> Pasajes Bíblicos Clave
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedMaterialForReading.keyVerses.map((verse) => (
                      <span
                        key={verse}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-black/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold"
                      >
                        {verse}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMaterialForReading.contentOutline && (
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-teal-500" />
                    Temario y Unidades de Estudio
                  </span>
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 bg-slate-50/50 dark:bg-black/30">
                    {selectedMaterialForReading.contentOutline.map((item, idx) => (
                      <div key={idx} className="p-3 text-xs font-medium text-slate-800 dark:text-gray-200 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                {selectedMaterialForReading.fileSizeOrDuration}
              </span>
              <button
                type="button"
                onClick={() => {
                  handleDownload(selectedMaterialForReading);
                  setSelectedMaterialForReading(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Descargar Guía Completa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Subir / Agregar Material */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black">
                  <Plus size={18} />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Subir Nuevo Material de Estudio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">
                  Título del Material *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Manual de Oración y Guerra Espiritual"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">
                    Escuela Destino
                  </label>
                  <select
                    value={newSchool}
                    onChange={(e) => setNewSchool(e.target.value as SchoolType | 'GENERAL')}
                    className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500"
                  >
                    <option value="eddi-1">EDDI 1 (Discipulado Inicial)</option>
                    <option value="eddi-2">EDDI 2 (Crecimiento)</option>
                    <option value="eddi-3">EDDI 3 (Multiplicación)</option>
                    <option value="edem">EDEM (Ministerial)</option>
                    <option value="GENERAL">General Congregacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">
                    Tipo de Recurso
                  </label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as MaterialFileType)}
                    className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500"
                  >
                    <option value="PDF">Manual en PDF</option>
                    <option value="GUIA">Guía de Estudio</option>
                    <option value="BOSQUEJO">Bosquejo Docente</option>
                    <option value="VIDEO">Video Clase</option>
                    <option value="EXAMEN">Modelo de Examen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">
                    Autor / Docente
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">
                    Extensión / Páginas
                  </label>
                  <input
                    type="text"
                    value={newPages}
                    onChange={(e) => setNewPages(e.target.value)}
                    placeholder="Ej. 40 páginas o 45 min"
                    className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">
                  Descripción Doctrinal
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve resumen del contenido y objetivos de aprendizaje..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">
                  Pasajes Bíblicos Clave (separados por coma)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Mateo 28:19, Hechos 1:8, Efesios 4:11"
                  value={newVerses}
                  onChange={(e) => setNewVerses(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">
                  Temario / Unidades (una por línea)
                </label>
                <textarea
                  rows={3}
                  placeholder="Unidad 1: Fundamento&#10;Unidad 2: Aplicación"
                  value={newOutline}
                  onChange={(e) => setNewOutline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 font-bold text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-wider transition-all"
                >
                  Publicar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
