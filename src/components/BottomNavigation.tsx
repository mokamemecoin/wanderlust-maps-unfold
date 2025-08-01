import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Map, MapPin, Plane, MessageCircle } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/users', icon: Users, label: 'Users', active: location.pathname === '/users' },
    { path: '/trips', icon: Plane, label: 'Trips', active: location.pathname === '/trips' },
    { path: '/destinations', icon: MapPin, label: 'Destinations', active: location.pathname === '/destinations' },
    { path: '/', icon: Map, label: 'Home Page', active: location.pathname === '/' },
    { path: '/experiences', icon: MessageCircle, label: 'Experiences', active: location.pathname === '/experiences' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white">
      <div className="flex items-center justify-around py-2 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors ${
                item.active 
                  ? 'text-primary' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;