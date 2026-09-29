import { BrotherProfile } from '../modules/hermanos/types';
import { altarService } from './altarService';
import { brothersService } from './brothersService';
import { stageDatesService } from './stageDatesService';
import { Cell, Proceso, Role } from '../types';

export type MockAltarType = 'EN_PROCESO' | 'FINALIZADO' | 'INTERRUMPIDO' | 'CONECTOR';

const MOCK_NAMES = [
  'Lucas Benítez',
  'Sofía Morales',
  'Martín Giménez',
  'Valeria Rossi',
  'Esteban Paredes',
  'Camila Navarro',
  'Julián Castro',
  'Florencia Díaz',
  'Matías Romero',
  'Agustina Vega',
  'Nicolás Herrera',
  'Luciana Méndez',
];

export const mockAltarService = {
  createMockAltar(
    mentor: { id: string; name: string; cellName?: Cell },
    type: MockAltarType
  ): BrotherProfile {
    const existingMocks = this.listMockAltars(mentor.id);
    const nameIndex = existingMocks.length % MOCK_NAMES.length;
    const suffix = existingMocks.length >= MOCK_NAMES.length ? ` (${Math.floor(existingMocks.length / MOCK_NAMES.length) + 1})` : '';
    const name = `${MOCK_NAMES[nameIndex]}${suffix} · Demo`;

    const id = `mock-altar-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const celulaName: Cell = mentor.cellName || 'Vida';

    let startDate: string | undefined = '2025-01-15';
    let endDate: string | undefined = undefined;
    let isInterrumpido = false;
    let motivoInterrupcion: string | undefined = undefined;
    let discipuloStartDate: string | undefined = undefined;
    let procesoActual = Proceso.ALTAR;

    if (type === 'EN_PROCESO') {
      startDate = '2025-02-10';
      endDate = undefined;
      isInterrumpido = false;
      procesoActual = Proceso.ALTAR;
    } else if (type === 'FINALIZADO') {
      startDate = '2025-01-10';
      endDate = '2025-02-28';
      isInterrumpido = false;
      procesoActual = Proceso.GRUPO;
    } else if (type === 'INTERRUMPIDO') {
      startDate = '2025-01-20';
      endDate = undefined;
      isInterrumpido = true;
      motivoInterrupcion = 'Horarios laborales incompatibles (simulación)';
      procesoActual = Proceso.ALTAR;
    } else if (type === 'CONECTOR') {
      startDate = '2024-10-01';
      endDate = '2024-11-20';
      isInterrumpido = false;
      discipuloStartDate = '2025-03-01';
      procesoActual = Proceso.DISCIPULO;
    }

    const mockBrother: BrotherProfile = {
      id,
      name,
      role: Role.DISCIPULO,
      procesoActual,
      acompanamiento: {
        celulaName,
        acompananteName: mentor.name,
      },
      altar: {
        fechaInicio: startDate,
        fechaFin: endDate,
        interrumpido: isInterrumpido,
        motivoInterrupcion,
        fechaInterrupcion: isInterrumpido ? new Date().toISOString() : undefined,
        realizadoPor: [mentor.name],
      },
      discipulo: discipuloStartDate ? { fechaInicio: discipuloStartDate } : undefined,
      observations: [],
    };

    // 1. Registrar en Altar Service vinculado al mentor
    altarService.setHermanoMayor(id, {
      id: mentor.id,
      name: mentor.name,
    });
    altarService.setAltarDates(id, startDate, endDate);
    if (isInterrumpido) {
      altarService.setAltarInterrumpido(id, true, motivoInterrupcion);
    }

    // 2. Si es conector, registrar fecha de discipulo
    if (discipuloStartDate) {
      stageDatesService.saveStageDates(id, {
        discipuloFechaInicio: discipuloStartDate,
      });
    }

    // 3. Registrar en brothersService
    brothersService.addBrother(mockBrother);

    return mockBrother;
  },

  listMockAltars(mentorId: string): BrotherProfile[] {
    return brothersService.list().filter((b) => {
      if (!b.id.startsWith('mock-altar-')) return false;
      const info = altarService.getAltarInfo(b.id);
      return info.hermanoMayorId === mentorId;
    });
  },

  clearMockAltars(mentorId: string): void {
    const mocks = this.listMockAltars(mentorId);
    for (const mock of mocks) {
      brothersService.removeBrother(mock.id);
    }
  },
};
