import { Link, useLocation } from 'react-router-dom';
import { Home, Baby, Calendar, FlaskConical, BookHeart, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/gestograma', icon: Baby, label: 'Bebé' },
  { path: '/calendario', icon: Calendar, label: 'Agenda' },
  { path: '/estudios', icon: FlaskConical, label: 'Estudios' },
  { path: '/diario', icon: BookHeart, label: 'Diario' },
  { path: '/alarmas', icon: AlertTriangle, label: 'Alarmas' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary/70'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-all duration-200',
                active && 'gradient-rose shadow-md shadow-primary/30'
              )}>
                <Icon className={cn('w-4 h-4', active ? 'text-white' : '')} />
              </div>
              <span className={cn('text-[10px] font-semibold', active ? 'text-primary' : '')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}