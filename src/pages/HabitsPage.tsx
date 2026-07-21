import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useHabitStore } from '@/store/habitStore';
import { isDueOnDate } from '@/lib/habitSchedule';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HabitRow } from '@/components/habits/HabitRow';
import { CreateHabitModal } from '@/components/habits/CreateHabitModal';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { startOfWeek, endOfWeek } from 'date-fns';

export function HabitsPage() {
  const allHabits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const [createOpen, setCreateOpen] = useState(false);
  const today = new Date();
  const habits = useMemo(() => allHabits.filter((h) => !h.archived), [allHabits]);

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
                  <HabitRow key={h.id} habit={h} />
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
                        <HabitRow habit={h} />
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

      <CreateHabitModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
