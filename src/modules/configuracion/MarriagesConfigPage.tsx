import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, Search, Trash2, Users } from 'lucide-react';
import { Toast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { brothersService } from '../../services/brothersService';
import { marriagesService, Marriage } from '../../services/marriagesService';
import { Role } from '../../types';
import { BrotherListItem } from '../hermanos/types';

const MANAGER_ROLES = new Set<Role>([Role.SUPERADMIN, Role.APOSTOL]);

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const MarriagesConfigPage = () => {
  const { user } = useAuth();
  const canManage = MANAGER_ROLES.has(user.role);

  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [brothers, setBrothers] = useState<BrotherListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [spouse1Id, setSpouse1Id] = useState('');
  const [spouse1Search, setSpouse1Search] = useState('');
  const [spouse2Id, setSpouse2Id] = useState('');
  const [spouse2Search, setSpouse2Search] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const loadedBrothers = await brothersService.listForListingAsync();
    setBrothers(loadedBrothers);
    setMarriages(marriagesService.list());
    setIsLoading(false);
  };

  useEffect(() => {
    if (!canManage) {
      return;
    }
    void loadData();

    const unsubscribe = marriagesService.subscribe(() => {
      setMarriages(marriagesService.list());
    });
    return () => {
      unsubscribe();
    };
  }, [canManage]);

  const selectedSpouse1 = useMemo(
    () => brothers.find((b) => b.id === spouse1Id),
    [brothers, spouse1Id],
  );

  const selectedSpouse2 = useMemo(
    () => brothers.find((b) => b.id === spouse2Id),
    [brothers, spouse2Id],
  );

  const availableBrothersFor1 = useMemo(() => {
    const q = normalize(spouse1Search);
    return brothers
      .filter((b) => b.id !== spouse2Id)
      .filter((b) => !q || normalize(b.name).includes(q))
      .slice(0, 6);
  }, [brothers, spouse1Search, spouse2Id]);

  const availableBrothersFor2 = useMemo(() => {
    const q = normalize(spouse2Search);
    return brothers
      .filter((b) => b.id !== spouse1Id)
      .filter((b) => !q || normalize(b.name).includes(q))
      .slice(0, 6);
  }, [brothers, spouse2Search, spouse1Id]);

  const handleSaveMarriage = (e: FormEvent) => {
    e.preventDefault();

    if (!selectedSpouse1 || !selectedSpouse2) {
      setToast({ text: 'Debes seleccionar a ambos cónyuges.', type: 'error' });
      return;
    }

    const result = marriagesService.create({
      spouse1Id: selectedSpouse1.id,
      spouse1Name: selectedSpouse1.name,
      spouse2Id: selectedSpouse2.id,
      spouse2Name: selectedSpouse2.name,
      label: customLabel.trim() || undefined,
    });

    if (!result.ok) {
      setToast({ text: result.error ?? 'No se pudo guardar el matrimonio.', type: 'error' });
      return;
    }

    setToast({ text: 'Matrimonio registrado correctamente.', type: 'success' });
    setSpouse1Id('');
    setSpouse1Search('');
    setSpouse2Id('');
    setSpouse2Search('');
    setCustomLabel('');
  };

  const handleDeleteMarriage = (id: string) => {
    const ok = marriagesService.delete(id);
    if (ok) {
      setToast({ text: 'Matrimonio eliminado.', type: 'success' });
    }
  };

  if (!canManage) {
    return <Navigate to="/hermanos" replace />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {toast && (
        <Toast
          message={toast.text}
          type={toast.type}
          isVisible={Boolean(toast)}
          onClose={() => setToast(null)}
        />
      )}

      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Configuración</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Matrimonios</h1>
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Configura parejas del padrón para asignarlas como líderes de célula o seguimiento conyugal.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/configuracion/usuarios"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Usuarios
            </Link>
            <Link
              to="/configuracion/celulas"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Células
            </Link>
            <span className="rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-[#c5a059]">
              Matrimonios
            </span>
            <Link
              to="/configuracion/discipulado"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Discipulado
            </Link>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-4">
          <p className="text-xs text-slate-500 dark:text-gray-400">Matrimonios registrados</p>
          <p className="text-2xl font-black text-[#c5a059]">{marriages.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-4">
          <p className="text-xs text-slate-500 dark:text-gray-400">Hermanos en matrimonio</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{marriages.length * 2}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Formulario de Alta */}
        <article className="xl:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={18} className="text-[#c5a059]" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Registrar Matrimonio</h2>
          </div>

          <form onSubmit={handleSaveMarriage} className="space-y-4">
            {/* Cónyuge 1 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-gray-300">
                Primer Cónyuge
              </label>
              {selectedSpouse1 ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedSpouse1.name}</span>
                  <button
                    type="button"
                    onClick={() => setSpouse1Id('')}
                    className="text-xs text-rose-500 font-bold hover:underline"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar hermano/a..."
                      value={spouse1Search}
                      onChange={(e) => setSpouse1Search(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] py-2.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
                    />
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {availableBrothersFor1.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSpouse1Id(b.id);
                          setSpouse1Search('');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-gray-200 flex justify-between items-center"
                      >
                        <span className="font-medium">{b.name}</span>
                        <span className="text-[10px] text-slate-400">{b.cellName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cónyuge 2 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-gray-300">
                Segundo Cónyuge
              </label>
              {selectedSpouse2 ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedSpouse2.name}</span>
                  <button
                    type="button"
                    onClick={() => setSpouse2Id('')}
                    className="text-xs text-rose-500 font-bold hover:underline"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar hermano/a..."
                      value={spouse2Search}
                      onChange={(e) => setSpouse2Search(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] py-2.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
                    />
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {availableBrothersFor2.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSpouse2Id(b.id);
                          setSpouse2Search('');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-gray-200 flex justify-between items-center"
                      >
                        <span className="font-medium">{b.name}</span>
                        <span className="text-[10px] text-slate-400">{b.cellName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Denominación Opcional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-gray-300">
                Denominación / Etiqueta (opcional)
              </label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Ej. Matrimonio Pérez"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
              />
            </div>

            <button
              type="submit"
              disabled={!spouse1Id || !spouse2Id}
              className="w-full rounded-xl bg-[#c5a059] disabled:opacity-40 hover:bg-[#d4b375] text-black font-black py-3 text-xs uppercase tracking-widest transition-colors shadow-lg"
            >
              Guardar Matrimonio
            </button>
          </form>
        </article>

        {/* Listado de Matrimonios */}
        <article className="xl:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Matrimonios Activos ({marriages.length})
          </h2>

          {isLoading ? (
            <p className="text-xs text-slate-500">Cargando...</p>
          ) : marriages.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-white/10">
              <Heart size={32} className="mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-700 dark:text-gray-300">No hay matrimonios configurados</p>
              <p className="text-xs text-slate-500 mt-1">Usa el formulario lateral para enlazar a dos hermanos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {marriages.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Heart size={14} className="text-[#c5a059]" />
                      {m.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                      {m.spouse1Name} & {m.spouse2Name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMarriage(m.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Eliminar matrimonio"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};
