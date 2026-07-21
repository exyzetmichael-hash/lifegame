import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { TimerPage } from '@/pages/TimerPage';
import { HabitsPage } from '@/pages/HabitsPage';
import { TodosPage } from '@/pages/TodosPage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/todos" element={<TodosPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
