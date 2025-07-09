export interface DragData {
  deltaY: number;
  deltaX: number;
}

export interface UseDragProps {
  htmlElementRef: React.RefObject<HTMLElement | null>;
  onDrag: (d: DragData, e: MouseEvent) => void;
  disabled?: boolean;
}
