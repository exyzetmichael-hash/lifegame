import { useState } from 'react';
import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { useGamificationStore } from '@/store/gamificationStore';
import { IconRenderer, ACTIVITY_ICON_CHOICES } from '@/components/ui/IconRenderer';
import type { StatAllocation } from '@/types';

interface StatAllocationEditorProps {
  value: StatAllocation[];
  onChange: (next: StatAllocation[]) => void;
  label?: string;
}

export function StatAllocationEditor({ value, onChange, label = 'Какие статы прокачивает' }: StatAllocationEditorProps) {
  const statDefs = useGamificationStore((s) => s.statDefs);
  const addStat = useGamificationStore((s) => s.addStat);
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState(ACTIVITY_ICON_CHOICES[0]);

  const totalWeight = value.reduce((sum, a) => sum + Math.max(0, a.percent), 0);

  function toggle(key: string) {
    const exists = value.find((a) => a.statKey === key);
    if (exists) {
      onChange(value.filter((a) => a.statKey !== key));
    } else {
      onChange([...value, { statKey: key, percent: value.length === 0 ? 100 : 50 }]);
    }
  }

  function setPercent(key: string, percent: number) {
    onChange(value.map((a) => (a.statKey === key ? { ...a, percent: Math.max(0, percent) } : a)));
  }

  function handleCreateStat() {
    if (!newLabel.trim()) return;
    const def = addStat({ label: newLabel.trim(), icon: newIcon });
    onChange([...value, { statKey: def.key, percent: value.length === 0 ? 100 : 50 }]);
    setNewLabel('');
    setNewIcon(ACTIVITY_ICON_CHOICES[0]);
    setCreating(false);
  }

  return (
    <div>
      <label className="text-xs text-text-2 mb-1.5 block">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.values(statDefs).map((def) => {
          const active = value.some((a) => a.statKey === def.key);
          return (
            <button
              key={def.key}
              type="button"
              onClick={() => toggle(def.key)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-medium border transition-colors',
                active ? 'border-accent bg-accent-tint text-accent' : 'border-border text-text-2 hover:text-text'
              )}
            >
              <IconRenderer name={def.icon} size={13} />
              {def.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-btn text-xs font-medium border border-dashed border-border text-text-3 hover:text-accent hover:border-accent transition-colors"
        >
          <Plus size={13} /> Своя стата
        </button>
      </div>

      {creating && (
        <div className="flex items-center gap-2 mb-3 p-2.5 rounded-btn bg-sunken">
          <div className="flex flex-wrap gap-1 shrink-0">
            {ACTIVITY_ICON_CHOICES.slice(0, 8).map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setNewIcon(ic)}
                className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center border shrink-0',
                  newIcon === ic ? 'border-accent bg-accent-tint text-accent' : 'border-border text-text-2'
                )}
              >
                <IconRenderer name={ic} size={13} />
              </button>
            ))}
          </div>
          <input
            autoFocus
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Название статы"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateStat()}
            className="flex-1 bg-surface border border-border rounded-sm px-2.5 py-1.5 text-sm outline-none focus:border-accent min-w-0"
          />
          <button
            type="button"
            onClick={handleCreateStat}
            disabled={!newLabel.trim()}
            className="text-xs font-semibold text-accent disabled:opacity-40 shrink-0 px-1"
          >
            Добавить
          </button>
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {value.map((alloc) => {
            const def = statDefs[alloc.statKey];
            if (!def) return null;
            const normalized = totalWeight > 0 ? Math.round((alloc.percent / totalWeight) * 100) : 0;
            return (
              <div key={alloc.statKey} className="flex items-center gap-2.5">
                <span className="text-xs text-text-2 flex items-center gap-1.5 w-24 shrink-0 truncate">
                  <IconRenderer name={def.icon} size={12} />
                  {def.label}
                </span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={alloc.percent}
                  onChange={(e) => setPercent(alloc.statKey, Number(e.target.value) || 0)}
                  className="w-16 bg-surface border border-border rounded-sm px-2 py-1 text-xs text-right outline-none focus:border-accent"
                />
                <span className="text-[11px] text-text-3 tabular-nums w-10 shrink-0">≈{normalized}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
