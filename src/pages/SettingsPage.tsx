import { useMemo } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { useActivityStore } from '@/store/activityStore';
import { Card } from '@/components/ui/Card';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Cloud, CloudOff } from 'lucide-react';

function NumberField({ label, value, onChange, min = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-text-dim">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
        className="w-20 bg-surface border border-border rounded-lg px-2 py-1.5 text-sm text-right outline-none focus:border-primary"
      />
    </label>
  );
}

export function SettingsPage() {
  const settings = useTimerStore((s) => s.settings);
  const updateSettings = useTimerStore((s) => s.updateSettings);
  const allActivities = useActivityStore((s) => s.activities);
  const activities = useMemo(() => allActivities.filter((a) => !a.archived), [allActivities]);
  const archiveActivity = useActivityStore((s) => s.archiveActivity);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-xl font-semibold">Настройки</h1>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          {isSupabaseConfigured ? <Cloud size={16} className="text-success" /> : <CloudOff size={16} className="text-warning" />}
          <h2 className="font-display font-semibold">Синхронизация</h2>
        </div>
        <p className="text-sm text-text-dim">
          {isSupabaseConfigured
            ? 'Подключено к Supabase — данные синхронизируются в облаке.'
            : 'Пока работаем локально в этом браузере. Чтобы включить облачную синхронизацию между устройствами, подключим Supabase.'}
        </p>
      </Card>

      <Card>
        <h2 className="font-display font-semibold mb-1">Помодоро</h2>
        <p className="text-sm text-text-dim mb-2">Длительность фаз в минутах.</p>
        <NumberField label="Работа" value={settings.pomodoroWorkMin} onChange={(v) => updateSettings({ pomodoroWorkMin: v })} />
        <NumberField label="Короткий перерыв" value={settings.pomodoroBreakMin} onChange={(v) => updateSettings({ pomodoroBreakMin: v })} />
        <NumberField label="Длинный перерыв" value={settings.pomodoroLongBreakMin} onChange={(v) => updateSettings({ pomodoroLongBreakMin: v })} />
        <NumberField
          label="Циклов до длинного перерыва"
          value={settings.pomodoroCyclesBeforeLongBreak}
          onChange={(v) => updateSettings({ pomodoroCyclesBeforeLongBreak: v })}
        />
      </Card>

      <Card>
        <h2 className="font-display font-semibold mb-1">Забытый таймер</h2>
        <p className="text-sm text-text-dim mb-2">Когда напомнить и когда остановить автоматически.</p>
        <NumberField
          label="Напомнить через (мин)"
          value={settings.reminderAfterMin}
          onChange={(v) => updateSettings({ reminderAfterMin: v })}
        />
        <NumberField
          label="Авто-стоп после (мин)"
          value={settings.autoStopAfterMin}
          onChange={(v) => updateSettings({ autoStopAfterMin: v })}
        />
      </Card>

      <Card>
        <h2 className="font-display font-semibold mb-3">Активности</h2>
        <div className="flex flex-col gap-1.5">
          {activities.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-1.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${a.color}22`, color: a.color }}
              >
                <IconRenderer name={a.icon} size={15} />
              </div>
              <span className="text-sm flex-1">{a.name}</span>
              <button
                onClick={() => archiveActivity(a.id)}
                className="text-xs text-text-faint hover:text-danger"
              >
                Архивировать
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
