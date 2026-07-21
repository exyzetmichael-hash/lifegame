import { useState } from 'react';
import clsx from 'clsx';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { IconRenderer, ACTIVITY_ICON_CHOICES } from '@/components/ui/IconRenderer';
import { ACTIVITY_COLORS } from '@/store/activityStore';
import { useHabitStore } from '@/store/habitStore';
import { useGamificationStore } from '@/store/gamificationStore';
import type { HabitKind, StatKey } from '@/types';

const WEEKDAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun for display

export function CreateHabitModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addHabit = useHabitStore((s) => s.addHabit);
  const statDefs = useGamificationStore((s) => s.statDefs);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ACTIVITY_ICON_CHOICES[0]);
  const [color, setColor] = useState(ACTIVITY_COLORS[0]);
  const [kind, setKind] = useState<HabitKind>('binary');
  const [targetValue, setTargetValue] = useState(8);
  const [unit, setUnit] = useState('стаканов');
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly_count' | 'weekdays'>('daily');
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [statKey, setStatKey] = useState<StatKey>('discipline');
  const [xpReward, setXpReward] = useState(15);
  const [penaltyXp, setPenaltyXp] = useState(10);

  function reset() {
    setName('');
    setKind('binary');
    setScheduleType('daily');
  }

  function toggleDay(day: number) {
    setDaysOfWeek((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function handleCreate() {
    if (!name.trim()) return;
    addHabit({
      name: name.trim(),
      icon,
      color,
      kind,
      targetValue: kind === 'numeric' ? targetValue : undefined,
      unit: kind === 'numeric' ? unit.trim() || undefined : undefined,
      schedule:
        scheduleType === 'daily'
          ? { type: 'daily' }
          : scheduleType === 'weekly_count'
            ? { type: 'weekly_count', timesPerWeek }
            : { type: 'weekdays', daysOfWeek },
      statKey,
      xpReward,
      penaltyXp,
    });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Новая привычка">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Название</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Пить воду"
            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Цвет</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_COLORS.slice(0, 6).map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={clsx('w-7 h-7 rounded-full', color === c && 'ring-2 ring-offset-2 ring-offset-bg-elevated ring-white')}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Иконка</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_ICON_CHOICES.slice(0, 6).map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center border',
                    icon === ic ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-dim'
                  )}
                >
                  <IconRenderer name={ic} size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Тип</label>
          <div className="flex gap-2">
            <button
              onClick={() => setKind('binary')}
              className={clsx(
                'flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors',
                kind === 'binary' ? 'border-primary bg-primary/10 text-text' : 'border-border text-text-dim'
              )}
            >
              Да/Нет
            </button>
            <button
              onClick={() => setKind('numeric')}
              className={clsx(
                'flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors',
                kind === 'numeric' ? 'border-primary bg-primary/10 text-text' : 'border-border text-text-dim'
              )}
            >
              Число
            </button>
          </div>
        </div>

        {kind === 'numeric' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-dim mb-1.5 block">Цель за день</label>
              <input
                type="number"
                min={1}
                value={targetValue}
                onChange={(e) => setTargetValue(Math.max(1, Number(e.target.value) || 1))}
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-dim mb-1.5 block">Единица</label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="стаканов"
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Расписание</label>
          <div className="flex gap-2 mb-2">
            {(['daily', 'weekdays', 'weekly_count'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setScheduleType(t)}
                className={clsx(
                  'flex-1 px-2 py-2 rounded-xl text-xs font-medium border transition-colors',
                  scheduleType === t ? 'border-primary bg-primary/10 text-text' : 'border-border text-text-dim'
                )}
              >
                {t === 'daily' ? 'Каждый день' : t === 'weekdays' ? 'По дням' : 'X раз/неделю'}
              </button>
            ))}
          </div>
          {scheduleType === 'weekdays' && (
            <div className="flex gap-1.5">
              {WEEKDAY_ORDER.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={clsx(
                    'w-9 h-9 rounded-lg text-xs font-medium border',
                    daysOfWeek.includes(day) ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-dim'
                  )}
                >
                  {WEEKDAY_LABELS[day]}
                </button>
              ))}
            </div>
          )}
          {scheduleType === 'weekly_count' && (
            <input
              type="number"
              min={1}
              max={7}
              value={timesPerWeek}
              onChange={(e) => setTimesPerWeek(Math.max(1, Math.min(7, Number(e.target.value) || 1)))}
              className="w-24 bg-surface border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
            />
          )}
        </div>

        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Какой стат прокачивает</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(statDefs) as StatKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setStatKey(key)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border',
                  statKey === key ? 'border-accent bg-accent/15 text-accent' : 'border-border text-text-dim'
                )}
              >
                {statDefs[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Награда XP</label>
            <input
              type="number"
              min={0}
              value={xpReward}
              onChange={(e) => setXpReward(Number(e.target.value) || 0)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Штраф XP</label>
            <input
              type="number"
              min={0}
              value={penaltyXp}
              onChange={(e) => setPenaltyXp(Number(e.target.value) || 0)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <Button variant="primary" size="lg" className="w-full mt-1" disabled={!name.trim()} onClick={handleCreate}>
          Создать
        </Button>
      </div>
    </Modal>
  );
}
