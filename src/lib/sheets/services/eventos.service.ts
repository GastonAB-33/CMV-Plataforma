import { BaseEntityService } from '@/lib/sheets/services/base-entity.service';
import type { Evento } from '@/lib/sheets/types';

export class EventosService extends BaseEntityService<'Eventos'> {
  constructor() {
    super('Eventos');
  }

  protected fromRow(row: Record<string, string>): Evento {
    const tipo = row.tipo?.trim().toLowerCase() === 'individual' ? 'individual' : 'grupal';

    return {
      id: row.id ?? '',
      titulo: row.titulo ?? row.nombre ?? '',
      tipo,
      celulaId: row.celulaId,
      fecha: row.fecha ?? '',
      hora: row.hora,
      creadorId: row.creadorId,
      descripcion: row.descripcion,
      creadoEn: row.creadoEn,
      actualizadoEn: row.actualizadoEn,
    };
  }

  protected toRow(entity: Evento): Record<string, string> {
    return {
      id: entity.id,
      titulo: entity.titulo,
      tipo: entity.tipo,
      celulaId: entity.celulaId ?? '',
      fecha: entity.fecha,
      hora: entity.hora ?? '',
      creadorId: entity.creadorId ?? '',
      descripcion: entity.descripcion ?? '',
      creadoEn: entity.creadoEn ?? '',
      actualizadoEn: entity.actualizadoEn ?? '',
    };
  }
}
