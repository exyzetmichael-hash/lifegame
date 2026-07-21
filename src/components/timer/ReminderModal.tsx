import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTimerStore } from '@/store/timerStore';
import { getActivity } from '@/store/activityStore';
import { BellRing } from 'lucide-react';

export function ReminderModal() {
  const active = useTimerStore((s) => s.active);
  const dismissReminder = useTimerStore((s) => s.dismissReminder);
  const stop = useTimerStore((s) => s.stop);

  const open = Boolean(active?.reminderShownAt);
  const activity = active ? getActivity(active.activityId) : undefined;

  return (
    <Modal open={open} onClose={dismissReminder} hideCloseButton>
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-14 h-14 rounded-full bg-warning/15 flex items-center justify-center text-warning animate-pulse-ring">
          <BellRing size={28} />
        </div>
        <div>
          <h2 className="text-lg font-semibold font-display">Всё ещё здесь?</h2>
          <p className="text-text-dim text-sm mt-1">
            Таймер «{activity?.name ?? 'активность'}» идёт уже давно. Если ты отвлёкся, лучше остановить —
            иначе он остановится сам.
          </p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <Button variant="danger" className="flex-1" onClick={() => stop()}>
            Стоп
          </Button>
          <Button variant="primary" className="flex-1" onClick={dismissReminder}>
            Продолжаю
          </Button>
        </div>
      </div>
    </Modal>
  );
}
