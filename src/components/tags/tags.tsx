import { Tag as TagComponent } from '@/components/tag';
import { cn } from '@/lib/utils';
import { Tag } from '@/types';

export function Tags({
  tags,
  tagCN,
  className,
  onRemove,
}: React.ComponentProps<'ul'> & {
  tagCN?: string;
  tags: string[] | Tag[];
  onRemove?: (name: string) => void;
}) {
  if (!tags || tags.length < 0) return null;

  const strTags: string[] = [];
  for (const t of tags) {
    const tagName = typeof t === 'string' ? t : t.name;
    if (!strTags.includes(tagName)) strTags.push(tagName);
  }

  return (
    <ul
      className={cn(
        'flex flex-wrap justify-between content-center space-x-2 space-y-2',
        className
      )}>
      {strTags.map((t) => (
        <li key={t}>
          <TagComponent name={t} onRemove={onRemove} className={tagCN} />
        </li>
      ))}
    </ul>
  );
}

export default Tags;
