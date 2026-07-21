import { useState } from 'react';
import clsx from 'clsx';
import { Plus, Lock, Trash2 } from 'lucide-react';
import { useGamificationStore } from '@/store/gamificationStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { IconRenderer, ACTIVITY_ICON_CHOICES } from '@/components/ui/IconRenderer';
import type { AchievementCondition } from '@/types';

function conditionLabel(c: AchievementCondition): string {
  switch (c.type) {
    case 'total_time':
      return `Наработать ${c.hours} ч суммарно`;
    case 'habit_streak':
      return `Стрик привычки ${c.days} дн.`;
    case 'level_reached':
      return `Достичь ${c.level} уровня`;
    case 'stat_level':
      return `Стат до ${c.level} уровня`;
    case 'todos_completed':
      return `Завершить ${c.count} задач`;
    case 'manual':
      return 'Открывается вручную';
  }
}

export function AchievementsPage() {
  const achievements = useGamificationStore((s) => s.achievements);
  const removeAchievement = useGamificationStore((s) => s.removeAchievement);
  const addAchievement = useGamificationStore((s) => s.addAchievement);
  const [createOpen, setCreateOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Trophy');
  const [hours, setHours] = useState(5);
  const [xpReward, setXpReward] = useState(50);

  function handleCreate() {
    if (!name.trim()) return;
    addAchievement({
      name: name.trim(),
      description: description.trim() || conditionLabel({ type: 'total_time', hours }),
      icon,
      condition: { type: 'total_time', hours },
      xpReward,
    });
    setName('');
    setDescription('');
    setHours(5);
    setXpReward(50);
    setCreateOpen(false);
  }

  const unlocked = achievements.filter((a) => a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold">Ачивки</h1>
          <p className="text-sm text-text-dim">
            {unlocked.length}/{achievements.length} открыто
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Своя ачивка
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...unlocked, ...locked].map((a) => (
          <Card
            key={a.id}
            className={clsx('flex items-start gap-3 p-4', !a.unlockedAt && 'opacity-60')}
          >
            <div
              className={clsx(
                'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                a.unlockedAt ? 'bg-xp/15 text-xp' : 'bg-surface text-text-faint'
              )}
            >
              {a.unlockedAt ? <IconRenderer name={a.icon} size={20} /> : <Lock size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{a.name}</div>
              <div className="text-xs text-text-dim mt-0.5">{a.description}</div>
              <div className="text-[11px] text-text-faint mt-1">{conditionLabel(a.condition)}</div>
            </div>
            {!a.builtin && (
              <button
                onClick={() => removeAchievement(a.id)}
                className="text-text-faint hover:text-danger shrink-0"
              >
                <Trash2 size={14} />
              </button>
            )}
          </Card>
        ))}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Своя ачивка">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Название</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Марафонец"
              className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Описание</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="За что даётся"
              className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Иконка</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_ICON_CHOICES.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={clsx(
                    'w-9 h-9 rounded-xl flex items-center justify-center border transition-colors',
                    icon === ic ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-dim hover:text-text'
                  )}
                >
                  <IconRenderer name={ic} size={17} />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-dim mb-1.5 block">Часов суммарно</label>
              <input
                type="number"
                min={0.1}
                step={0.5}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value) || 0)}
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
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
          </div>
          <Button variant="primary" size="lg" className="w-full mt-1" disabled={!name.trim()} onClick={handleCreate}>
            Создать
          </Button>
        </div>
      </Modal>
    </div>
  );
}
