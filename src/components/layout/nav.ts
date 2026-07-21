export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Дашборд', icon: 'LayoutDashboard' },
  { to: '/timer', label: 'Таймер', icon: 'Timer' },
  { to: '/habits', label: 'Привычки', icon: 'Repeat' },
  { to: '/todos', label: 'Задачи', icon: 'ListChecks' },
  { to: '/achievements', label: 'Ачивки', icon: 'Trophy' },
];
