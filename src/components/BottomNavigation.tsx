import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, Compass, Plus, User } from 'lucide-react';

interface BottomNavigationProps {
  onNewPost?: () => void;
}

const BottomNavigation = ({ onNewPost }: BottomNavigationProps) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/map', icon: Map, label: 'Mappa', active: location.pathname === '/map' || location.pathname === '/' },
    { path: '/experiences', icon: Compass, label: 'Esplora', active: location.pathname === '/experiences' },
    { path: '/post', icon: Plus, label: 'Post', active: location.pathname === '/post', highlight: true },
    { path: '/profile', icon: User, label: 'Profilo', active: location.pathname === '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1100] border-t border-border bg-card text-card-foreground shadow-[0_-2px_12px_hsl(var(--foreground)/0.12)]">
      <div className="flex items-center justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.highlight) {
            return (
              <button
                key={item.path}
                type="button"
                onClick={() =>
                  onNewPost ? onNewPost() : window.dispatchEvent(new CustomEvent('open-new-post'))
                }
                aria-label={item.label}
                className="flex flex-col items-center justify-center flex-1 min-w-0 py-1"
              >
                <span className="flex items-center justify-center w-11 h-11 -mt-5 rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Icon className="w-6 h-6" />
                </span>
                <span className="text-[11px] font-medium mt-0.5">{item.label}</span>
              </button>
            );
          }
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={`flex flex-col items-center py-2 px-2 min-w-0 flex-1 transition-colors ${
                item.active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-6 h-6 mb-0.5" />
              <span className="text-[11px] font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;