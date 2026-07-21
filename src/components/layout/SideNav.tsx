import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { NAV_ITEMS } from '@/components/layout/nav';

export function SideNav() {
  return (
    <nav className="hidden sm:flex flex-col w-60 shrink-0 border-r border-border p-4 gap-1">
      <div className="flex items-center gap-2 px-2 py-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent glow-primary" />
        <span className="font-display font-semibold text-lg text-gradient">LifeQuest</span>
      </div>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isActive ? 'bg-surface text-text glow-primary' : 'text-text-dim hover:text-text hover:bg-surface-hover'
            )
          }
        >
          <IconRenderer name={item.icon} size={18} />
          {item.label}
        </NavLink>
      ))}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mt-auto',
            isActive ? 'bg-surface text-text' : 'text-text-dim hover:text-text hover:bg-surface-hover'
          )
        }
      >
        <IconRenderer name="Settings" size={18} />
        Настройки
      </NavLink>
    </nav>
  );
}
