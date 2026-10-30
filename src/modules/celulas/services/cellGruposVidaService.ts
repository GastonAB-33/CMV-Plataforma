import { BrotherListItem } from '../../hermanos/types';
import { CellGroupView } from '../components/CellDirectoryCard';
import { getCellBranding } from '../cellBranding';

export interface CellGrupoVida {
  id: string;
  cellKey: string;
  cellName: string;
  nombre: string;
  lider: {
    id?: string;
    name: string;
    fotoUrl?: string;
    role?: string;
  };
  anfitrion?: string;
  horario?: string;
  members: BrotherListItem[];
  totalMembers: number;
}

/**
 * Resuelve y particiona de forma determinista y persistente los Grupos de Vida
 * pertenecientes a cada Célula.
 * Regla de negocio: Toda célula tiene al menos 1 Grupo de Vida, y las células
 * con mayor cantidad de discípulos se subdividen en 2 o más Grupos de Vida activos.
 */
export const getGruposVidaForCell = (cell: CellGroupView): CellGrupoVida[] => {
  const brand = getCellBranding(cell.nombre);
  const cellKey = brand.key;
  const members = cell.members || [];
  const leaders = cell.leaders || [];

  const mainLeader = leaders[0] || {
    id: `leader-${cellKey}-1`,
    name: `Líder ${brand.displayName}`,
    role: 'Líder de Célula',
  };

  const secondaryLeader = leaders[1] || {
    id: `leader-${cellKey}-2`,
    name: leaders[0]?.name ? `${leaders[0].name} (Co-líder)` : `Co-líder ${brand.displayName}`,
    role: 'Líder de Grupo',
  };

  // 1. Célula SAETAS (13 hermanos divididos en 2 Grupos de Vida)
  if (cellKey === 'saetas') {
    const splitIndex = 7;
    const g1Members = members.slice(0, splitIndex);
    const g2Members = members.slice(splitIndex);

    return [
      {
        id: 'saetas-grupo-1',
        cellKey,
        cellName: brand.displayName,
        nombre: 'Grupo de Vida Saetas 1 • Familias',
        lider: {
          id: mainLeader.id,
          name: mainLeader.name || 'Pastor Emanuel Calivar Chanampa',
          fotoUrl: mainLeader.fotoUrl,
          role: 'Pastor / Líder de Célula',
        },
        anfitrion: 'Hogar Familia Calivar',
        horario: 'Jueves 20:30 hs',
        members: g1Members,
        totalMembers: g1Members.length,
      },
      {
        id: 'saetas-grupo-2',
        cellKey,
        cellName: brand.displayName,
        nombre: 'Grupo de Vida Saetas 2 • Jóvenes & Multiplicación',
        lider: {
          id: secondaryLeader.id,
          name: secondaryLeader.name || 'Daniel H. Godoy',
          fotoUrl: secondaryLeader.fotoUrl,
          role: 'Líder de Grupo de Vida',
        },
        anfitrion: 'Hogar Hno. Godoy',
        horario: 'Viernes 20:00 hs',
        members: g2Members,
        totalMembers: g2Members.length,
      },
    ];
  }

  // 2. Célula VIDA (18 hermanos divididos en 2 Grupos de Vida)
  if (cellKey === 'vida') {
    const splitIndex = 10;
    const g1Members = members.slice(0, splitIndex);
    const g2Members = members.slice(splitIndex);

    return [
      {
        id: 'vida-grupo-1',
        cellKey,
        cellName: brand.displayName,
        nombre: 'Grupo de Vida Vida 1 • Hogares de Bendición',
        lider: {
          id: mainLeader.id,
          name: mainLeader.name || 'Marcos Guajardo',
          fotoUrl: mainLeader.fotoUrl,
          role: 'Líder de Célula',
        },
        anfitrion: 'Hogar Familia Guajardo',
        horario: 'Miércoles 20:30 hs',
        members: g1Members,
        totalMembers: g1Members.length,
      },
      {
        id: 'vida-grupo-2',
        cellKey,
        cellName: brand.displayName,
        nombre: 'Grupo de Vida Vida 2 • Familias en Fe',
        lider: {
          id: secondaryLeader.id,
          name: secondaryLeader.name || 'Marilu Araguna',
          fotoUrl: secondaryLeader.fotoUrl,
          role: 'Líder de Grupo de Vida',
        },
        anfitrion: 'Hogar Hna. Araguna',
        horario: 'Jueves 20:00 hs',
        members: g2Members,
        totalMembers: g2Members.length,
      },
    ];
  }

  // 3. Célula MARANATHA (11 hermanos divididos en 2 Grupos de Vida)
  if (cellKey === 'maranatha') {
    const splitIndex = 6;
    const g1Members = members.slice(0, splitIndex);
    const g2Members = members.slice(splitIndex);

    return [
      {
        id: 'maranatha-grupo-1',
        cellKey,
        cellName: brand.displayName,
        nombre: 'Grupo de Vida Maranatha 1 • Luz de Cristo',
        lider: {
          id: mainLeader.id,
          name: mainLeader.name || 'Matias Arellano',
          fotoUrl: mainLeader.fotoUrl,
          role: 'Líder de Célula',
        },
        anfitrion: 'Hogar Familia Arellano',
        horario: 'Jueves 20:30 hs',
        members: g1Members,
        totalMembers: g1Members.length,
      },
      {
        id: 'maranatha-grupo-2',
        cellKey,
        cellName: brand.displayName,
        nombre: 'Grupo de Vida Maranatha 2 • Comunión Fraternal',
        lider: {
          id: secondaryLeader.id,
          name: secondaryLeader.name || 'Líder de Grupo Maranatha',
          fotoUrl: secondaryLeader.fotoUrl,
          role: 'Líder de Grupo de Vida',
        },
        anfitrion: 'Hogar Fraterno Maranatha',
        horario: 'Viernes 20:30 hs',
        members: g2Members,
        totalMembers: g2Members.length,
      },
    ];
  }

  // 4. Célula ALFA Y OMEGA (10 hermanos divididos en 2 Grupos de Vida)
  if (cellKey === 'alfa-omega') {
    const splitIndex = 5;
    const g1Members = members.slice(0, splitIndex);
    const g2Members = members.slice(splitIndex);

    return [
      {
        id: 'alfa-omega-grupo-1',
        cellKey,
        cellName: brand.displayName,
        nombre: 'Grupo de Vida Alfa y Omega 1 • Principio & Fin',
        lider: {
          id: mainLeader.id,
          name: mainLeader.name || 'Líder Alfa y Omega',
          fotoUrl: mainLeader.fotoUrl,
          role: 'Líder de Célula',
        },
        anfitrion: 'Hogar Alfa y Omega Centro',
        horario: 'Jueves 20:00 hs',
        members: g1Members,
        totalMembers: g1Members.length,
      },
      {
        id: 'alfa-omega-grupo-2',
        cellKey,
        cellName: brand.displayName,
        nombre: 'Grupo de Vida Alfa y Omega 2 • Consagración',
        lider: {
          id: secondaryLeader.id,
          name: secondaryLeader.name || 'Co-líder Alfa y Omega',
          fotoUrl: secondaryLeader.fotoUrl,
          role: 'Líder de Grupo de Vida',
        },
        anfitrion: 'Hogar Alfa y Omega Norte',
        horario: 'Sábados 19:30 hs',
        members: g2Members,
        totalMembers: g2Members.length,
      },
    ];
  }

  // 5. Célula SION (7 hermanos en 1 Grupo de Vida Central)
  if (cellKey === 'sion') {
    return [
      {
        id: 'sion-grupo-1',
        cellKey,
        cellName: brand.displayName,
        nombre: 'Grupo de Vida Sion • Monte Santo',
        lider: {
          id: mainLeader.id,
          name: mainLeader.name || 'Marilu Araguna',
          fotoUrl: mainLeader.fotoUrl,
          role: 'Líder de Célula',
        },
        anfitrion: 'Hogar Monte de Sion',
        horario: 'Miércoles 20:00 hs',
        members: members,
        totalMembers: members.length,
      },
    ];
  }

  // 6. Célula NISSI (1 hermano en 1 Grupo de Vida)
  if (cellKey === 'nissi') {
    return [
      {
        id: 'nissi-grupo-1',
        cellKey,
        cellName: brand.displayName,
        nombre: 'Grupo de Vida Nissi • Bandera de Victoria',
        lider: {
          id: mainLeader.id,
          name: mainLeader.name || 'Yamila Llaver',
          fotoUrl: mainLeader.fotoUrl,
          role: 'Líder de Célula',
        },
        anfitrion: 'Hogar Bandera Nissi',
        horario: 'Viernes 20:00 hs',
        members: members,
        totalMembers: members.length,
      },
    ];
  }

  // 7. Células adicionales o personalizadas (Fallback dinámico)
  if (members.length > 8) {
    const splitIndex = Math.ceil(members.length / 2);
    const g1 = members.slice(0, splitIndex);
    const g2 = members.slice(splitIndex);

    return [
      {
        id: `${cellKey}-grupo-1`,
        cellKey,
        cellName: brand.displayName,
        nombre: `Grupo de Vida ${brand.displayName} 1`,
        lider: mainLeader,
        anfitrion: `Hogar ${brand.displayName} 1`,
        horario: 'Jueves 20:00 hs',
        members: g1,
        totalMembers: g1.length,
      },
      {
        id: `${cellKey}-grupo-2`,
        cellKey,
        cellName: brand.displayName,
        nombre: `Grupo de Vida ${brand.displayName} 2`,
        lider: secondaryLeader,
        anfitrion: `Hogar ${brand.displayName} 2`,
        horario: 'Viernes 20:00 hs',
        members: g2,
        totalMembers: g2.length,
      },
    ];
  }

  // Mínimo 1 Grupo de Vida por célula
  return [
    {
      id: `${cellKey}-grupo-1`,
      cellKey,
      cellName: brand.displayName,
      nombre: `Grupo de Vida ${brand.displayName}`,
      lider: mainLeader,
      anfitrion: `Hogar ${brand.displayName}`,
      horario: 'Jueves 20:00 hs',
      members: members,
      totalMembers: members.length,
    },
  ];
};
