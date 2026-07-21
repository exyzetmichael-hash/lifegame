export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { to: '/todos?view=inbox', label: 'Входящие', icon: 'Inbox' },
  { to: '/todos?view=today', label: 'Сегодня', icon: 'CircleDot' },
  { to: '/todos?view=upcoming', label: 'Предстоящее', icon: 'CalendarDays' },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { to: '/timer', label: 'Таймер', icon: 'Clock' },
  { to: '/habits', label: 'Привычки', icon: 'Flame' },
  { to: '/', label: 'Дашборд', icon: 'BarChart3' },
  { to: '/achievements', label: 'Геймификация', icon: 'Award' },
];

/** Bottom (mobile) tab bar — a distinct, smaller set since only 5 slots fit. */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Дашборд', icon: 'BarChart3' },
  { to: '/timer', label: 'Таймер', icon: 'Clock' },
  { to: '/habits', label: 'Привычки', icon: 'Flame' },
  { to: '/todos?view=today', label: 'Задачи', icon: 'CircleDot' },
];
