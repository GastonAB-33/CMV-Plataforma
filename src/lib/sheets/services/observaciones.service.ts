import { BaseEntityService } from '@/lib/sheets/services/base-entity.service';
import type { Observacion } from '@/lib/sheets/types';

export class ObservacionesService extends BaseEntityService<'Observaciones'> {
  constructor() {
    super('Observaciones');
  }

  protected fromRow(row: Record<string, string>): Observacion {
    return {
      id: row.id ?? '',
      hermanoId: row.hermanoId ?? '',
      autorId: row.autorId,
      fecha: row.fecha ?? '',
      detalle: row.detalle ?? row.comentario ?? '',
      comentario: row.comentario ?? row.detalle ?? '',
      tipo: row.tipo,
    };
  }

  protected toRow(entity: Observacion): Record<string, string> {
    const comentario = entity.comentario ?? entity.detalle;

    return {
      id: entity.id,
      hermanoId: entity.hermanoId,
      autorId: entity.autorId ?? '',
      fecha: entity.fecha,
      detalle: entity.detalle,
      comentario,
      tipo: entity.tipo ?? '',
    };
  }
}
