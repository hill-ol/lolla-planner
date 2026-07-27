import { useCallback, useEffect, useState, type ReactNode } from 'react';

const CLOSE_ANIMATION_MS = 200;

interface SheetProps {
  onClose: () => void;
  className?: string;
  children: (requestClose: () => void) => ReactNode;
}

export function Sheet({ onClose, className, children }: SheetProps) {
  const [closing, setClosing] = useState(false);

  const requestClose = useCallback(() => {
    setClosing(true);
    window.setTimeout(onClose, CLOSE_ANIMATION_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') requestClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [requestClose]);

  return (
    <div className={`sheet-overlay${closing ? ' sheet-overlay--closing' : ''}`} onClick={requestClose}>
      <div
        className={`sheet${className ? ` ${className}` : ''}${closing ? ' sheet--closing' : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet__handle" />
        {children(requestClose)}
      </div>
    </div>
  );
}
