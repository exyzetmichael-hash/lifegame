import { useState } from 'react';
import clsx from 'clsx';
import { Plus, Lock, Trash2, Award } from 'lucide-react';
import { useGamificationStore, overallLevel } from '@/store/gamificationStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { IconRenderer, ACTIVITY_ICON_CHOICES } from '@/components/ui/IconRenderer';
import { StatRadarChart } from '@/components/gamification/StatRadarChart';
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
  const totalXp = useGamificationStore((s) => s.totalXp);
  const stats = useGamificationStore((s) => s.stats);
  const statDefs = useGamificationStore((s) => s.statDefs);
  const { level, xpIntoLevel, xpForNext } = overallLevel(totalXp);
  const [createOpen, setCreateOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Award');
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
  const statList = Object.values(stats);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="serif text-2xl font-medium flex items-center gap-2.5">
        <Award size={26} />
        Геймификация
      </h1>

      <Card>
        <h2 className="text-[13px] font-semibold text-text-2 mb-4">Уровень персонажа</h2>
        <div className="flex items-center gap-4 mb-6">
          <span className="w-[52px] h-[52px] shrink-0 rounded-full border-[1.5px] border-accent flex items-center justify-center serif font-medium text-lg text-accent tabular-nums">
            {level}
          </span>
          <div className="flex-1">
            <div className="flex justify-between text-[11px] text-text-3 mb-1.5">
              <span>До следующего уровня</span>
              <span className="tabular-nums">
                {xpIntoLevel} / {xpForNext} XP
              </span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-[width] duration-300"
                style={{ width: `${Math.round((xpIntoLevel / xpForNext) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col gap-2.5">
            {statList.map((s) => {
              const pct = Math.min(100, Math.round((s.xp / (s.level * 80)) * 100));
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="w-[34px] h-[34px] shrink-0 rounded-btn bg-sunken text-text-2 flex items-center justify-center">
                    <IconRenderer name={statDefs[s.key].icon} size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[13.5px] mb-1">
                      <span>{s.label}</span>
                      <span className="text-text-3 text-xs tabular-nums">ур. {s.level}</span>
                    </div>
                    <div className="h-[5px] bg-sunken rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <StatRadarChart stats={statList} />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Ачивки · {unlocked.length} / {achievements.length} открыто
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> Своя ачивка
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...unlocked, ...locked].map((a) => (
          <Card key={a.id} className={clsx('flex flex-col gap-2', !a.unlockedAt && 'text-text-3')}>
            <span
              className={clsx(
                'w-[38px] h-[38px] rounded-full flex items-center justify-center',
                a.unlockedAt ? 'bg-accent-tint text-accent' : 'border border-border text-text-3'
              )}
            >
              {a.unlockedAt ? <IconRenderer name={a.icon} size={17} /> : <Lock size={16} />}
            </span>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className={clsx('text-sm font-semibold', !a.unlockedAt && 'text-text-2')}>{a.name}</div>
                <div className="text-[12.5px] text-text-3 mt-0.5 leading-snug">
                  {a.unlockedAt ? a.description : 'Скрыто до разблокировки'}
                </div>
              </div>
              {!a.builtin && (
                <button onClick={() => removeAchievement(a.id)} className="text-text-3 hover:text-p1 shrink-0">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="text-[11.5px] text-text-3 pt-1.5 border-t border-border mt-auto">
              {conditionLabel(a.condition)}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Своя ачивка">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-text-3 mb-1.5 block">Название</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Марафонец"
              className="w-full bg-surface border border-border rounded-sm px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-text-3 mb-1.5 block">Описание</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="За что даётся"
              className="w-full bg-surface border border-border rounded-sm px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-text-3 mb-1.5 block">Иконка</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_ICON_CHOICES.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={clsx(
                    'w-9 h-9 rounded-btn flex items-center justify-center border transition-colors',
                    icon === ic ? 'border-accent bg-accent-tint text-accent' : 'border-border text-text-2 hover:text-text'
                  )}
                >
                  <IconRenderer name={ic} size={17} />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-3 mb-1.5 block">Часов суммарно</label>
              <input
                type="number"
                min={0.1}
                step={0.5}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value) || 0)}
                className="w-full bg-surface border border-border rounded-sm px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-text-3 mb-1.5 block">Награда XP</label>
              <input
                type="number"
                min={0}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value) || 0)}
                className="w-full bg-surface border border-border rounded-sm px-3 py-2.5 text-sm outline-none focus:border-accent"
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
