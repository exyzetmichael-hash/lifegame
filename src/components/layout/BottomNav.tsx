import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { NAV_ITEMS } from '@/components/layout/nav';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 sm:hidden glass-panel border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-stretch justify-around">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] transition-colors',
                  isActive ? 'text-accent' : 'text-text-faint'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <IconRenderer name={item.icon} size={20} strokeWidth={isActive ? 2.4 : 2} />
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
