import { User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'single', label: 'Single', icon: User },
  { id: 'multiple', label: 'Multiple', icon: Users },
];

interface CategoryCarouselProps {
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryCarousel({ selectedCategory, onSelectCategory }: CategoryCarouselProps) {
  return (
    <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
      <div className="flex gap-4 px-4 min-w-max">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                'flex flex-col items-center gap-2 min-w-[80px] transition-all duration-300',
                'focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-xl p-2'
              )}
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                  isSelected
                    ? 'bg-primary text-primary-foreground scale-110'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:scale-105'
                )}
                style={isSelected ? { boxShadow: 'var(--shadow-soft)' } : {}}
              >
                <Icon className="w-7 h-7" />
              </div>
              <span
                className={cn(
                  'text-xs text-center font-medium transition-colors',
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
