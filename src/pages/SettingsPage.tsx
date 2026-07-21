import { useMemo, useState } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { useActivityStore } from '@/store/activityStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Cloud, CloudOff, Bell, BellOff } from 'lucide-react';

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
  const budgets = useActivityStore((s) => s.budgets);
  const setBudget = useActivityStore((s) => s.setBudget);
  const removeBudget = useActivityStore((s) => s.removeBudget);

  const eveningReminderEnabled = useNotificationStore((s) => s.eveningReminderEnabled);
  const eveningReminderTime = useNotificationStore((s) => s.eveningReminderTime);
  const setEveningReminderEnabled = useNotificationStore((s) => s.setEveningReminderEnabled);
  const setEveningReminderTime = useNotificationStore((s) => s.setEveningReminderTime);

  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  async function requestPermission() {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

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
        <div className="flex items-center gap-2 mb-1">
          {permission === 'granted' ? <Bell size={16} className="text-success" /> : <BellOff size={16} className="text-text-faint" />}
          <h2 className="font-display font-semibold">Уведомления</h2>
        </div>
        <p className="text-sm text-text-dim mb-3">
          Работают, пока приложение открыто в браузере/на телефоне (вкладка или установленное PWA) — без
          сервера полноценный пуш в закрытое приложение не сделать.
        </p>

        {permission !== 'granted' && permission !== 'unsupported' && (
          <Button variant="primary" size="sm" onClick={requestPermission} className="mb-3">
            Разрешить уведомления
          </Button>
        )}
        {permission === 'unsupported' && (
          <p className="text-xs text-warning mb-3">Браузер не поддерживает уведомления.</p>
        )}

        <label className="flex items-center justify-between gap-3 py-2.5 border-t border-border">
          <span className="text-sm text-text-dim">Напоминать вечером о привычках</span>
          <button
            onClick={() => setEveningReminderEnabled(!eveningReminderEnabled)}
            className="w-11 h-6 rounded-full relative transition-colors shrink-0"
            style={{ background: eveningReminderEnabled ? 'var(--color-primary)' : 'var(--color-border)' }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: eveningReminderEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </button>
        </label>
        {eveningReminderEnabled && (
          <label className="flex items-center justify-between gap-3 py-2.5 border-t border-border">
            <span className="text-sm text-text-dim">Время</span>
            <input
              type="time"
              value={eveningReminderTime}
              onChange={(e) => setEveningReminderTime(e.target.value)}
              className="bg-surface border border-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </label>
        )}
      </Card>

      <Card>
        <h2 className="font-display font-semibold mb-1">Активности и цели</h2>
        <p className="text-sm text-text-dim mb-2">Часов в неделю — необязательно, для прогресса в дашборде.</p>
        <div className="flex flex-col gap-1.5">
          {activities.map((a) => {
            const budget = budgets.find((b) => b.activityId === a.id);
            return (
              <div key={a.id} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${a.color}22`, color: a.color }}
                >
                  <IconRenderer name={a.icon} size={15} />
                </div>
                <span className="text-sm flex-1 truncate">{a.name}</span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="—"
                  value={budget?.targetHoursPerWeek ?? ''}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!e.target.value || v <= 0) removeBudget(a.id);
                    else setBudget(a.id, v);
                  }}
                  className="w-16 bg-surface border border-border rounded-lg px-2 py-1.5 text-sm text-right outline-none focus:border-primary"
                />
                <span className="text-xs text-text-faint w-6">ч/н</span>
                <button
                  onClick={() => archiveActivity(a.id)}
                  className="text-xs text-text-faint hover:text-danger shrink-0"
                >
                  Архив
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
