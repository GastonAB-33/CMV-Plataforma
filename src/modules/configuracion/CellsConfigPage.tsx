import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, Search, Settings, Users } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { brothersService } from '../../services/brothersService';
import { CellConfigRow, supabaseCellsService } from '../../services/supabaseCellsService';
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

export const CellsConfigPage = () => {
  const { user } = useAuth();
  const canManageCells = MANAGER_ROLES.has(user.role);
  const [cells, setCells] = useState<CellConfigRow[]>([]);
  const [brothers, setBrothers] = useState<BrotherListItem[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [newCellName, setNewCellName] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [newLeaderIds, setNewLeaderIds] = useState<string[]>([]);
  const [newLeaderSearch, setNewLeaderSearch] = useState('');

  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [editCellName, setEditCellName] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editLeaderIds, setEditLeaderIds] = useState<string[]>([]);
  const [editLeaderSearch, setEditLeaderSearch] = useState('');

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [loadedCells, loadedBrothers] = await Promise.all([
      supabaseCellsService.list(),
      brothersService.listForListingAsync(),
    ]);
    setCells(loadedCells);
    setBrothers(loadedBrothers);
    setMarriages(marriagesService.list());
    setIsLoading(false);
  };

  useEffect(() => {
    if (!canManageCells) {
      return;
    }
    void loadData();

    const unsubscribe = marriagesService.subscribe(() => {
      setMarriages(marriagesService.list());
    });
    return () => {
      unsubscribe();
    };
  }, [canManageCells]);

  const resetCreateForm = () => {
    setNewCellName('');
    setNewIsActive(true);
    setNewLeaderIds([]);
    setNewLeaderSearch('');
  };

  const resetEditForm = () => {
    setEditingCellId(null);
    setEditCellName('');
    setEditIsActive(true);
    setEditLeaderIds([]);
    setEditLeaderSearch('');
    setIsEditModalOpen(false);
  };

  const openEdit = (cell: CellConfigRow) => {
    setEditingCellId(cell.id);
    setEditCellName(cell.nombre);
    setEditIsActive(cell.activa);
    setEditLeaderIds(cell.leaderIds);
    setEditLeaderSearch('');
    setIsEditModalOpen(true);
  };

  const selectedNewLeaders = useMemo(
    () => newLeaderIds
      .map((leaderId) => brothers.find((brother) => brother.id === leaderId))
      .filter((brother): brother is BrotherListItem => Boolean(brother)),
    [brothers, newLeaderIds],
  );

  const selectedEditLeaders = useMemo(
    () => editLeaderIds
      .map((leaderId) => brothers.find((brother) => brother.id === leaderId))
      .filter((brother): brother is BrotherListItem => Boolean(brother)),
    [brothers, editLeaderIds],
  );

  const filteredNewBrothers = useMemo(() => {
    const term = normalize(newLeaderSearch);
    if (!term) {
      return brothers.slice(0, 12);
    }
    return brothers
      .filter((brother) => normalize(brother.name).includes(term))
      .slice(0, 20);
  }, [brothers, newLeaderSearch]);

  const filteredEditBrothers = useMemo(() => {
    const term = normalize(editLeaderSearch);
    if (!term) {
      return brothers.slice(0, 12);
    }
    return brothers
      .filter((brother) => normalize(brother.name).includes(term))
      .slice(0, 20);
  }, [brothers, editLeaderSearch]);

  const toggleNewLeader = (brotherId: string) => {
    setNewLeaderIds((previous) =>
      previous.includes(brotherId)
        ? previous.filter((leaderId) => leaderId !== brotherId)
        : [...previous, brotherId],
    );
  };

  const toggleEditLeader = (brotherId: string) => {
    setEditLeaderIds((previous) =>
      previous.includes(brotherId)
        ? previous.filter((leaderId) => leaderId !== brotherId)
        : [...previous, brotherId],
    );
  };

  const onCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const result = await supabaseCellsService.upsert({
      nombre: newCellName,
      activa: newIsActive,
      leaderIds: newLeaderIds,
    });
    setIsSaving(false);

    if (!result.ok) {
      setToast({ text: result.error ?? 'No se pudo guardar la celula.', type: 'error' });
      return;
    }

    setToast({ text: 'Celula creada correctamente.', type: 'success' });
    resetCreateForm();
    await loadData();
  };

  const onEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCellId) {
      return;
    }
    setIsSaving(true);
    const result = await supabaseCellsService.upsert({
      id: editingCellId,
      nombre: editCellName,
      activa: editIsActive,
      leaderIds: editLeaderIds,
    });
    setIsSaving(false);

    if (!result.ok) {
      setToast({ text: result.error ?? 'No se pudo actualizar la celula.', type: 'error' });
      return;
    }

    setToast({ text: 'Celula actualizada correctamente.', type: 'success' });
    resetEditForm();
    await loadData();
  };

  const deactivateCell = async (cell: CellConfigRow) => {
    const result = await supabaseCellsService.deactivate(cell.id);
    if (!result.ok) {
      setToast({ text: result.error ?? 'No se pudo dar de baja la celula.', type: 'error' });
      return;
    }
    setToast({ text: 'Celula dada de baja correctamente.', type: 'success' });
    if (editingCellId === cell.id) {
      resetEditForm();
    }
    await loadData();
  };

  if (!canManageCells) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Configuracion</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Celulas</h1>
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Gestiona altas, bajas, modificaciones y lideres asignados desde hermanos registrados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/configuracion/usuarios"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Usuarios
            </Link>
            <span className="rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-[#c5a059]">
              Celulas
            </span>
            <Link
              to="/configuracion/matrimonios"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Matrimonios
            </Link>
            <Link
              to="/configuracion/discipulado"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Discipulado
            </Link>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <article className="xl:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} className="text-[#c5a059]" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Nueva celula</h2>
          </div>

          <form className="space-y-4" onSubmit={onCreateSubmit}>
            <label className="block space-y-1">
              <span className="text-xs text-slate-600 dark:text-gray-300">Nombre oficial</span>
              <input
                value={newCellName}
                onChange={(event) => setNewCellName(event.target.value)}
                placeholder="Ej: Red Apostolica"
                required
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 text-sm"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={newIsActive}
                onChange={(event) => setNewIsActive(event.target.checked)}
              />
              Celula activa
            </label>

            <div className="space-y-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#c5a059]" />
                <p className="text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300">Lideres / responsables</p>
              </div>

              {marriages.length > 0 && (
                <div className="space-y-1 p-2.5 rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Heart size={12} className="text-[#c5a059]" />
                    Asignar Matrimonio como Líderes
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#111111] p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
                    onChange={(e) => {
                      const m = marriages.find((item) => item.id === e.target.value);
                      if (m) {
                        setNewLeaderIds([m.spouse1Id, m.spouse2Id]);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Seleccionar matrimonio --</option>
                    <optgroup label="Matrimonios">
                      {marriages.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.spouse1Name} & {m.spouse2Name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}

              {selectedNewLeaders.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedNewLeaders.map((leader) => (
                    <button
                      key={leader.id}
                      type="button"
                      onClick={() => toggleNewLeader(leader.id)}
                      className="rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1 text-[11px] font-black text-[#a58345] dark:text-[#c5a059]"
                    >
                      {leader.name} x
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input
                  value={newLeaderSearch}
                  onChange={(event) => setNewLeaderSearch(event.target.value)}
                  placeholder="Buscar hermano por nombre o apellido..."
                  className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-black/40 py-2.5 pl-9 pr-3 text-sm"
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c5a059]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                {filteredNewBrothers.map((brother) => {
                  const selected = newLeaderIds.includes(brother.id);
                  return (
                    <button
                      key={brother.id}
                      type="button"
                      onClick={() => toggleNewLeader(brother.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                        selected
                          ? 'border-[#c5a059]/60 bg-[#c5a059]/10 text-[#a58345] dark:text-[#c5a059]'
                          : 'border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 text-slate-700 dark:text-gray-200'
                      }`}
                    >
                      {brother.name}
                    </button>
                  );
                })}
                {filteredNewBrothers.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-gray-400">No se encontraron hermanos.</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black px-4 py-2 text-xs uppercase tracking-widest"
            >
              {isSaving ? 'Guardando...' : 'Crear celula'}
            </button>
          </form>
        </article>

        <article className="xl:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-[#c5a059]" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Celulas registradas</h2>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-500 dark:text-gray-400">Cargando celulas...</p>
          ) : cells.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-gray-400">No hay celulas cargadas.</p>
          ) : (
            <div className="space-y-2">
              {cells.map((cell) => (
                <article
                  key={cell.id}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{cell.nombre}</p>
                      {(() => {
                        const matchingMarriage = marriages.find(
                          (m) => cell.leaderIds.includes(m.spouse1Id) && cell.leaderIds.includes(m.spouse2Id),
                        );
                        return (
                          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                            {cell.activa ? 'Activa' : 'De baja'} - Líderes:{' '}
                            {matchingMarriage ? (
                              <span className="inline-flex items-center gap-1 font-bold text-[#c5a059]">
                                <Heart size={12} /> {matchingMarriage.label} ({cell.leaders.map((l) => l.name).join(' y ')})
                              </span>
                            ) : cell.leaders.length > 0 ? (
                              cell.leaders.map((leader) => leader.name).join(', ')
                            ) : (
                              'Sin asignar'
                            )}
                          </p>
                        );
                      })()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(cell)}
                        className="rounded-lg border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1.5 text-[11px] uppercase tracking-widest font-black text-[#a58345] dark:text-[#c5a059]"
                      >
                        Editar
                      </button>
                      {cell.activa && (
                        <button
                          type="button"
                          onClick={() => void deactivateCell(cell)}
                          className="rounded-lg border border-rose-300/70 dark:border-rose-400/20 px-3 py-1.5 text-[11px] uppercase tracking-widest font-black text-rose-600 dark:text-rose-300"
                        >
                          Baja
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>

      <Modal
        isOpen={isEditModalOpen}
        onClose={resetEditForm}
        title="Editar celula"
      >
        <form className="space-y-4" onSubmit={onEditSubmit}>
          <label className="block space-y-1">
            <span className="text-xs text-slate-600 dark:text-gray-300">Nombre oficial</span>
            <input
              value={editCellName}
              onChange={(event) => setEditCellName(event.target.value)}
              placeholder="Ej: Red Apostolica"
              required
              className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 text-sm"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={editIsActive}
              onChange={(event) => setEditIsActive(event.target.checked)}
            />
            Celula activa
          </label>

          <div className="space-y-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[#c5a059]" />
              <p className="text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300">Lideres / responsables</p>
            </div>

            {marriages.length > 0 && (
              <div className="space-y-1 p-2.5 rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Heart size={12} className="text-[#c5a059]" />
                  Asignar Matrimonio como Líderes
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#111111] p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
                  onChange={(e) => {
                    const m = marriages.find((item) => item.id === e.target.value);
                    if (m) {
                      setEditLeaderIds([m.spouse1Id, m.spouse2Id]);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>-- Seleccionar matrimonio --</option>
                  <optgroup label="Matrimonios">
                    {marriages.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.spouse1Name} & {m.spouse2Name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}

            {selectedEditLeaders.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedEditLeaders.map((leader) => (
                  <button
                    key={leader.id}
                    type="button"
                    onClick={() => toggleEditLeader(leader.id)}
                    className="rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1 text-[11px] font-black text-[#a58345] dark:text-[#c5a059]"
                  >
                    {leader.name} x
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                value={editLeaderSearch}
                onChange={(event) => setEditLeaderSearch(event.target.value)}
                placeholder="Buscar hermano por nombre o apellido..."
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-black/40 py-2.5 pl-9 pr-3 text-sm"
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c5a059]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
              {filteredEditBrothers.map((brother) => {
                const selected = editLeaderIds.includes(brother.id);
                return (
                  <button
                    key={brother.id}
                    type="button"
                    onClick={() => toggleEditLeader(brother.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      selected
                        ? 'border-[#c5a059]/60 bg-[#c5a059]/10 text-[#a58345] dark:text-[#c5a059]'
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 text-slate-700 dark:text-gray-200'
                    }`}
                  >
                    {brother.name}
                  </button>
                );
              })}
              {filteredEditBrothers.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-gray-400">No se encontraron hermanos.</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={resetEditForm}
              className="rounded-xl border border-slate-300 dark:border-white/10 px-4 py-2 text-xs uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black px-4 py-2 text-xs uppercase tracking-widest"
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </Modal>

      <Toast
        message={toast?.text ?? ''}
        isVisible={Boolean(toast)}
        type={toast?.type ?? 'success'}
        onClose={() => setToast(null)}
      />
    </div>
  );
};
