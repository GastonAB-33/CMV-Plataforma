import { BaseEntityService } from '@/lib/sheets/services/base-entity.service';
import type { Proceso } from '@/lib/sheets/types';

export class ProcesosService extends BaseEntityService<'Procesos'> {
  constructor() {
    super('Procesos');
  }

  protected fromRow(row: Record<string, string>): Proceso {
    return {
      id: row.id ?? '',
      hermanoId: row.hermanoId ?? '',
      tipo: row.tipo ?? '',
      estado: row.estado ?? '',
      fechaInicio: row.fechaInicio,
      fechaFin: row.fechaFin,
      notas: row.notas,
    };
  }

  protected toRow(entity: Proceso): Record<string, string> {
    return {
      id: entity.id,
      hermanoId: entity.hermanoId,
      tipo: entity.tipo,
      estado: entity.estado,
      fechaInicio: entity.fechaInicio ?? '',
      fechaFin: entity.fechaFin ?? '',
      notas: entity.notas ?? '',
    };
  }
}
