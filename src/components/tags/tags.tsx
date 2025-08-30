import { Tag as TagComponent } from '@/components/tag';
import { cn } from '@/lib/utils';
import { Tag } from '@/types';

export function Tags({
  tags,
  tagCN,
  closeBtnCN,
  className,
  onRemove,
}: React.ComponentProps<'ul'> & {
  onRemove?: (name: string) => void;
  tags: string[] | Tag[];
  closeBtnCN?: string;
  tagCN?: string;
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
        'w-full flex flex-wrap justify-center content-center gap-2',
        className
      )}>
      {strTags.map((t) => (
        <li key={t} className='max-w-full'>
          <TagComponent
            name={t}
            className={tagCN}
            onRemove={onRemove}
            closeBtnCN={closeBtnCN}
          />
        </li>
      ))}
    </ul>
  );
}

export default Tags;
