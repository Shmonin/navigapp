import { useState, useMemo } from 'react';
import { VirtualListItem, calculateVisibleItems } from '@/utils/performance';

interface UseVirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualList = <T extends { id: string }>(
  items: T[],
  options: UseVirtualListOptions
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const virtualItems: VirtualListItem[] = useMemo(
    () =>
      items.map(item => ({
        id: item.id,
        height: options.itemHeight,
      })),
    [items, options.itemHeight]
  );

  const visibleRange = useMemo(
    () =>
      calculateVisibleItems(
        virtualItems,
        scrollTop,
        options.containerHeight,
        options.overscan
      ),
    [virtualItems, scrollTop, options.containerHeight, options.overscan]
  );

  const visibleItems = useMemo(
    () =>
      items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
        index: visibleRange.startIndex + index,
        item,
      })),
    [items, visibleRange.startIndex, visibleRange.endIndex]
  );

  const totalHeight = virtualItems.reduce((sum, item) => sum + item.height, 0);

  const scrollElementProps = {
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
    style: {
      height: options.containerHeight,
      overflow: 'auto' as const,
    },
  };

  const innerElementProps = {
    style: {
      height: totalHeight,
      position: 'relative' as const,
    },
  };

  return {
    visibleItems,
    totalHeight,
    offsetY: visibleRange.offsetY,
    scrollElementProps,
    innerElementProps,
  };
};