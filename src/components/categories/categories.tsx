import { Category as CategoryType } from '@/types';
import { Category } from '@/components/category';
import { cn } from '@/lib/utils';

export function Categories({
  categoryCN,
  categories,
  className,
  onRemove,
}: React.ComponentProps<'ul'> & {
  categories: string[] | CategoryType[];
  onRemove?: (name: string) => void;
  categoryCN?: string;
}) {
  if (!categories || categories.length < 0) return null;

  const strCats: string[] = [];
  for (const c of categories) {
    const catName = typeof c === 'string' ? c : c.categoryName;
    if (!strCats.includes(catName)) strCats.push(catName);
  }

  return (
    <ul
      className={cn(
        'flex flex-wrap justify-between content-center space-x-2 space-y-2',
        className
      )}>
      {strCats.map((c) => (
        <li key={c}>
          <Category name={c} onRemove={onRemove} className={categoryCN} />
        </li>
      ))}
    </ul>
  );
}

export default Categories;
