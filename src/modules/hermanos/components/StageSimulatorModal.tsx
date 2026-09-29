import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FastForward,
  Rewind,
  Layers,
  ChevronDown,
  ChevronUp,
  Users,
  BookOpen,
} from 'lucide-react';
import { BrotherProfile } from '../types';
import { altarService } from '../../../services/altarService';
import { stageDatesService } from '../../../services/stageDatesService';
import { grupoVidaApprovalService } from '../../../services/grupoVidaApprovalService';
import { liderCelulaApprovalService } from '../../../services/liderCelulaApprovalService';
import { experienciaService } from '../../../services/experienciaService';
import { stageProgressionService, STAGE_NAMES } from '../../../services/stageProgressionService';
import { mockAltarService, MockAltarType } from '../../../services/mockAltarService';
import { brothersService } from '../../../services/brothersService';
import { Role } from '../../../types';

interface StageSimulatorModalProps {
  brother: BrotherProfile;
  onApplySimulatorState: (patch: Partial<BrotherProfile>) => void;
}

const MOCK_EDDI_GRADES = [
  {
    id: 'grade-1',
    materia: 'Doctrina Básica',
    modulo: 'Módulo 1',
    fecha: '2025-06-25',
    nota: 9,
    estado: 'APROBADO' as const,
    observacion: 'Excelente asimilación de principios bíblicos',
  },
  {
    id: 'grade-2',
    materia: 'Sanidad Interior',
    modulo: 'Módulo 1',
    fecha: '2025-07-15',
    nota: 10,
    estado: 'APROBADO' as const,
    observacion: 'Gran compromiso y apertura en el proceso',
  },
  {
    id: 'grade-3',
    materia: 'El Carácter de Cristo',
    modulo: 'Módulo 2',
    fecha: '2025-08-05',
    nota: 8.5,
    estado: 'APROBADO' as const,
    observacion: 'Muy buen testimonio personal',
  },
  {
    id: 'grade-4',
    materia: 'Vida Devocional y Oración',
    modulo: 'Módulo 2',
    fecha: '2025-08-25',
    nota: 9.5,
    estado: 'APROBADO' as const,
    observacion: 'Constancia diaria demostrada en la lectura bíblica',
  },
];

const MOCK_EDEM_GRADES = [
  {
    id: 'grade-edem-1',
    materia: 'Liderazgo Celular y Multiplicación',
    modulo: 'Módulo 1',
    fecha: '2026-02-10',
    nota: 9.5,
    estado: 'APROBADO' as const,
    observacion: 'Excelente visión ministerial y pastoreo',
  },
  {
    id: 'grade-edem-2',
    materia: 'Homilética y Predicación Eficaz',
    modulo: 'Módulo 1',
    fecha: '2026-02-25',
    nota: 9.0,
    estado: 'APROBADO' as const,
    observacion: 'Gran elocuencia y fundamentación bíblica',
  },
  {
    id: 'grade-edem-3',
    materia: 'Consejería Pastoral y Familia',
    modulo: 'Módulo 2',
    fecha: '2026-03-15',
    nota: 10,
    estado: 'APROBADO' as const,
    observacion: 'Sensibilidad, madurez y discernimiento pastoral',
  },
  {
    id: 'grade-edem-4',
    materia: 'Guerra Espiritual y Liberación',
    modulo: 'Módulo 2',
    fecha: '2026-04-05',
    nota: 8.5,
    estado: 'APROBADO' as const,
    observacion: 'Firmeza doctrinal y autoridad en Cristo',
  },
];

export const StageSimulatorModal: React.FC<StageSimulatorModalProps> = ({
  brother,
  onApplySimulatorState,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const progression = stageProgressionService.resolveProgression(brother);
  const currentStage = progression.currentStageNumber;
  const mockAltars = mockAltarService.listMockAltars(brother.id);

  const saveAllMockData = ({
    altarDates,
    altarInterrumpido = false,
    experienciaFecha = '',
    stageDatesPatch,
    grupoApproval = false,
    liderApproval = false,
    brotherPatch,
  }: {
    altarDates: { fechaInicio?: string; fechaFin?: string };
    altarInterrumpido?: boolean;
    experienciaFecha?: string;
    stageDatesPatch: Parameters<typeof stageDatesService.saveStageDates>[1];
    grupoApproval?: boolean;
    liderApproval?: boolean;
    brotherPatch: Partial<BrotherProfile>;
  }) => {
    const id = brother.id;
    if (!id) return;

    // 1. Altar Service
    altarService.setAltarDates(id, altarDates.fechaInicio, altarDates.fechaFin);
    altarService.setAltarInterrumpido(
      id,
      altarInterrumpido,
      altarInterrumpido ? 'Interrupción simulada de pruebas' : undefined
    );

    // 2. Experiencia Service
    if (experienciaFecha) {
      experienciaService.saveExperienciaDate(id, experienciaFecha);
    } else {
      experienciaService.saveExperienciaDate(id, undefined);
    }

    // 3. Stage Dates Service
    stageDatesService.saveStageDates(id, {
      ...stageDatesPatch,
      experienciaFechaRealizacion: experienciaFecha || undefined,
    });

    // 4. Approvals
    if (grupoApproval) {
      grupoVidaApprovalService.approveGrupoVida(
        id,
        { name: 'Pastor Principal', role: Role.PASTOR },
        'Grupo de Vida Alpha',
        'Aprobación de simulador QA'
      );
    } else {
      grupoVidaApprovalService.revokeApproval(id);
    }

    if (liderApproval) {
      liderCelulaApprovalService.approveLiderCelula(
        id,
        { name: 'Pastor de Red', role: Role.PASTOR },
        'Aprobación de simulador QA'
      );
    } else {
      liderCelulaApprovalService.revokeApproval(id);
    }

    // 5. Update brother in brothersService repository so all modules (EDDI, EDEM, etc.) have the data
    const updatedBrother: BrotherProfile = {
      ...brother,
      ...brotherPatch,
      altar: {
        ...brother.altar,
        ...brotherPatch.altar,
        fechaInicio: altarDates.fechaInicio,
        fechaFin: altarDates.fechaFin,
        interrumpido: altarInterrumpido,
      },
      experiencia: {
        ...brother.experiencia,
        ...brotherPatch.experiencia,
        fechaRealizacion: experienciaFecha || undefined,
      },
      eddi: {
        ...brother.eddi,
        ...brotherPatch.eddi,
      },
      edem: {
        ...brother.edem,
        ...brotherPatch.edem,
      },
    };
    brothersService.addBrother(updatedBrother);

    // 6. Update local state in BrotherDetail
    onApplySimulatorState(brotherPatch);
  };

  const jumpToStage = (targetStage: number) => {
    switch (targetStage) {
      case 1: {
        // Altar pendiente / en curso
        saveAllMockData({
          altarDates: { fechaInicio: '2025-01-10', fechaFin: '' },
          altarInterrumpido: false,
          experienciaFecha: '',
          stageDatesPatch: {
            grupoFechaInicio: '',
            grupoFechaFin: '',
            grupoInterrumpido: false,
            eddiFechaInicio: '',
            eddiFechaFin: '',
            discipuloFechaInicio: '',
            discipuloFechaFin: '',
            hermanoMayorFechaInicio: '',
            hermanoMayorFechaFin: '',
            liderCelulaFechaInicio: '',
            liderCelulaFechaFin: '',
            edemFechaInicio: '',
            edemFechaFin: '',
            liderMinisterialFechaInicio: '',
            ministerioAsignado: undefined,
          },
          grupoApproval: false,
          liderApproval: false,
          brotherPatch: {
            altar: { fechaInicio: '2025-01-10', fechaFin: '', interrumpido: false },
            experiencia: { fechaRealizacion: '' },
            grupo: { fechaInicio: '', fechaFin: '', interrumpido: false },
            eddi: { fechaInicio: '', fechaFin: '', notasExamenes: [] },
            edem: { fechaInicio: '', fechaFin: '' },
          },
        });
        break;
      }
      case 2: {
        // Altar completado, Hermano Menor en curso
        saveAllMockData({
          altarDates: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28' },
          altarInterrumpido: false,
          experienciaFecha: '',
          stageDatesPatch: {
            grupoFechaInicio: '2025-03-05',
            grupoFechaFin: '',
            grupoInterrumpido: false,
            eddiFechaInicio: '',
            eddiFechaFin: '',
            discipuloFechaInicio: '',
            discipuloFechaFin: '',
            hermanoMayorFechaInicio: '',
            hermanoMayorFechaFin: '',
            liderCelulaFechaInicio: '',
            liderCelulaFechaFin: '',
            edemFechaInicio: '',
            edemFechaFin: '',
            liderMinisterialFechaInicio: '',
            ministerioAsignado: undefined,
          },
          grupoApproval: false,
          liderApproval: false,
          brotherPatch: {
            altar: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28', interrumpido: false },
            experiencia: { fechaRealizacion: '' },
            grupo: { fechaInicio: '2025-03-05', fechaFin: '', interrumpido: false },
            eddi: { fechaInicio: '', fechaFin: '', notasExamenes: [] },
            edem: { fechaInicio: '', fechaFin: '' },
          },
        });
        break;
      }
      case 3: {
        // Etapa 1 y 2 completadas, EDDI en curso con materias y notas simuladas
        saveAllMockData({
          altarDates: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28' },
          altarInterrumpido: false,
          experienciaFecha: '2025-03-20',
          stageDatesPatch: {
            grupoFechaInicio: '2025-03-05',
            grupoFechaFin: '2025-05-25',
            grupoInterrumpido: false,
            eddiFechaInicio: '2025-06-01',
            eddiFechaFin: '',
            discipuloFechaInicio: '',
            discipuloFechaFin: '',
            hermanoMayorFechaInicio: '',
            hermanoMayorFechaFin: '',
            liderCelulaFechaInicio: '',
            liderCelulaFechaFin: '',
            edemFechaInicio: '',
            edemFechaFin: '',
            liderMinisterialFechaInicio: '',
            ministerioAsignado: undefined,
          },
          grupoApproval: false,
          liderApproval: false,
          brotherPatch: {
            altar: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28', interrumpido: false },
            experiencia: { fechaRealizacion: '2025-03-20' },
            grupo: { fechaInicio: '2025-03-05', fechaFin: '2025-05-25', interrumpido: false },
            eddi: {
              fechaInicio: '2025-06-01',
              fechaFin: '',
              notasExamenes: MOCK_EDDI_GRADES.slice(0, 2),
            },
            edem: { fechaInicio: '', fechaFin: '' },
          },
        });
        break;
      }
      case 4: {
        // Etapas 1, 2, 3 completadas (EDDI finalizado con notas completas), Discípulo Conector en curso
        saveAllMockData({
          altarDates: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28' },
          altarInterrumpido: false,
          experienciaFecha: '2025-03-20',
          stageDatesPatch: {
            grupoFechaInicio: '2025-03-05',
            grupoFechaFin: '2025-05-25',
            grupoInterrumpido: false,
            eddiFechaInicio: '2025-06-01',
            eddiFechaFin: '2025-08-30',
            discipuloFechaInicio: '2025-09-01',
            discipuloFechaFin: '',
            hermanoMayorFechaInicio: '',
            hermanoMayorFechaFin: '',
            liderCelulaFechaInicio: '',
            liderCelulaFechaFin: '',
            edemFechaInicio: '',
            edemFechaFin: '',
            liderMinisterialFechaInicio: '',
            ministerioAsignado: undefined,
          },
          grupoApproval: false,
          liderApproval: false,
          brotherPatch: {
            altar: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28', interrumpido: false },
            experiencia: { fechaRealizacion: '2025-03-20' },
            grupo: { fechaInicio: '2025-03-05', fechaFin: '2025-05-25', interrumpido: false },
            eddi: {
              fechaInicio: '2025-06-01',
              fechaFin: '2025-08-30',
              notasExamenes: MOCK_EDDI_GRADES,
            },
            edem: { fechaInicio: '', fechaFin: '' },
          },
        });
        break;
      }
      case 5: {
        // Etapas 1 a 4 completadas, Hermano Mayor en curso
        saveAllMockData({
          altarDates: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28' },
          altarInterrumpido: false,
          experienciaFecha: '2025-03-20',
          stageDatesPatch: {
            grupoFechaInicio: '2025-03-05',
            grupoFechaFin: '2025-05-25',
            grupoInterrumpido: false,
            eddiFechaInicio: '2025-06-01',
            eddiFechaFin: '2025-08-30',
            discipuloFechaInicio: '2025-09-01',
            discipuloFechaFin: '2025-10-15',
            hermanoMayorFechaInicio: '2025-10-20',
            hermanoMayorFechaFin: '',
            liderCelulaFechaInicio: '',
            liderCelulaFechaFin: '',
            edemFechaInicio: '',
            edemFechaFin: '',
            liderMinisterialFechaInicio: '',
            ministerioAsignado: undefined,
          },
          grupoApproval: true,
          liderApproval: false,
          brotherPatch: {
            altar: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28', interrumpido: false },
            experiencia: { fechaRealizacion: '2025-03-20' },
            grupo: { fechaInicio: '2025-03-05', fechaFin: '2025-05-25', interrumpido: false },
            eddi: {
              fechaInicio: '2025-06-01',
              fechaFin: '2025-08-30',
              notasExamenes: MOCK_EDDI_GRADES,
            },
            edem: { fechaInicio: '', fechaFin: '' },
          },
        });
        break;
      }
      case 6: {
        // Etapas 1 a 5 completadas, Líder de Célula en curso
        saveAllMockData({
          altarDates: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28' },
          altarInterrumpido: false,
          experienciaFecha: '2025-03-20',
          stageDatesPatch: {
            grupoFechaInicio: '2025-03-05',
            grupoFechaFin: '2025-05-25',
            grupoInterrumpido: false,
            eddiFechaInicio: '2025-06-01',
            eddiFechaFin: '2025-08-30',
            discipuloFechaInicio: '2025-09-01',
            discipuloFechaFin: '2025-10-15',
            hermanoMayorFechaInicio: '2025-10-20',
            hermanoMayorFechaFin: '2025-11-20',
            liderCelulaFechaInicio: '2025-11-25',
            liderCelulaFechaFin: '',
            edemFechaInicio: '',
            edemFechaFin: '',
            liderMinisterialFechaInicio: '',
            ministerioAsignado: undefined,
          },
          grupoApproval: true,
          liderApproval: true,
          brotherPatch: {
            altar: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28', interrumpido: false },
            experiencia: { fechaRealizacion: '2025-03-20' },
            grupo: { fechaInicio: '2025-03-05', fechaFin: '2025-05-25', interrumpido: false },
            eddi: {
              fechaInicio: '2025-06-01',
              fechaFin: '2025-08-30',
              notasExamenes: MOCK_EDDI_GRADES,
            },
            edem: { fechaInicio: '', fechaFin: '' },
          },
        });
        break;
      }
      case 7: {
        // Etapas 1 a 6 completadas, EDEM en curso
        saveAllMockData({
          altarDates: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28' },
          altarInterrumpido: false,
          experienciaFecha: '2025-03-20',
          stageDatesPatch: {
            grupoFechaInicio: '2025-03-05',
            grupoFechaFin: '2025-05-25',
            grupoInterrumpido: false,
            eddiFechaInicio: '2025-06-01',
            eddiFechaFin: '2025-08-30',
            discipuloFechaInicio: '2025-09-01',
            discipuloFechaFin: '2025-10-15',
            hermanoMayorFechaInicio: '2025-10-20',
            hermanoMayorFechaFin: '2025-11-20',
            liderCelulaFechaInicio: '2025-11-25',
            liderCelulaFechaFin: '2025-12-10',
            edemFechaInicio: '2026-01-10',
            edemFechaFin: '',
            liderMinisterialFechaInicio: '',
            ministerioAsignado: undefined,
          },
          grupoApproval: true,
          liderApproval: true,
          brotherPatch: {
            altar: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28', interrumpido: false },
            experiencia: { fechaRealizacion: '2025-03-20' },
            grupo: { fechaInicio: '2025-03-05', fechaFin: '2025-05-25', interrumpido: false },
            eddi: {
              fechaInicio: '2025-06-01',
              fechaFin: '2025-08-30',
              notasExamenes: MOCK_EDDI_GRADES,
            },
            edem: {
              fechaInicio: '2026-01-10',
              fechaFin: '',
              notasExamenes: MOCK_EDEM_GRADES.slice(0, 2),
            },
          },
        });
        break;
      }
      case 8: {
        // Etapas 1 a 7 completadas, Líder Ministerial activo
        saveAllMockData({
          altarDates: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28' },
          altarInterrumpido: false,
          experienciaFecha: '2025-03-20',
          stageDatesPatch: {
            grupoFechaInicio: '2025-03-05',
            grupoFechaFin: '2025-05-25',
            grupoInterrumpido: false,
            eddiFechaInicio: '2025-06-01',
            eddiFechaFin: '2025-08-30',
            discipuloFechaInicio: '2025-09-01',
            discipuloFechaFin: '2025-10-15',
            hermanoMayorFechaInicio: '2025-10-20',
            hermanoMayorFechaFin: '2025-11-20',
            liderCelulaFechaInicio: '2025-11-25',
            liderCelulaFechaFin: '2025-12-10',
            edemFechaInicio: '2026-01-10',
            edemFechaFin: '2026-04-15',
            liderMinisterialFechaInicio: '2026-05-01',
            ministerioAsignado: undefined,
          },
          grupoApproval: true,
          liderApproval: true,
          brotherPatch: {
            altar: { fechaInicio: '2025-01-10', fechaFin: '2025-02-28', interrumpido: false },
            experiencia: { fechaRealizacion: '2025-03-20' },
            grupo: { fechaInicio: '2025-03-05', fechaFin: '2025-05-25', interrumpido: false },
            eddi: {
              fechaInicio: '2025-06-01',
              fechaFin: '2025-08-30',
              notasExamenes: MOCK_EDDI_GRADES,
            },
            edem: {
              fechaInicio: '2026-01-10',
              fechaFin: '2026-04-15',
              notasExamenes: MOCK_EDEM_GRADES,
            },
          },
        });
        break;
      }
    }
  };

  const advanceOneStage = () => {
    if (currentStage < 8) {
      jumpToStage(currentStage + 1);
    } else {
      completeAll();
    }
  };

  const stepBackOneStage = () => {
    if (currentStage > 1) {
      jumpToStage(currentStage - 1);
    }
  };

  const completeAll = () => {
    // 100% Graduado con ministerio asignado
    saveAllMockData({
      altarDates: { fechaInicio: '2024-01-10', fechaFin: '2024-02-28' },
      altarInterrumpido: false,
      experienciaFecha: '2024-03-20',
      stageDatesPatch: {
        grupoFechaInicio: '2024-03-05',
        grupoFechaFin: '2024-05-25',
        grupoInterrumpido: false,
        eddiFechaInicio: '2024-06-01',
        eddiFechaFin: '2024-08-30',
        discipuloFechaInicio: '2024-09-01',
        discipuloFechaFin: '2024-10-15',
        hermanoMayorFechaInicio: '2024-10-20',
        hermanoMayorFechaFin: '2024-11-20',
        liderCelulaFechaInicio: '2024-11-25',
        liderCelulaFechaFin: '2024-12-10',
        edemFechaInicio: '2025-01-10',
        edemFechaFin: '2025-04-15',
        liderMinisterialFechaInicio: '2025-05-01',
        ministerioAsignado: 'Pastor',
      },
      grupoApproval: true,
      liderApproval: true,
      brotherPatch: {
        altar: { fechaInicio: '2024-01-10', fechaFin: '2024-02-28', interrumpido: false },
        experiencia: { fechaRealizacion: '2024-03-20' },
        grupo: { fechaInicio: '2024-03-05', fechaFin: '2024-05-25', interrumpido: false },
        eddi: {
          fechaInicio: '2024-06-01',
          fechaFin: '2024-08-30',
          notasExamenes: MOCK_EDDI_GRADES,
        },
        edem: {
          fechaInicio: '2025-01-10',
          fechaFin: '2025-04-15',
          notasExamenes: MOCK_EDEM_GRADES,
        },
      },
    });
  };

  const handleAddMockAltar = (type: MockAltarType) => {
    mockAltarService.createMockAltar(
      {
        id: brother.id,
        name: brother.name,
        cellName: brother.acompanamiento?.celulaName,
      },
      type
    );
    onApplySimulatorState({});
  };

  const handleClearMockAltars = () => {
    mockAltarService.clearMockAltars(brother.id);
    onApplySimulatorState({});
  };

  const handleLoadEddiGrades = () => {
    stageDatesService.saveStageDates(brother.id, {
      eddiFechaInicio: '2025-06-01',
      eddiFechaFin: '2025-08-30',
    });
    const updatedEddi = {
      fechaInicio: '2025-06-01',
      fechaFin: '2025-08-30',
      notasExamenes: MOCK_EDDI_GRADES,
    };
    const updatedBrother: BrotherProfile = {
      ...brother,
      eddi: updatedEddi,
    };
    brothersService.addBrother(updatedBrother);
    onApplySimulatorState({
      eddi: updatedEddi,
    });
  };

  const handleLoadEdemGrades = () => {
    stageDatesService.saveStageDates(brother.id, {
      edemFechaInicio: '2026-02-01',
      edemFechaFin: '2026-04-30',
    });
    const updatedEdem = {
      fechaInicio: '2026-02-01',
      fechaFin: '2026-04-30',
      notasExamenes: MOCK_EDEM_GRADES,
    };
    const updatedBrother: BrotherProfile = {
      ...brother,
      edem: updatedEdem,
    };
    brothersService.addBrother(updatedBrother);
    onApplySimulatorState({
      edem: updatedEdem,
    });
  };

  const simulateGrupoInterruption = () => {
    stageDatesService.setGrupoInterrumpido(
      brother.id,
      true,
      'Horarios laborales incompatibles (simulación de prueba)',
      { name: 'Simulador QA', role: 'admin' }
    );
    onApplySimulatorState({
      grupo: {
        ...brother.grupo,
        interrumpido: true,
        motivoInterrupcion: 'Horarios laborales incompatibles (simulación de prueba)',
        fechaInterrupcion: new Date().toISOString(),
      },
    });
  };

  const resumeGrupoInterruption = () => {
    stageDatesService.setGrupoInterrumpido(brother.id, false);
    onApplySimulatorState({
      grupo: {
        ...brother.grupo,
        interrumpido: false,
        motivoInterrupcion: undefined,
        fechaInterrupcion: undefined,
      },
    });
  };

  return (
    <>
      {/* Botón flotante para abrir el simulador */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-black/90 border border-[#c5a059] shadow-2xl text-white hover:bg-[#c5a059] hover:text-black transition-all group active:scale-95 backdrop-blur-md"
          title="Abrir Simulador de Progresión de Etapas"
        >
          <div className="w-6 h-6 rounded-full bg-[#c5a059]/20 group-hover:bg-black/20 flex items-center justify-center text-[#c5a059] group-hover:text-black">
            <FlaskConical size={14} className="animate-pulse" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">Simulador</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#c5a059] group-hover:bg-black/20 group-hover:text-black border border-[#c5a059]/40">
            E{currentStage}
          </span>
        </button>
      )}

      {/* Modal / Widget Flotante del Simulador */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#151515] border-2 border-[#c5a059] rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300">
          {/* Cabecera */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-[#c5a059]/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-[#c5a059]/20 text-[#c5a059]">
                <FlaskConical size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#c5a059]">
                  Simulador de Etapas
                </h4>
                <p className="text-[10px] text-slate-300">
                  Etapa Actual:{' '}
                  <span className="text-white font-bold">
                    E{currentStage} - {STAGE_NAMES[currentStage]}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/20"
                title="Cerrar panel"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto text-slate-800 dark:text-gray-200">
              {/* Sección 1: Saltos Rápidos de Etapa (1 a 8) */}
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#c5a059] flex items-center gap-1.5 mb-2">
                  <Layers size={12} />
                  Saltar a Etapa
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((stg) => {
                    const isCurrent = currentStage === stg;
                    const isCompleted = progression.isStageCompleted(stg);
                    return (
                      <button
                        key={stg}
                        type="button"
                        onClick={() => jumpToStage(stg)}
                        className={`px-2 py-2 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 border transition-all active:scale-95 ${
                          isCurrent
                            ? 'bg-[#c5a059] text-black border-[#d4af37] font-black shadow-md ring-2 ring-[#c5a059]/50'
                            : isCompleted
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/40 hover:bg-emerald-100'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10 hover:border-[#c5a059]/40 hover:text-[#c5a059]'
                        }`}
                      >
                        <span className="text-xs font-black">E{stg}</span>
                        <span className="text-[8px] truncate max-w-full font-bold">
                          {stg === 1
                            ? 'Altar'
                            : stg === 2
                            ? 'Hno Menor'
                            : stg === 3
                            ? 'EDDI'
                            : stg === 4
                            ? 'Discípulo'
                            : stg === 5
                            ? 'Hno Mayor'
                            : stg === 6
                            ? 'Líder Cél'
                            : stg === 7
                            ? 'EDEM'
                            : 'Líder Min'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sección 2: Altares y Discípulos de Prueba (Etapas 4, 5 y 6) */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#c5a059] flex items-center gap-1.5">
                    <Users size={12} />
                    Altares de Prueba ({mockAltars.length})
                  </span>
                  {mockAltars.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearMockAltars}
                      className="text-[9px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddMockAltar('EN_PROCESO')}
                    className="px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-[10px] font-bold flex items-center gap-1.5 active:scale-95 transition-all text-left"
                    title="Crear hermano de prueba con Altar En Proceso"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="truncate">+ En Proceso</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMockAltar('FINALIZADO')}
                    className="px-2.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[10px] font-bold flex items-center gap-1.5 active:scale-95 transition-all text-left"
                    title="Crear hermano de prueba con Altar Finalizado"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">+ Finalizado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMockAltar('INTERRUMPIDO')}
                    className="px-2.5 py-1.5 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[10px] font-bold flex items-center gap-1.5 active:scale-95 transition-all text-left"
                    title="Crear hermano de prueba con Altar Interrumpido"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">+ Interrumpido</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMockAltar('CONECTOR')}
                    className="px-2.5 py-1.5 rounded-xl border border-purple-500/40 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[10px] font-bold flex items-center gap-1.5 active:scale-95 transition-all text-left"
                    title="Crear hermano de prueba como Discípulo Conector"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span className="truncate">+ Conector</span>
                  </button>
                </div>
              </div>

              {/* Sección 3: Inyección de Notas EDDI y EDEM */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#c5a059] flex items-center gap-1.5">
                  <BookOpen size={12} />
                  Calificaciones de Escuelas
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={handleLoadEddiGrades}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-400/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    title="Cargar fechas y 4 notas aprobadas en EDDI"
                  >
                    <BookOpen size={12} />
                    <span>Notas EDDI</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadEdemGrades}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-400/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    title="Cargar fechas y 4 notas aprobadas en EDEM"
                  >
                    <BookOpen size={12} />
                    <span>Notas EDEM</span>
                  </button>
                </div>
              </div>

              {/* Sección 4: Avance y Retroceso Paso a Paso */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#c5a059] flex items-center gap-1.5 mb-2">
                  <Sparkles size={12} />
                  Acciones Rápidas
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={stepBackOneStage}
                    disabled={currentStage <= 1}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Rewind size={13} />
                    <span>Retroceder</span>
                  </button>
                  <button
                    type="button"
                    onClick={advanceOneStage}
                    disabled={currentStage >= 8 && progression.isStageCompleted(8)}
                    className="px-3 py-2 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/50 hover:bg-[#c5a059] hover:text-black text-[#a58345] dark:text-[#c5a059] text-xs font-black flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FastForward size={13} />
                    <span>Avanzar 1</span>
                  </button>
                </div>
              </div>

              {/* Sección 5: Casos Especiales (Interrupción / Reanudación) */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={12} className="text-amber-500" />
                  Prueba de Interrupción (Grupo de Vida)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={simulateGrupoInterruption}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 hover:bg-rose-100 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <AlertTriangle size={12} />
                    <span>Interrumpir</span>
                  </button>
                  <button
                    type="button"
                    onClick={resumeGrupoInterruption}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <RotateCcw size={12} />
                    <span>Reanudar</span>
                  </button>
                </div>
              </div>

              {/* Sección 6: Completar Todo o Resetear */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => jumpToStage(1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 text-slate-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 text-[10px] font-bold uppercase tracking-wider hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all flex items-center gap-1"
                >
                  <RotateCcw size={11} />
                  <span>Reset a E1</span>
                </button>
                <button
                  type="button"
                  onClick={completeAll}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-1"
                >
                  <CheckCircle2 size={11} />
                  <span>100% Completado</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
