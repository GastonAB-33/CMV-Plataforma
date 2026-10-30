export interface FichaBienvenida {
  id: string;
  nombreCompleto: string; // "Nombre y apellido"
  edad: number | string; // "Edad calculada automáticamente"
  fechaNacimiento?: string; // "Fecha de nacimiento"
  telefono: string; // "Teléfono"
  fecha: string; // "Fecha" (YYYY-MM-DD o formato local)
  celulaRecibe: string; // "Célula que lo/la recibe"
  comoLlego: string; // "¿Cómo llegó a la iglesia?"
  deseaContacto: boolean; // "¿Desea que lo/la contactemos? Sí / No"
  motivoOracion?: string; // "Motivo de oración (opcional)"
  observaciones?: string; // "Observaciones"

  // Estado y trazabilidad
  createdAt: string;
  creadoPor?: {
    id: string;
    nombre: string;
  };

  // Derivación pastoral
  estadoDerivacion: 'pendiente' | 'derivado';
  derivadoA?: {
    id: string;
    nombre: string;
    rol: string;
    celula?: string;
  };
  fechaDerivacion?: string;
  derivadoPor?: {
    id: string;
    nombre: string;
  };
  notasDerivacion?: string;

  // Id de hermano opcional si se vinculó en el padrón
  brotherId?: string;
}

export interface LíderODerivadoOption {
  id: string;
  nombre: string;
  rol: string;
  celula?: string;
}

export interface PrimerosPasosStats {
  total: number;
  pendientes: number;
  derivados: number;
  deseanContacto: number;
}
