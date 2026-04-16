import { BaseEntityService } from '@/lib/sheets/services/base-entity.service';
import type { EventoParticipante } from '@/lib/sheets/types';

export class EventoParticipantesService extends BaseEntityService<'EventoParticipantes'> {
  constructor() {
    super('EventoParticipantes');
  }

  protected fromRow(row: Record<string, string>): EventoParticipante {
    return {
      id: row.id ?? '',
      eventoId: row.eventoId ?? '',
      hermanoId: row.hermanoId ?? '',
      estadoAsistencia: row.estadoAsistencia,
      observacion: row.observacion,
    };
  }

  protected toRow(entity: EventoParticipante): Record<string, string> {
    return {
      id: entity.id,
      eventoId: entity.eventoId,
      hermanoId: entity.hermanoId,
      estadoAsistencia: entity.estadoAsistencia ?? '',
      observacion: entity.observacion ?? '',
    };
  }
}
