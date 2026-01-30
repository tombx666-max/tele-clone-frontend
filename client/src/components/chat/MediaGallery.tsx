import { Download, Check, Lock, Play, Image, Video, ChevronDown } from 'lucide-react';
import { LoadingSpinner } from '../common';
import type { Message, DownloadProgress, DownloadedFile } from '../../types';

const CloudIcon = () => (
  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface MediaGalleryProps {
  messages: Message[];
  getMediaUrl: (messageId: string) => string;
  isDownloaded: (messageId: string) => boolean;
  getDownloadedFile: (messageId: string) => DownloadedFile | undefined;
  onDownloadMedia: (messageId: string) => void;
  canDownload: boolean;
  downloadProgress: DownloadProgress;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
}

function isPhotoOrVideo(msg: Message): boolean {
  return (msg.media?.type === 'photo' || msg.media?.type === 'video') ?? false;
}

function formatDuration(seconds?: number): string {
  if (seconds == null) return '';
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function MediaCard({
  message,
  getMediaUrl,
  isDownloaded,
  getDownloadedFile,
  onDownloadMedia,
  canDownload,
  progress,
}: {
  message: Message;
  getMediaUrl: (id: string) => string;
  isDownloaded: (id: string) => boolean;
  getDownloadedFile: (id: string) => DownloadedFile | undefined;
  onDownloadMedia: (id: string) => void;
  canDownload: boolean;
  progress: number | undefined;
}) {
  const media = message.media!;
  const isVideo = media.type === 'video';
  const thumbnailUrl = media.thumbnail ? `${API_BASE}${media.thumbnail}` : '';
  const downloaded = isDownloaded(message.id);
  const file = getDownloadedFile(message.id);
  const showProgress = progress !== undefined;

  return (
    <article
      className="media-gallery-card group relative aspect-square rounded-xl overflow-hidden bg-telegram-sidebar focus-within:ring-2 focus-within:ring-telegram-accent focus-within:ring-offset-2 focus-within:ring-offset-telegram-bg"
      aria-label={isVideo ? 'Video' : 'Photo'}
    >
      {/* Thumbnail or downloaded media */}
      {downloaded ? (
        isVideo ? (
          <video
            src={getMediaUrl(message.id)}
            controls
            className="absolute inset-0 w-full h-full object-cover"
            preload="metadata"
          />
        ) : (
          <img
            src={getMediaUrl(message.id)}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
      ) : thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-telegram-text-muted">
          {isVideo ? (
            <Video className="w-10 h-10 text-telegram-accent mb-1" />
          ) : (
            <Image className="w-10 h-10 text-telegram-accent mb-1" />
          )}
          <span className="text-xs">{isVideo ? 'Video' : 'Photo'}</span>
        </div>
      )}

      {/* Video: play icon + duration */}
      {isVideo && !downloaded && (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full bg-black/50 p-3">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
          {media.duration != null && (
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
              {formatDuration(media.duration)}
            </span>
          )}
        </>
      )}

      {/* Download progress overlay */}
      {showProgress && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
          <div className="text-center">
            <LoadingSpinner size="lg" className="text-white mx-auto mb-1" />
            <span className="text-sm font-medium text-white">{progress}%</span>
          </div>
        </div>
      )}

      {/* Status badges (downloaded / cloud) */}
      {downloaded && !showProgress && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {file?.cloudinaryUrl && (
            <span
              className="rounded-full bg-blue-500 p-1.5"
              title="Saved to cloud"
            >
              <CloudIcon />
            </span>
          )}
          <span className="rounded-full bg-green-500 p-1.5" title="Downloaded">
            <Check className="w-3.5 h-3.5 text-white" />
          </span>
        </div>
      )}

      {/* Download / PRO overlay when not downloaded and no progress */}
      {!downloaded && !showProgress && (
        <button
          type="button"
          onClick={() => onDownloadMedia(message.id)}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity rounded-xl min-h-[44px] min-w-[44px]"
          aria-label={canDownload ? 'Download' : 'Upgrade to PRO to download'}
        >
          <span
            className={`rounded-full p-3 shadow-lg ${canDownload ? 'bg-telegram-accent hover:bg-telegram-accent-hover' : 'bg-gray-500'} text-white relative`}
          >
            {canDownload ? (
              <Download className="w-6 h-6" />
            ) : (
              <>
                <Lock className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white flex items-center gap-0.5">
                  <Download className="w-2.5 h-2.5 fill-white" />
                  PRO
                </span>
              </>
            )}
          </span>
        </button>
      )}

      {/* No thumbnail: show download button always */}
      {!downloaded && !thumbnailUrl && !showProgress && (
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <button
            type="button"
            onClick={() => onDownloadMedia(message.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white min-h-[44px] ${canDownload ? 'bg-telegram-accent hover:bg-telegram-accent-hover' : 'bg-gray-500 hover:bg-gray-600'} relative`}
          >
            {canDownload ? (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  PRO
                </span>
                Download
              </>
            )}
          </button>
        </div>
      )}
    </article>
  );
}

export function MediaGallery({
  messages,
  getMediaUrl,
  isDownloaded,
  getDownloadedFile,
  onDownloadMedia,
  canDownload,
  downloadProgress,
  onLoadMore,
  loadingMore = false,
  hasMore = true,
}: MediaGalleryProps) {
  const mediaMessages = messages.filter(isPhotoOrVideo);

  if (mediaMessages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[280px] px-4 text-center">
        <div className="rounded-2xl bg-telegram-bg-secondary/50 p-8 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-telegram-accent-muted/50 flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-telegram-accent" />
          </div>
          <h3 className="text-lg font-semibold text-telegram-text mb-1">
            No photos or videos
          </h3>
          <p className="text-sm text-telegram-text-secondary">
            This chat has no photos or videos to download. Load messages first if the chat was just selected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ul
        className="media-gallery-grid grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2 p-3 list-none"
        style={{ paddingBottom: hasMore && onLoadMore ? undefined : 'max(1rem, env(safe-area-inset-bottom))' }}
        role="list"
        aria-label="Photos and videos"
      >
        {mediaMessages.map((message) => (
          <li key={message.id} className="list-none">
            <MediaCard
              message={message}
              getMediaUrl={getMediaUrl}
              isDownloaded={isDownloaded}
              getDownloadedFile={getDownloadedFile}
              onDownloadMedia={onDownloadMedia}
              canDownload={canDownload}
              progress={downloadProgress[message.id]}
            />
          </li>
        ))}
      </ul>
      {hasMore && onLoadMore && (
        <div className="flex justify-center py-4 pb-safe-bottom" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-telegram-accent/15 text-telegram-accent hover:bg-telegram-accent/25 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            aria-label="Load more photos and videos"
          >
            {loadingMore ? (
              <>
                <LoadingSpinner size="md" className="text-telegram-accent" />
                <span>Loading more...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 rotate-180" />
                <span>Load more photos & videos</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
