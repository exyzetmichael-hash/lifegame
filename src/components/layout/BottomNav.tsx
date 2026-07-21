import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { MoreHorizontal } from 'lucide-react';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { BOTTOM_NAV_ITEMS } from '@/components/layout/nav';
import { useUiStore } from '@/store/uiStore';

export function BottomNav() {
  const moreSheetOpen = useUiStore((s) => s.moreSheetOpen);
  const openMoreSheet = useUiStore((s) => s.openMoreSheet);
  const closeMoreSheet = useUiStore((s) => s.closeMoreSheet);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-stretch justify-around">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center gap-1 py-2.5 text-[10.5px] transition-colors',
                  isActive ? 'text-accent' : 'text-text-3'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <IconRenderer name={item.icon} size={20} strokeWidth={isActive ? 2.2 : 1.7} />
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
        <li className="flex-1">
          <button
            onClick={() => (moreSheetOpen ? closeMoreSheet() : openMoreSheet())}
            className={clsx(
              'flex flex-col items-center justify-center gap-1 py-2.5 text-[10.5px] w-full transition-colors',
              moreSheetOpen ? 'text-accent' : 'text-text-3'
            )}
          >
            <MoreHorizontal size={20} strokeWidth={moreSheetOpen ? 2.2 : 1.7} />
            Ещё
          </button>
        </li>
      </ul>
    </nav>
  );
}
