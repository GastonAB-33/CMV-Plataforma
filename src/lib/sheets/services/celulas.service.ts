import { BaseEntityService } from '@/lib/sheets/services/base-entity.service';
import type { Celula } from '@/lib/sheets/types';

export class CelulasService extends BaseEntityService<'Celulas'> {
  constructor() {
    super('Celulas');
  }

  protected fromRow(row: Record<string, string>): Celula {
    return {
      id: row.id ?? '',
      nombre: row.nombre ?? '',
      liderId: row.liderId ?? '',
      descripcion: row.descripcion,
      activa: row.activa === 'true',
      creadoEn: row.creadoEn,
      actualizadoEn: row.actualizadoEn,
    };
  }

  protected toRow(entity: Celula): Record<string, string> {
    return {
      id: entity.id,
      nombre: entity.nombre,
      liderId: entity.liderId,
      descripcion: entity.descripcion ?? '',
      activa: String(entity.activa),
      creadoEn: entity.creadoEn ?? '',
      actualizadoEn: entity.actualizadoEn ?? '',
    };
  }
}
