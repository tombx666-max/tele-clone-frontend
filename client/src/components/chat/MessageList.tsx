import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Message } from '../../types';
import { DateSeparator } from './DateSeparator';
import { MessageGroup } from './MessageGroup';
import type { MessageBubbleProps } from './MessageBubble';

type ListItem =
  | { type: 'date'; label: string }
  | { type: 'group'; messages: Message[] };

function getDateSeparatorLabel(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  const today = new Date();
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (sameDay) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function groupMessages(messages: Message[]): ListItem[] {
  const result: ListItem[] = [];
  let currentDateLabel: string | null = null;
  let currentSenderKey: string | null = null;
  let currentGroup: Message[] = [];

  function flushGroup() {
    if (currentGroup.length > 0) {
      result.push({ type: 'group', messages: [...currentGroup] });
      currentGroup = [];
    }
  }

  for (const msg of messages) {
    const dateLabel = getDateSeparatorLabel(msg.date);
    const senderKey = msg.sender?.id ?? 'unknown';

    if (dateLabel !== currentDateLabel) {
      flushGroup();
      currentDateLabel = dateLabel;
      currentSenderKey = null;
      result.push({ type: 'date', label: dateLabel });
    }

    if (senderKey !== currentSenderKey) {
      flushGroup();
      currentSenderKey = senderKey;
    }
    currentGroup.push(msg);
  }
  flushGroup();
  return result;
}

const VIRTUALIZE_THRESHOLD = 30;
const ITEM_ESTIMATE_HEIGHT = 120;

export interface MessageListProps extends Omit<MessageBubbleProps, 'message' | 'showSenderLine'> {
  messages: Message[];
  /** When provided and item count exceeds threshold, list is virtualized for performance */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, scrollContainerRef, ...bubbleProps }: MessageListProps) {
  const items = groupMessages(messages);
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollRef = scrollContainerRef ?? parentRef;
  const shouldVirtualize = scrollContainerRef != null && items.length >= VIRTUALIZE_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ITEM_ESTIMATE_HEIGHT,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const paddingBottom = 'max(1rem, env(safe-area-inset-bottom))';

  if (shouldVirtualize) {
    return (
      <div
        ref={scrollContainerRef ? undefined : parentRef}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
          paddingTop: 16,
          paddingBottom,
        }}
        role="list"
        aria-label="Chat messages"
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          if (!item) return null;
          const key =
            item.type === 'date'
              ? `date-${item.label}-${virtualRow.index}`
              : `group-${item.messages[0]?.id ?? virtualRow.index}`;
          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                paddingLeft: 16,
                paddingRight: 16,
                paddingBottom: 12,
              }}
            >
              {item.type === 'date' ? (
                <DateSeparator label={item.label} />
              ) : (
                <MessageGroup messages={item.messages} {...bubbleProps} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <ul
      className="space-y-3 px-4 pt-4"
      style={{ paddingBottom }}
      role="list"
      aria-label="Chat messages"
    >
      {items.map((item, index) =>
        item.type === 'date' ? (
          <DateSeparator key={`date-${item.label}-${index}`} label={item.label} />
        ) : (
          <MessageGroup key={`group-${item.messages[0]?.id ?? index}`} messages={item.messages} {...bubbleProps} />
        )
      )}
    </ul>
  );
}
