import React from 'react';
import type { Message } from '../../types';
import { MessageBubble, type MessageBubbleProps } from './MessageBubble';

export interface MessageGroupProps extends Omit<MessageBubbleProps, 'message' | 'showSenderLine'> {
  messages: Message[];
}

function MessageGroupComponent({ messages, ...bubbleProps }: MessageGroupProps) {
  if (messages.length === 0) return null;

  return (
    <li className="space-y-0.5 list-none">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          showSenderLine={message === messages[0]}
          {...bubbleProps}
        />
      ))}
    </li>
  );
}

export const MessageGroup = React.memo(MessageGroupComponent);
