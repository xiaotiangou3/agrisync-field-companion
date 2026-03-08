import { LayoutDashboard, Map, Bell, MessageSquare, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'dashboard' | 'map' | 'alerts' | 'pests' | 'advisor';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs = [
  { id: 'dashboard' as Tab, label: 'Home', icon: LayoutDashboard },
  { id: 'map' as Tab, label: 'Map', icon: Map },
  { id: 'alerts' as Tab, label: 'Alerts', icon: Bell },
  { id: 'pests' as Tab, label: 'Pests', icon: Bug },
  { id: 'advisor' as Tab, label: 'Advisor', icon: MessageSquare },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-card/95 backdrop-blur-md pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[64px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <tab.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export type { Tab };
