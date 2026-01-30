import { useRef, useEffect, useState, useCallback } from 'react';
import { MessageCircle, ChevronDown, Image } from 'lucide-react';
import type { Message, Dialog, DownloadProgress, DownloadedFile } from '../../types';
import { LoadingSpinner } from '../common';
import { MediaGallery } from './MediaGallery';

const SCROLL_THRESHOLD_PX = 200;

export interface ChatViewProps {
  messages: Message[];
  loading: boolean;
  selectedChat: Dialog | null;
  formatDate: (timestamp: number) => string;
  getMediaUrl: (messageId: string) => string;
  isDownloaded: (messageId: string) => boolean;
  getDownloadedFile: (messageId: string) => DownloadedFile | undefined;
  onDownloadMedia: (messageId: string) => void;
  canDownload: boolean;
  downloadProgress: DownloadProgress;
  onLoadMoreMessages?: () => void;
  loadingMore?: boolean;
  hasMoreMessages?: boolean;
}

export function ChatView({
  messages,
  loading,
  selectedChat,
  formatDate: _formatDate,
  getMediaUrl,
  isDownloaded,
  getDownloadedFile,
  onDownloadMedia,
  canDownload,
  downloadProgress,
  onLoadMoreMessages,
  loadingMore = false,
  hasMoreMessages = true,
}: ChatViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const prevMessagesLengthRef = useRef(0);
  const userScrolledUpRef = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollToBottom(distanceFromBottom > SCROLL_THRESHOLD_PX);
      if (distanceFromBottom > SCROLL_THRESHOLD_PX) {
        userScrolledUpRef.current = true;
      } else {
        userScrolledUpRef.current = false;
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const prevLen = prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;
    if (prevLen === 0 || (messages.length > prevLen && !userScrolledUpRef.current)) {
      scrollToBottom('smooth');
    }
  }, [messages.length, scrollToBottom]);

  if (!selectedChat) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-0">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-telegram-accent/20 rounded-full blur-3xl" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-telegram-accent to-purple-500 flex items-center justify-center relative shadow-2xl">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-telegram-text mb-3">Welcome to Media Saver</h3>
        <p className="text-center max-w-md text-telegram-text-secondary leading-relaxed mb-6">
          Select a chat from the sidebar to view messages and download media from private channels and groups.
        </p>
      </div>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-0 gap-5">
        <LoadingSpinner size="xl" className="text-telegram-accent" />
        <p className="text-sm font-medium text-telegram-text-secondary">Loading photos & videos...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-0">
        <div className="empty-state">
          <Image className="empty-state-icon w-14 h-14 text-telegram-accent" />
          <p className="empty-state-title">No media yet</p>
          <p className="empty-state-description">Load messages from this chat to see photos and videos to download</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 relative chat-view">
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-container"
        aria-label="Photos and videos"
      >
        <MediaGallery
          messages={messages}
          getMediaUrl={getMediaUrl}
          isDownloaded={isDownloaded}
          getDownloadedFile={getDownloadedFile}
          onDownloadMedia={onDownloadMedia}
          canDownload={canDownload}
          downloadProgress={downloadProgress}
          onLoadMore={onLoadMoreMessages}
          loadingMore={loadingMore}
          hasMore={hasMoreMessages}
        />
        <div ref={messagesEndRef} className="h-px shrink-0" aria-hidden="true" />
      </div>

      {showScrollToBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="chat-scroll-fab absolute right-4 rounded-full bg-telegram-accent hover:bg-telegram-accent-hover text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-telegram-accent focus:ring-offset-2 focus:ring-offset-telegram-bg active:scale-95"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="w-5 h-5 m-2.5" />
        </button>
      )}
    </div>
  );
}
