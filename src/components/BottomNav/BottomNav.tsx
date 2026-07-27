import { NavLink } from 'react-router-dom';
import { CalendarDays, MapPinned, TrainFront, Zap } from 'lucide-react';
import './BottomNav.css';

const TABS = [
  { to: '/', label: 'Today', icon: Zap, end: true },
  { to: '/lineup', label: 'Lineup', icon: CalendarDays },
  { to: '/map', label: 'Map', icon: MapPinned },
  { to: '/trains', label: 'Trains', icon: TrainFront },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}
        >
          <span className="bottom-nav__icon">
            <Icon size={22} strokeWidth={2.25} />
          </span>
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
