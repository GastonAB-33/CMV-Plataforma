import { BaseEntityService } from '@/lib/sheets/services/base-entity.service';
import type { Discipulado } from '@/lib/sheets/types';

export class DiscipuladoService extends BaseEntityService<'Discipulado'> {
  constructor() {
    super('Discipulado');
  }

  protected fromRow(row: Record<string, string>): Discipulado {
    return {
      id: row.id ?? '',
      hermanoId: row.hermanoId ?? '',
      discipuladorId: row.discipuladorId,
      estado: row.estado ?? '',
      fechaInicio: row.fechaInicio,
      fechaFin: row.fechaFin,
      notas: row.notas,
    };
  }

  protected toRow(entity: Discipulado): Record<string, string> {
    return {
      id: entity.id,
      hermanoId: entity.hermanoId,
      discipuladorId: entity.discipuladorId ?? '',
      estado: entity.estado,
      fechaInicio: entity.fechaInicio ?? '',
      fechaFin: entity.fechaFin ?? '',
      notas: entity.notas ?? '',
    };
  }
}
