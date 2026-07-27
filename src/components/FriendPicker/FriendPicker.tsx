import type { CSSProperties } from 'react';
import type { Friend } from '../../types';
import './FriendPicker.css';

interface FriendPickerProps {
  friends: Friend[];
  value: string | null;
  onChange: (id: string) => void;
  label?: string;
}

export function FriendPicker({ friends, value, onChange, label }: FriendPickerProps) {
  return (
    <div className="friend-picker">
      {label && <span className="friend-picker__label">{label}</span>}
      <div className="friend-picker__chips">
        {friends.map((friend) => (
          <button
            key={friend.id}
            type="button"
            className={`friend-picker__chip${friend.id === value ? ' friend-picker__chip--active' : ''}`}
            style={{ '--chip-color': `var(--lolla-${friend.color ?? 'teal'})` } as CSSProperties}
            onClick={() => onChange(friend.id)}
          >
            <span className="friend-picker__dot" />
            {friend.name}
          </button>
        ))}
      </div>
    </div>
  );
}
