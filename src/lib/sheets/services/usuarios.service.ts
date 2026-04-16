import { isAllowedRole } from '@/lib/auth/constants';
import { BaseEntityService } from '@/lib/sheets/services/base-entity.service';
import type { Usuario } from '@/lib/sheets/types';

export class UsuariosService extends BaseEntityService<'Usuarios'> {
  constructor() {
    super('Usuarios');
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const usuarios = await this.list();

    return (
      usuarios.find((item) => item.email.trim().toLowerCase() === normalizedEmail) ?? null
    );
  }

  async findAuthorizedByEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.findByEmail(email);

    if (!usuario) {
      return null;
    }

    const normalizedRol = usuario.rol.trim().toLowerCase();

    if (!isAllowedRole(normalizedRol) || !usuario.activo) {
      return null;
    }

    return {
      ...usuario,
      rol: normalizedRol,
    };
  }

  protected fromRow(row: Record<string, string>): Usuario {
    return {
      id: row.id ?? '',
      nombre: row.nombre ?? '',
      email: row.email ?? '',
      rol: row.rol ?? '',
      activo: row.activo === 'true',
      celulaId: row.celulaId,
      creadoEn: row.creadoEn,
      actualizadoEn: row.actualizadoEn,
    };
  }

  protected toRow(entity: Usuario): Record<string, string> {
    return {
      id: entity.id,
      nombre: entity.nombre,
      email: entity.email,
      rol: entity.rol,
      activo: String(entity.activo),
      celulaId: entity.celulaId ?? '',
      creadoEn: entity.creadoEn ?? '',
      actualizadoEn: entity.actualizadoEn ?? '',
    };
  }
}
