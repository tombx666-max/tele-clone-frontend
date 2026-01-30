import React from 'react';
import { Download, Check, Lock, Play, Image, Video, FileText } from 'lucide-react';
import { LoadingSpinner } from '../common';
import type { Message, DownloadProgress, DownloadedFile } from '../../types';

const CloudIcon = () => (
  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);

export interface MessageBubbleProps {
  message: Message;
  showSenderLine: boolean;
  formatDate: (timestamp: number) => string;
  getMediaUrl: (messageId: string) => string;
  isDownloaded: (messageId: string) => boolean;
  getDownloadedFile: (messageId: string) => DownloadedFile | undefined;
  onDownloadMedia: (messageId: string) => void;
  canDownload: boolean;
  downloadProgress: DownloadProgress;
}

function MessageBubbleComponent({
  message,
  showSenderLine,
  formatDate,
  getMediaUrl,
  isDownloaded,
  getDownloadedFile,
  onDownloadMedia,
  canDownload,
  downloadProgress,
}: MessageBubbleProps) {
  const progress = downloadProgress[message.id];

  return (
    <div className="flex justify-start group/bubble">
      <div className="message-bubble message-bubble-in message-bubble-tail px-3 py-2 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] select-text">
        {showSenderLine && message.sender && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="avatar avatar-sm from-telegram-accent to-purple-500 text-xs flex-shrink-0">
              {message.sender.firstName?.charAt(0) || '?'}
            </div>
            <span className="text-telegram-accent text-sm font-semibold truncate">
              {message.sender.firstName} {message.sender.lastName}
            </span>
          </div>
        )}

        {message.media && (
          <div className="mb-1.5">
            {message.media.type === 'photo' && (
              <div className="relative">
                {isDownloaded(message.id) ? (
                  <div className="relative">
                    <img
                      src={getMediaUrl(message.id)}
                      alt="Photo"
                      loading="lazy"
                      className="max-w-full rounded-lg cursor-pointer"
                      style={{ maxHeight: '300px' }}
                    />
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    {getDownloadedFile(message.id)?.cloudinaryUrl && (
                      <div className="absolute top-2 left-2 bg-blue-500 rounded-full p-1" title="Saved to cloud">
                        <CloudIcon />
                      </div>
                    )}
                  </div>
                ) : message.media.thumbnail ? (
                  <div className="relative">
                    <img
                      src={`${import.meta.env.VITE_API_URL || ''}${message.media.thumbnail}`}
                      alt="Photo thumbnail"
                      loading="lazy"
                      className="max-w-full rounded-lg"
                      style={{ maxHeight: '300px', minWidth: '200px' }}
                    />
                    {progress !== undefined ? (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <LoadingSpinner size="lg" className="text-white mx-auto mb-2" />
                          <span className="text-white text-sm">{progress}%</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => onDownloadMedia(message.id)}
                        className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <div className={`${canDownload ? 'bg-telegram-accent' : 'bg-gray-500'} rounded-full p-3 relative`}>
                          {canDownload ? (
                            <Download className="w-6 h-6 text-white" />
                          ) : (
                            <>
                              <Lock className="w-6 h-6 text-white" />
                              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full flex items-center">
                                <Download className="w-2 h-2 fill-white" />
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-48 h-32 bg-telegram-sidebar rounded-lg flex flex-col items-center justify-center gap-2 relative">
                    <Image className="w-10 h-10 text-telegram-accent" />
                    <span className="text-xs text-telegram-text-secondary">
                      {message.media.width && message.media.height
                        ? `${message.media.width}×${message.media.height}`
                        : 'Photo'}
                    </span>
                    {progress !== undefined ? (
                      <div className="w-32 bg-telegram-bg rounded-full h-2">
                        <div className="bg-telegram-accent h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    ) : (
                      <button
                        onClick={() => onDownloadMedia(message.id)}
                        className={`flex items-center gap-1 ${canDownload ? 'bg-telegram-accent hover:bg-telegram-accent-hover' : 'bg-gray-500 hover:bg-gray-600'} text-white text-sm px-3 py-1.5 rounded-lg`}
                      >
                        {canDownload ? (
                          <>
                            <Download className="w-4 h-4" />
                            Download
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] font-bold">PRO</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {message.media.type === 'video' && (
              <div className="relative">
                {isDownloaded(message.id) ? (
                  <div className="relative">
                    <video src={getMediaUrl(message.id)} controls className="max-w-full rounded-lg" style={{ maxHeight: '300px' }} />
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    {getDownloadedFile(message.id)?.cloudinaryUrl && (
                      <div className="absolute top-2 left-2 bg-blue-500 rounded-full p-1" title="Saved to cloud">
                        <CloudIcon />
                      </div>
                    )}
                  </div>
                ) : message.media.thumbnail ? (
                  <div className="relative">
                    <img
                      src={`${import.meta.env.VITE_API_URL || ''}${message.media.thumbnail}`}
                      alt="Video thumbnail"
                      loading="lazy"
                      className="max-w-full rounded-lg"
                      style={{ maxHeight: '300px', minWidth: '200px' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/50 rounded-full p-3">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                    {message.media.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                        {Math.floor(message.media.duration / 60)}:{(message.media.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                    {progress !== undefined ? (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <LoadingSpinner size="lg" className="text-white mx-auto mb-2" />
                          <span className="text-white text-sm">{progress}%</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => onDownloadMedia(message.id)}
                        className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <div className={`${canDownload ? 'bg-telegram-accent' : 'bg-gray-500'} rounded-full p-3 relative`}>
                          {canDownload ? (
                            <Download className="w-6 h-6 text-white" />
                          ) : (
                            <>
                              <Lock className="w-6 h-6 text-white" />
                              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full flex items-center">
                                <Download className="w-2 h-2 fill-white" />
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-48 h-32 bg-telegram-sidebar rounded-lg flex flex-col items-center justify-center gap-2 relative">
                    <div className="relative">
                      <Video className="w-10 h-10 text-telegram-accent" />
                      <Play className="w-4 h-4 text-white bg-telegram-accent rounded-full p-0.5 absolute -bottom-1 -right-1" />
                    </div>
                    <span className="text-xs text-telegram-text-secondary">
                      {message.media.duration
                        ? `${Math.floor(message.media.duration / 60)}:${(message.media.duration % 60).toString().padStart(2, '0')}`
                        : 'Video'}
                      {message.media.size && ` • ${(parseInt(message.media.size) / 1024 / 1024).toFixed(1)} MB`}
                    </span>
                    {progress !== undefined ? (
                      <div className="w-32 bg-telegram-bg rounded-full h-2">
                        <div className="bg-telegram-accent h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    ) : (
                      <button
                        onClick={() => onDownloadMedia(message.id)}
                        className={`flex items-center gap-1 ${canDownload ? 'bg-telegram-accent hover:bg-telegram-accent-hover' : 'bg-gray-500 hover:bg-gray-600'} text-white text-sm px-3 py-1.5 rounded-lg`}
                      >
                        {canDownload ? (
                          <>
                            <Download className="w-4 h-4" />
                            Download
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] font-bold">PRO</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {message.media.type === 'document' && (
              <div className="flex items-center gap-3 p-3 bg-telegram-sidebar rounded-lg">
                <FileText className="w-10 h-10 text-telegram-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">Document</p>
                  {message.media.size && (
                    <p className="text-xs text-telegram-text-secondary">{(parseInt(message.media.size) / 1024 / 1024).toFixed(2)} MB</p>
                  )}
                </div>
                {isDownloaded(message.id) ? (
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : progress !== undefined ? (
                  <LoadingSpinner size="md" className="text-telegram-accent flex-shrink-0" />
                ) : (
                  <button onClick={() => onDownloadMedia(message.id)} className={`p-2 hover:bg-telegram-bg rounded-full transition-colors flex-shrink-0 ${!canDownload ? 'relative' : ''}`}>
                    {canDownload ? (
                      <Download className="w-5 h-5 text-telegram-accent" />
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-gray-400" />
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[6px] font-bold px-1 py-0.5 rounded-full flex items-center">
                          <Download className="w-2 h-2 fill-white" />
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {message.text && (
          <p className="text-telegram-text whitespace-pre-wrap break-words leading-relaxed text-sm">
            {message.text}
          </p>
        )}

        <div className="flex items-center justify-end gap-1.5 mt-1 min-h-[1rem]">
          <span
            className="text-[10px] text-telegram-text-muted/90 opacity-80 group-hover/bubble:opacity-100 transition-opacity"
            title={formatDate(message.date)}
          >
            {formatDate(message.date)}
          </span>
        </div>
      </div>
    </div>
  );
}

export const MessageBubble = React.memo(MessageBubbleComponent);
