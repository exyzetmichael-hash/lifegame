import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useTimerStore } from '@/store/timerStore';
import { useActivityStore } from '@/store/activityStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useThemeStore } from '@/store/themeStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { useSyncStatusStore } from '@/store/syncStatusStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IconRenderer, ACTIVITY_ICON_CHOICES } from '@/components/ui/IconRenderer';
import { CreateActivityModal } from '@/components/timer/CreateActivityModal';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Activity } from '@/types';
import {
  Cloud,
  CloudOff,
  CloudAlert,
  Bell,
  BellOff,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Plus,
  Trash2,
  Lock,
  Pencil,
  ArchiveRestore,
} from 'lucide-react';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[13px] font-semibold uppercase tracking-wide text-text-3 mb-3">{children}</h2>;
}

function FieldRow({
  label,
  value,
  onChange,
  min = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0">
      <span className="text-[13.5px]">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
        className="w-20 bg-surface border border-border rounded-sm px-2 py-1.5 text-sm text-right outline-none focus:border-accent"
      />
    </label>
  );
}

function ToggleRow({ label, desc, on, onToggle }: { label: string; desc?: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0">
      <div>
        <div className="text-sm">{label}</div>
        {desc && <div className="text-[12.5px] text-text-3 mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={onToggle}
        className={clsx('w-10 h-6 rounded-full relative shrink-0 transition-colors', on ? 'bg-accent' : 'bg-border')}
        role="switch"
        aria-checked={on}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow-pop transition-transform"
          style={{ transform: on ? 'translateX(18px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const settings = useTimerStore((s) => s.settings);
  const updateSettings = useTimerStore((s) => s.updateSettings);
  const allActivities = useActivityStore((s) => s.activities);
  const activities = useMemo(() => allActivities.filter((a) => !a.archived), [allActivities]);
  const archivedActivities = useMemo(() => allActivities.filter((a) => a.archived), [allActivities]);
  const archiveActivity = useActivityStore((s) => s.archiveActivity);
  const unarchiveActivity = useActivityStore((s) => s.unarchiveActivity);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const budgets = useActivityStore((s) => s.budgets);
  const setBudget = useActivityStore((s) => s.setBudget);
  const removeBudget = useActivityStore((s) => s.removeBudget);

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const statDefs = useGamificationStore((s) => s.statDefs);
  const addStat = useGamificationStore((s) => s.addStat);
  const removeStat = useGamificationStore((s) => s.removeStat);

  const syncState = useSyncStatusStore((s) => s.state);
  const syncError = useSyncStatusStore((s) => s.lastError);
  const lastSyncAt = useSyncStatusStore((s) => s.lastSyncAt);
  const [newStatOpen, setNewStatOpen] = useState(false);
  const [newStatLabel, setNewStatLabel] = useState('');
  const [newStatIcon, setNewStatIcon] = useState(ACTIVITY_ICON_CHOICES[0]);

  function handleAddStat() {
    if (!newStatLabel.trim()) return;
    addStat({ label: newStatLabel.trim(), icon: newStatIcon });
    setNewStatLabel('');
    setNewStatIcon(ACTIVITY_ICON_CHOICES[0]);
    setNewStatOpen(false);
  }

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
      <h1 className="serif text-2xl font-medium flex items-center gap-2.5">
        <SettingsIcon size={24} />
        Настройки
      </h1>

      <Card>
        <SectionHeading>Оформление</SectionHeading>
        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-[13.5px]">Тема</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setTheme('light')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-[13px] border transition-colors',
                theme === 'light' ? 'border-transparent bg-accent-tint text-accent font-semibold' : 'border-border text-text-2'
              )}
            >
              <Sun size={13} /> Светлая
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-[13px] border transition-colors',
                theme === 'dark' ? 'border-transparent bg-accent-tint text-accent font-semibold' : 'border-border text-text-2'
              )}
            >
              <Moon size={13} /> Тёмная
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeading>Статы персонажа</SectionHeading>
        <p className="text-[12.5px] text-text-3 mb-3">
          Каждая активность и привычка может прокачивать несколько статов сразу — настраивается при создании.
        </p>
        <div className="flex flex-col">
          {Object.values(statDefs).map((def) => (
            <div key={def.key} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <span className="w-7 h-7 rounded-btn bg-sunken text-text-2 flex items-center justify-center shrink-0">
                <IconRenderer name={def.icon} size={14} />
              </span>
              <span className="text-[13.5px] flex-1 truncate">{def.label}</span>
              {def.builtin ? (
                <Lock size={13} className="text-text-3 shrink-0" />
              ) : (
                <button onClick={() => removeStat(def.key)} className="text-text-3 hover:text-p1 shrink-0">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {newStatOpen ? (
          <div className="flex items-center gap-2 mt-3 p-2.5 rounded-btn bg-sunken">
            <div className="flex flex-wrap gap-1 shrink-0">
              {ACTIVITY_ICON_CHOICES.slice(0, 8).map((ic) => (
                <button
                  key={ic}
                  onClick={() => setNewStatIcon(ic)}
                  className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center border shrink-0',
                    newStatIcon === ic ? 'border-accent bg-accent-tint text-accent' : 'border-border text-text-2'
                  )}
                >
                  <IconRenderer name={ic} size={13} />
                </button>
              ))}
            </div>
            <input
              autoFocus
              value={newStatLabel}
              onChange={(e) => setNewStatLabel(e.target.value)}
              placeholder="Название статы"
              onKeyDown={(e) => e.key === 'Enter' && handleAddStat()}
              className="flex-1 bg-surface border border-border rounded-sm px-2.5 py-1.5 text-sm outline-none focus:border-accent min-w-0"
            />
            <button
              onClick={handleAddStat}
              disabled={!newStatLabel.trim()}
              className="text-xs font-semibold text-accent disabled:opacity-40 shrink-0 px-1"
            >
              Добавить
            </button>
          </div>
        ) : (
          <button
            onClick={() => setNewStatOpen(true)}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover font-medium mt-3"
          >
            <Plus size={14} /> Своя стата
          </button>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          {!isSupabaseConfigured || syncState === 'disabled' ? (
            <CloudOff size={16} className="text-text-3" />
          ) : syncState === 'error' ? (
            <CloudAlert size={16} className="text-p1" />
          ) : syncState === 'ok' ? (
            <Cloud size={16} className="text-success" />
          ) : (
            <Cloud size={16} className="text-text-3" />
          )}
          <SectionHeading>Синхронизация</SectionHeading>
        </div>
        {!isSupabaseConfigured ? (
          <p className="text-sm text-text-2">
            Пока работаем локально в этом браузере. Чтобы включить облачную синхронизацию между устройствами, подключим Supabase.
          </p>
        ) : syncState === 'error' ? (
          <>
            <p className="text-sm text-p1">Ошибка синхронизации: {syncError}</p>
            <p className="text-[12.5px] text-text-3 mt-1.5">
              Похоже, в базе Supabase не хватает таблиц или колонок. Открой SQL Editor своего проекта на supabase.com
              и выполни файл <code className="text-text-2">supabase/schema.sql</code> из репозитория ещё раз — он
              безопасно доносит недостающие изменения, не трогая уже сохранённые данные.
            </p>
          </>
        ) : syncState === 'ok' ? (
          <p className="text-sm text-text-2">
            Подключено к Supabase — данные синхронизируются в облаке
            {lastSyncAt ? ` (последний раз: ${new Date(lastSyncAt).toLocaleTimeString('ru-RU')})` : ''}.
          </p>
        ) : (
          <p className="text-sm text-text-2">Подключаемся к Supabase…</p>
        )}
      </Card>

      <Card>
        <SectionHeading>Помодоро</SectionHeading>
        <FieldRow label="Работа, мин" value={settings.pomodoroWorkMin} onChange={(v) => updateSettings({ pomodoroWorkMin: v })} />
        <FieldRow
          label="Короткий перерыв, мин"
          value={settings.pomodoroBreakMin}
          onChange={(v) => updateSettings({ pomodoroBreakMin: v })}
        />
        <FieldRow
          label="Длинный перерыв, мин"
          value={settings.pomodoroLongBreakMin}
          onChange={(v) => updateSettings({ pomodoroLongBreakMin: v })}
        />
        <FieldRow
          label="Циклов до длинного перерыва"
          value={settings.pomodoroCyclesBeforeLongBreak}
          onChange={(v) => updateSettings({ pomodoroCyclesBeforeLongBreak: v })}
        />
      </Card>

      <Card>
        <SectionHeading>Забытый таймер</SectionHeading>
        <FieldRow
          label="Напомнить через, мин"
          value={settings.reminderAfterMin}
          onChange={(v) => updateSettings({ reminderAfterMin: v })}
        />
        <FieldRow
          label="Авто-стоп через, мин"
          value={settings.autoStopAfterMin}
          onChange={(v) => updateSettings({ autoStopAfterMin: v })}
        />
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          {permission === 'granted' ? <Bell size={16} className="text-success" /> : <BellOff size={16} className="text-text-3" />}
          <SectionHeading>Уведомления</SectionHeading>
        </div>

        <div className="flex items-center justify-between gap-3 py-3 border-b border-border">
          <div>
            <div className="text-sm">Разрешение на уведомления</div>
            <div className="text-[12.5px] text-text-3 mt-0.5">
              Статус: {permission === 'granted' ? 'разрешено' : permission === 'unsupported' ? 'не поддерживается' : 'не запрошено'}
            </div>
          </div>
          {permission === 'granted' ? (
            <span className="text-[13px] text-success font-medium shrink-0">Разрешено</span>
          ) : permission !== 'unsupported' ? (
            <Button variant="primary" size="sm" onClick={requestPermission} className="shrink-0">
              Запросить
            </Button>
          ) : null}
        </div>

        <ToggleRow
          label="Вечернее напоминание о привычках"
          desc="Пришлём уведомление, если что-то осталось невыполненным"
          on={eveningReminderEnabled}
          onToggle={() => setEveningReminderEnabled(!eveningReminderEnabled)}
        />
        {eveningReminderEnabled && (
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="text-[13.5px]">Время напоминания</span>
            <input
              type="time"
              value={eveningReminderTime}
              onChange={(e) => setEveningReminderTime(e.target.value)}
              className="bg-surface border border-border rounded-sm px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </div>
        )}
        <p className="text-[12px] text-text-3 pt-1">
          Работают, пока приложение открыто в браузере или на телефоне — без сервера полноценный пуш в закрытое
          приложение не сделать.
        </p>
      </Card>

      <Card>
        <SectionHeading>Активности и цели</SectionHeading>
        <p className="text-[12.5px] text-text-3 mb-2">Часов в неделю — необязательно, для прогресса в дашборде.</p>
        <div className="flex flex-col">
          {activities.map((a) => {
            const budget = budgets.find((b) => b.activityId === a.id);
            return (
              <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} />
                <span className="text-[13.5px] flex-1 truncate flex items-center gap-2">
                  <IconRenderer name={a.icon} size={14} className="text-text-3" />
                  {a.name}
                </span>
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
                  className="w-16 bg-surface border border-border rounded-sm px-2 py-1.5 text-sm text-right outline-none focus:border-accent"
                />
                <span className="text-xs text-text-3 w-8">ч/нед</span>
                <button onClick={() => setEditActivity(a)} className="text-text-3 hover:text-accent shrink-0">
                  <Pencil size={13} />
                </button>
                <button onClick={() => archiveActivity(a.id)} className="text-xs text-text-3 hover:text-p1 shrink-0">
                  Архив
                </button>
              </div>
            );
          })}
        </div>

        {archivedActivities.length > 0 && (
          <>
            <p className="text-[12px] text-text-3 mt-4 mb-1.5">В архиве</p>
            <div className="flex flex-col">
              {archivedActivities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0 text-text-3">
                  <span className="w-2 h-2 rounded-full shrink-0 opacity-50" style={{ background: a.color }} />
                  <span className="text-[13px] flex-1 truncate flex items-center gap-2">
                    <IconRenderer name={a.icon} size={13} />
                    {a.name}
                  </span>
                  <button
                    onClick={() => unarchiveActivity(a.id)}
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover shrink-0"
                  >
                    <ArchiveRestore size={13} /> Восстановить
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <CreateActivityModal open={Boolean(editActivity)} onClose={() => setEditActivity(null)} activity={editActivity} />
    </div>
  );
}
