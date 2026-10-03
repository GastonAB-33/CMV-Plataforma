export interface GroupActivityNews {
  id: string;
  groupName: string;
  category: 'Célula' | 'Grupo de Vida' | 'Jóvenes' | 'Matrimonios' | 'Misericordia' | 'General';
  title: string;
  description: string;
  date: string;
  photoUrl: string;
  attendeesCount?: number;
  featured?: boolean;
}

export interface GeneralModuleItem {
  id: string;
  label: string;
  path: string;
  iconName: 'users' | 'lineChart' | 'home' | 'graduationCap' | 'heartHandshake' | 'award';
  colorScheme: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'teal';
  bgGradient: string;
  textColor: string;
  description: string;
}
