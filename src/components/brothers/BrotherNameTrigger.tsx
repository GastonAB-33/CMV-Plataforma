import { useMemo, useState } from 'react';
import { brothersService } from '../../services/brothersService';
import { useAuth } from '../../hooks/useAuth';
import { BrotherQuickProfileModal } from './BrotherQuickProfileModal';

interface BrotherNameTriggerProps {
  name?: string;
  className?: string;
  fallbackClassName?: string;
}

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const BrotherNameTrigger = ({ name, className, fallbackClassName }: BrotherNameTriggerProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const brother = useMemo(() => {
    if (!name) {
      return undefined;
    }
    const target = normalize(name);
    return brothersService.list().find((entry) => normalize(entry.name) === target);
  }, [name]);

  if (!name) {
    return null;
  }

  if (!brother) {
    return <span className={fallbackClassName}>{name}</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen(true);
        }}
        className={className ?? 'hover:underline'}
      >
        {name}
      </button>
      <BrotherQuickProfileModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        brother={brother}
        currentUser={user}
      />
    </>
  );
};
