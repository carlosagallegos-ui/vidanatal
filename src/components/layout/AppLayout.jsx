import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background font-nunito">
      <main className="pb-24 max-w-lg mx-auto min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}