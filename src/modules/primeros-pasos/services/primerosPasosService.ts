import { brothersService } from '../../../services/brothersService';
import { supabaseUsersService } from '../../../services/supabaseUsersService';
import { Role } from '../../../types';
import { FichaBienvenida, LíderODerivadoOption, PrimerosPasosStats } from '../types';
import { onesignalPrimerosPasosService } from './onesignalPrimerosPasosService';

const STORAGE_KEY = 'cmv_primeros_pasos_fichas_v2';

// Ficha inicial extraída fielmente del documento original (2da imagen de muestra)
const INITIAL_FICHAS: FichaBienvenida[] = [
  {
    id: 'ficha-arce-ariel',
    nombreCompleto: 'Arce Ariel',
    edad: 30,
    telefono: '2665 042033',
    fecha: '2026-10-04',
    celulaRecibe: 'Saetas',
    comoLlego: 'Llegó por Jorge Zapata',
    deseaContacto: true,
    motivoOracion: 'Oren por su familia y trabajo',
    observaciones: 'MARANATHA.',
    createdAt: '2026-10-04T12:30:00.000Z',
    creadoPor: {
      id: 'pastor-carlos',
      nombre: 'Pastor Carlos',
    },
    estadoDerivacion: 'pendiente',
  },
];

const readStoredFichas = (): FichaBienvenida[] => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_FICHAS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FICHAS));
      return INITIAL_FICHAS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FICHAS;
  } catch {
    return INITIAL_FICHAS;
  }
};

const saveStoredFichas = (fichas: FichaBienvenida[]) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fichas));
  } catch (error) {
    console.warn('[primerosPasosService] Error guardando fichas en localStorage:', error);
  }
};

let fichasState: FichaBienvenida[] = readStoredFichas();

export const primerosPasosService = {
  /**
   * Obtiene todas las fichas de bienvenida.
   */
  list(): FichaBienvenida[] {
    fichasState = readStoredFichas();
    return fichasState;
  },

  /**
   * Busca una ficha por su ID.
   */
  getById(id: string): FichaBienvenida | undefined {
    return this.list().find((f) => f.id === id);
  },

  /**
   * Registra una nueva Ficha de Bienvenida (desde el botón del Topbar o desde la pantalla de Primeros Pasos).
   */
  async createFicha(
    data: Omit<FichaBienvenida, 'id' | 'createdAt' | 'estadoDerivacion'>,
    actor?: { id: string; nombre: string }
  ): Promise<FichaBienvenida> {
    const newId = `ficha-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    const hoy = new Date().toISOString().split('T')[0];
    const newFicha: FichaBienvenida = {
      ...data,
      fecha: data.fecha || hoy,
      id: newId,
      createdAt,
      creadoPor: actor,
      estadoDerivacion: 'pendiente',
    };

    fichasState = [newFicha, ...this.list()];
    saveStoredFichas(fichasState);

    // Opcionalmente, registramos al hermano en el padrón congregacional (en estado Altar)
    try {
      const parts = data.nombreCompleto.trim().split(/\s+/);
      const nombres = parts.slice(0, -1).join(' ') || parts[0] || 'Nuevo Hermano';
      const apellidos = parts.length > 1 ? parts[parts.length - 1] : '-';

      await brothersService.upsertBrotherAsync(
        {
          nombres,
          apellidos,
          telefono: data.telefono,
          fechaNacimiento: data.fechaNacimiento,
          estado: 'Altar',
          fechaIngreso: newFicha.fecha,
        },
        actor ? { id: actor.id, name: actor.nombre } : undefined
      );
    } catch (err) {
      console.warn('[primerosPasosService] No se pudo sincronizar automáticamente con padrón de hermanos:', err);
    }

    return newFicha;
  },

  /**
   * Deriva un nuevo hermano a un líder o pastor, y dispara la notificación de OneSignal.
   */
  async derivarFicha(
    fichaId: string,
    params: {
      destinatario: LíderODerivadoOption;
      actor: { id: string; nombre: string };
      notas?: string;
    }
  ): Promise<{
    ok: boolean;
    ficha?: FichaBienvenida;
    notificationMessage?: string;
    error?: string;
  }> {
    const fichas = this.list();
    const index = fichas.findIndex((f) => f.id === fichaId);
    if (index === -1) {
      return { ok: false, error: 'Ficha no encontrada.' };
    }

    const fichaActual = fichas[index];
    const fechaDerivacion = new Date().toISOString();

    const fichaActualizada: FichaBienvenida = {
      ...fichaActual,
      estadoDerivacion: 'derivado',
      derivadoA: {
        id: params.destinatario.id,
        nombre: params.destinatario.nombre,
        rol: params.destinatario.rol,
        celula: params.destinatario.celula,
      },
      fechaDerivacion,
      derivadoPor: params.actor,
      notasDerivacion: params.notas?.trim() || undefined,
    };

    fichas[index] = fichaActualizada;
    fichasState = [...fichas];
    saveStoredFichas(fichasState);

    // Disparamos la preparación / envío de la notificación OneSignal
    const notifResult = await onesignalPrimerosPasosService.notificarDerivacion({
      ficha: fichaActualizada,
      destinatario: params.destinatario,
      derivadoPor: params.actor,
      notas: params.notas,
    });

    return {
      ok: true,
      ficha: fichaActualizada,
      notificationMessage: notifResult.message,
    };
  },

  /**
   * Elimina una ficha de bienvenida.
   */
  deleteFicha(fichaId: string): boolean {
    const list = this.list();
    const filtered = list.filter((f) => f.id !== fichaId);
    if (filtered.length === list.length) return false;
    fichasState = filtered;
    saveStoredFichas(fichasState);
    return true;
  },

  /**
   * Devuelve estadísticas de Primeros Pasos.
   */
  getStats(): PrimerosPasosStats {
    const list = this.list();
    return {
      total: list.length,
      pendientes: list.filter((f) => f.estadoDerivacion === 'pendiente').length,
      derivados: list.filter((f) => f.estadoDerivacion === 'derivado').length,
      deseanContacto: list.filter((f) => f.deseaContacto).length,
    };
  },

  /**
   * Lista los pastores y líderes disponibles en el sistema a quienes se les puede derivar un hermano.
   */
  async listLideresYPastores(): Promise<LíderODerivadoOption[]> {
    const optionsMap = new Map<string, LíderODerivadoOption>();

    // 1. Intentamos consultar usuarios registrados en Supabase
    try {
      const supabaseUsers = await supabaseUsersService.listUsers();
      for (const u of supabaseUsers) {
        if (!u.activo) continue;
        const rol = u.rol;
        // Solo pastores y líderes
        if (
          rol === Role.PASTOR ||
          rol === Role.LIDER_CELULA ||
          rol === Role.LIDER_RED_CELULAS ||
          rol === Role.APOSTOL ||
          rol === Role.SUPERADMIN
        ) {
          optionsMap.set(u.id, {
            id: u.id,
            nombre: u.nombre,
            rol: rol.replace(/_/g, ' '),
            celula: u.celulaId || undefined,
          });
        }
      }
    } catch {
      // Ignorar error si supabase no está disponible
    }

    // 2. Revisamos hermanos de brothersService que tengan rol o liderazgo
    try {
      const brothers = brothersService.list();
      for (const b of brothers) {
        if (
          b.role === Role.PASTOR ||
          b.role === Role.LIDER_CELULA ||
          b.role === Role.LIDER_RED_CELULAS ||
          b.role === Role.HERMANO_MAYOR
        ) {
          if (!optionsMap.has(b.id)) {
            optionsMap.set(b.id, {
              id: b.id,
              nombre: b.name,
              rol: b.role.replace(/_/g, ' '),
              celula: b.acompanamiento.celulaName,
            });
          }
        }
      }
    } catch {
      // Ignorar
    }

    // 3. Fallbacks garantizados representativos si la lista estuviera vacía
    if (optionsMap.size === 0) {
      const defaultLideres: LíderODerivadoOption[] = [
        { id: 'usr-pastor-carlos', nombre: 'Pastor Carlos', rol: 'Pastor', celula: 'Vida' },
        { id: 'usr-pastora-ana', nombre: 'Pastora Ana', rol: 'Pastora', celula: 'Nissi' },
        { id: 'usr-lider-luis', nombre: 'Luis Rodriguez', rol: 'Líder de Célula', celula: 'Vida' },
        { id: 'usr-lider-javier', nombre: 'Javier Mendoza', rol: 'Líder de Célula', celula: 'Saetas' },
        { id: 'usr-lider-pedro', nombre: 'Pedro Gomez', rol: 'Líder de Célula', celula: 'Sion' },
        { id: 'usr-lider-sofia', nombre: 'Sofía López', rol: 'Líder de Célula', celula: 'Maranata' },
      ];
      defaultLideres.forEach((l) => optionsMap.set(l.id, l));
    }

    return Array.from(optionsMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  },
};
