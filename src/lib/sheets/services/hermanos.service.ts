import { BaseEntityService } from '@/lib/sheets/services/base-entity.service';
import type { Hermano } from '@/lib/sheets/types';

export class HermanosService extends BaseEntityService<'Hermanos'> {
  constructor() {
    super('Hermanos');
  }

  protected fromRow(row: Record<string, string>): Hermano {
    return {
      id: row.id ?? '',
      nombres: row.nombres ?? '',
      apellidos: row.apellidos ?? '',
      telefono: row.telefono,
      direccion: row.direccion,
      celulaId: row.celulaId,
      estado: row.estado,
      fechaIngreso: row.fechaIngreso,
      creadoEn: row.creadoEn,
      actualizadoEn: row.actualizadoEn,
    };
  }

  protected toRow(entity: Hermano): Record<string, string> {
    return {
      id: entity.id,
      nombres: entity.nombres,
      apellidos: entity.apellidos,
      telefono: entity.telefono ?? '',
      direccion: entity.direccion ?? '',
      celulaId: entity.celulaId ?? '',
      estado: entity.estado ?? '',
      fechaIngreso: entity.fechaIngreso ?? '',
      creadoEn: entity.creadoEn ?? '',
      actualizadoEn: entity.actualizadoEn ?? '',
    };
  }
}
