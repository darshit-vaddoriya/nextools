import React from 'react';
import { Star } from 'lucide-react';
import { useFavorites } from '../utils/favorites';
import { useToast } from './Toast';

interface FavoriteButtonProps {
  toolId: string;
  toolName?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  toolId, toolName = '', className = '', size = 'sm',
}) => {
  const { isFavorite, toggle } = useFavorites();
  const { toast } = useToast();
  const active = isFavorite(toolId);

  const dims = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const icon = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggle(toolId);
    toast({
      title: active ? 'Removed from favorites' : 'Added to favorites',
      description: toolName || undefined,
      variant: 'info',
      duration: 2000,
    });
  };

  return (
    <button
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${toolName} from favorites` : `Add ${toolName} to favorites`}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      className={`${dims} inline-flex items-center justify-center rounded-lg border transition-colors duration-150 ${
        active
          ? 'border-warning/40 bg-warning/10 text-warning hover:bg-warning/15'
          : 'border-border text-muted-foreground hover:text-warning hover:border-warning/40 hover:bg-warning/5 bg-transparent'
      } ${className}`}
    >
      <Star className={`${icon} ${active ? 'fill-current' : ''}`} />
    </button>
  );
};
