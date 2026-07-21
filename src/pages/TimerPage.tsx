import { useState } from 'react';
import { PencilLine } from 'lucide-react';
import { useTimerStore } from '@/store/timerStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ActiveSessionView } from '@/components/timer/ActiveSessionView';
import { SetupView } from '@/components/timer/SetupView';
import { SessionHistoryList } from '@/components/timer/SessionHistoryList';
import { ManualEntryModal } from '@/components/timer/ManualEntryModal';

export function TimerPage() {
  const active = useTimerStore((s) => s.active);
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Card>{active ? <ActiveSessionView /> : <SetupView />}</Card>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold">История</h2>
          <Button variant="ghost" size="sm" onClick={() => setManualOpen(true)}>
            <PencilLine size={14} /> Задним числом
          </Button>
        </div>
        <SessionHistoryList />
      </div>

      <ManualEntryModal open={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  );
}
