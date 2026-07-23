import { useMemo, useState } from 'react';
import { Plus, ArchiveRestore } from 'lucide-react';
import { useHabitStore } from '@/store/habitStore';
import { isDueOnDate } from '@/lib/habitSchedule';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { HabitRow } from '@/components/habits/HabitRow';
import { CreateHabitModal } from '@/components/habits/CreateHabitModal';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { startOfWeek, endOfWeek } from 'date-fns';
import type { Habit } from '@/types';

export function HabitsPage() {
  const allHabits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const unarchiveHabit = useHabitStore((s) => s.unarchiveHabit);
  const [createOpen, setCreateOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const today = new Date();
  const habits = useMemo(() => allHabits.filter((h) => !h.archived), [allHabits]);
  const archivedHabits = useMemo(() => allHabits.filter((h) => h.archived), [allHabits]);

  const dueToday = useMemo(
    () => habits.filter((h) => h.schedule.type !== 'weekly_count' && isDueOnDate(h, today)),
    [habits]
  );
  const weeklyQuota = useMemo(() => habits.filter((h) => h.schedule.type === 'weekly_count'), [habits]);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="serif text-xl font-semibold">Привычки</h1>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Новая
        </Button>
      </div>

      {habits.length === 0 ? (
        <ComingSoon icon="Repeat" title="Пока нет привычек" description="Создай первую — например, пить воду или читать каждый день." />
      ) : (
        <>
          {dueToday.length > 0 && (
            <div>
              <h2 className="serif font-semibold mb-3">Сегодня</h2>
              <div className="flex flex-col gap-2">
                {dueToday.map((h) => (
                  <HabitRow key={h.id} habit={h} onEdit={setEditHabit} />
                ))}
              </div>
            </div>
          )}

          {weeklyQuota.length > 0 && (
            <div>
              <h2 className="serif font-semibold mb-3">На этой неделе</h2>
              <div className="flex flex-col gap-2">
                {weeklyQuota.map((h) => {
                  const completedThisWeek = logs.filter((l) => {
                    if (l.habitId !== h.id || !l.completed) return false;
                    const d = new Date(l.date);
                    return d >= weekStart && d <= weekEnd;
                  }).length;
                  return (
                    <Card key={h.id} className="p-0">
                      <div className="px-3.5 py-3">
                        <HabitRow habit={h} onEdit={setEditHabit} />
                        <div className="text-xs text-text-3 mt-2 px-1">
                          {completedThisWeek}/{h.schedule.timesPerWeek} на этой неделе
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {archivedHabits.length > 0 && (
        <div>
          <h2 className="serif font-semibold mb-3 text-text-2">В архиве</h2>
          <div className="flex flex-col gap-2">
            {archivedHabits.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-3.5 py-2.5 text-text-3"
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 opacity-60" style={{ background: `${h.color}22`, color: h.color }}>
                  <IconRenderer name={h.icon} size={15} />
                </span>
                <span className="text-sm flex-1 truncate">{h.name}</span>
                <button
                  onClick={() => unarchiveHabit(h.id)}
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover shrink-0"
                >
                  <ArchiveRestore size={13} /> Восстановить
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateHabitModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <CreateHabitModal open={Boolean(editHabit)} onClose={() => setEditHabit(null)} habit={editHabit} />
    </div>
  );
}
