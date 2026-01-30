import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import type { TelegramUser, Dialog, Message, DownloadProgress, DownloadedFile, AuthStep } from '../types';

interface TelegramContextType {
  // Connection state
  ws: WebSocket | null;
  connected: boolean;
  authStep: AuthStep;
  telegramUser: TelegramUser | null;
  isReconnecting: boolean;
  error: string;

  // Data
  dialogs: Dialog[];
  messages: Message[];
  selectedChat: Dialog | null;
  downloadProgress: DownloadProgress;
  downloadedFiles: DownloadedFile[];
  bulkDownloading: boolean;
  bulkProgress: number;
  /** Messages loaded from "Load all chats" keyed by chatId */
  allMessagesByChat: Record<string, Message[]>;
  loadingAllChats: boolean;
  allChatsProgress: { currentChatIndex: number; totalChats: number; totalMessagesSoFar: number } | null;
  bulkDownloadingAllChats: boolean;
  bulkDownloadAllChatsProgress: number;

  // Actions
  connect: (apiId: string, apiHash: string) => void;
  disconnect: () => void;
  sendCode: (phoneNumber: string) => void;
  verifyCode: (code: string, password?: string) => void;
  selectChat: (chat: Dialog | null) => void;
  loadMessages: (chatId: string, limit?: number) => void;
  loadAllMessagesForAllChats: () => void;
  downloadMedia: (chatId: string, chatName: string, messageId: string, userId?: string, username?: string) => void;
  downloadAllMedia: (chatId: string, chatName: string, mediaType: string, userId?: string, username?: string) => void;
  downloadAllMediaFromAllChats: (userId?: string, username?: string) => void;
  setAuthStep: (step: AuthStep) => void;
  clearError: () => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('credentials');
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(() => {
    const savedApiId = localStorage.getItem('telegramApiId');
    const savedApiHash = localStorage.getItem('telegramApiHash');
    return !!(savedApiId && savedApiHash);
  });
  const [error, setError] = useState('');

  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Dialog | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({});
  const [downloadedFiles, setDownloadedFiles] = useState<DownloadedFile[]>([]);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [allMessagesByChat, setAllMessagesByChat] = useState<Record<string, Message[]>>({});
  const [loadingAllChats, setLoadingAllChats] = useState(false);
  const [allChatsProgress, setAllChatsProgress] = useState<{ currentChatIndex: number; totalChats: number; totalMessagesSoFar: number } | null>(null);
  const [bulkDownloadingAllChats, setBulkDownloadingAllChats] = useState(false);
  const [bulkDownloadAllChatsProgress, setBulkDownloadAllChatsProgress] = useState(0);

  const selectedChatRef = useRef<Dialog | null>(null);
  const pendingChatIdRef = useRef<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Handle WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'connected':
          console.log('WebSocket connected:', data.clientId);
          break;

        case 'authorized':
          setTelegramUser(data.user);
          setAuthStep('authorized');
          setIsReconnecting(false);
          break;

        case 'needAuth':
          setAuthStep('phone');
          setIsReconnecting(false);
          break;

        case 'noSession':
          setAuthStep('credentials');
          setIsReconnecting(false);
          break;

        case 'codeSent':
          setAuthStep('code');
          break;

        case 'need2FA':
          setAuthStep('2fa');
          break;

        case 'dialogs':
          setDialogs(data.dialogs);
          // If we have a pending chat, select it now
          if (pendingChatIdRef.current) {
            const chat = data.dialogs.find((d: Dialog) => d.id === pendingChatIdRef.current);
            if (chat) {
              setSelectedChat(chat);
            }
            pendingChatIdRef.current = null;
          }
          break;

        case 'messages':
          if (selectedChatRef.current?.id === data.chatId) {
            setMessages(data.messages);
          }
          break;

        case 'downloadProgress':
          setDownloadProgress(prev => ({
            ...prev,
            [data.messageId]: data.progress,
          }));
          break;

        case 'downloadComplete':
          setDownloadedFiles(prev => [
            ...prev,
            {
              messageId: data.messageId,
              filename: data.filename,
              path: data.path,
              cloudinaryUrl: data.cloudinaryUrl,
            },
          ]);
          setDownloadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[data.messageId];
            return newProgress;
          });
          break;

        case 'bulkDownloadStart':
          setBulkDownloading(true);
          setBulkProgress(0);
          break;

        case 'bulkDownloadProgress':
          setBulkProgress(data.downloaded);
          break;

        case 'bulkDownloadComplete':
          setBulkDownloading(false);
          break;

        case 'allChatsMessagesStart':
          setLoadingAllChats(true);
          setAllMessagesByChat({});
          setAllChatsProgress({ currentChatIndex: 0, totalChats: data.totalChats, totalMessagesSoFar: 0 });
          break;

        case 'allChatsMessages':
          setAllMessagesByChat(prev => ({ ...prev, [data.chatId]: data.messages }));
          setAllChatsProgress(prev => prev ? {
            currentChatIndex: data.currentChatIndex,
            totalChats: data.totalChats,
            totalMessagesSoFar: data.totalMessagesSoFar,
          } : null);
          if (selectedChatRef.current?.id === data.chatId) {
            setMessages(data.messages);
          }
          break;

        case 'allChatsMessagesComplete':
          setLoadingAllChats(false);
          setAllChatsProgress(null);
          break;

        case 'bulkDownloadAllChatsStart':
          setBulkDownloadingAllChats(true);
          setBulkDownloadAllChatsProgress(0);
          break;

        case 'bulkDownloadAllChatsProgress':
          setBulkDownloadAllChatsProgress(data.totalDownloaded);
          break;

        case 'bulkDownloadAllChatsComplete':
          setBulkDownloadingAllChats(false);
          break;

        case 'error':
          setError(data.message);
          setIsReconnecting(false);
          break;
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback((apiId: string, apiHash: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      setError('');

      // Save credentials
      localStorage.setItem('telegramApiId', apiId);
      localStorage.setItem('telegramApiHash', apiHash);

      // Check for existing session
      socket.send(JSON.stringify({
        type: 'checkSession',
        apiId,
        apiHash,
      }));
    };

    socket.onmessage = handleMessage;

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
    };

    setWs(socket);
  }, [handleMessage]);

  // Auto-reconnect with saved credentials
  useEffect(() => {
    const savedApiId = localStorage.getItem('telegramApiId');
    const savedApiHash = localStorage.getItem('telegramApiHash');

    if (savedApiId && savedApiHash && !connected && !ws) {
      connect(savedApiId, savedApiHash);
    }
  }, [connect, connected, ws]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    setConnected(false);
    setAuthStep('credentials');
    setTelegramUser(null);
    setDialogs([]);
    setMessages([]);
    setSelectedChat(null);
    setAllMessagesByChat({});
    setAllChatsProgress(null);
    localStorage.removeItem('telegramApiId');
    localStorage.removeItem('telegramApiHash');
  }, [ws]);

  // Send verification code
  const sendCode = useCallback((phoneNumber: string) => {
    if (!ws || !connected) return;
    ws.send(JSON.stringify({ type: 'sendCode', phoneNumber }));
  }, [ws, connected]);

  // Verify code
  const verifyCode = useCallback((code: string, password?: string) => {
    if (!ws || !connected) return;
    ws.send(JSON.stringify({ type: 'verifyCode', code, password }));
  }, [ws, connected]);

  // Select chat: use cached allMessagesByChat if available, else fetch
  const selectChat = useCallback((chat: Dialog | null) => {
    setSelectedChat(chat);
    if (!chat) {
      setMessages([]);
      return;
    }
    if (allMessagesByChat[chat.id]?.length) {
      setMessages(allMessagesByChat[chat.id]);
      return;
    }
    setMessages([]);
    if (ws && connected) {
      ws.send(JSON.stringify({ type: 'getMessages', chatId: chat.id, limit: 100 }));
    }
  }, [ws, connected, allMessagesByChat]);

  // Load messages
  const loadMessages = useCallback((chatId: string, limit = 50) => {
    if (!ws || !connected) return;
    ws.send(JSON.stringify({ type: 'getMessages', chatId, limit }));
  }, [ws, connected]);

  // Download media
  const downloadMedia = useCallback((chatId: string, chatName: string, messageId: string, userId?: string, username?: string) => {
    if (!ws || !connected) return;
    ws.send(JSON.stringify({
      type: 'downloadMedia',
      chatId,
      chatName,
      messageId,
      userId,
      username,
    }));
  }, [ws, connected]);

  // Download all media
  const downloadAllMedia = useCallback((chatId: string, chatName: string, mediaType: string, userId?: string, username?: string) => {
    if (!ws || !connected) return;
    ws.send(JSON.stringify({
      type: 'downloadAllMedia',
      chatId,
      chatName,
      mediaType,
      userId,
      username,
    }));
  }, [ws, connected]);

  // Load all messages from all chats
  const loadAllMessagesForAllChats = useCallback(() => {
    if (!ws || !connected) return;
    ws.send(JSON.stringify({ type: 'getAllMessagesForAllChats' }));
  }, [ws, connected]);

  // Download all photos & videos from all chats
  const downloadAllMediaFromAllChats = useCallback((userId?: string, username?: string) => {
    if (!ws || !connected) return;
    ws.send(JSON.stringify({ type: 'downloadAllMediaFromAllChats', userId, username }));
  }, [ws, connected]);

  // Clear error
  const clearError = useCallback(() => setError(''), []);

  const value: TelegramContextType = {
    ws,
    connected,
    authStep,
    telegramUser,
    isReconnecting,
    error,
    dialogs,
    messages,
    selectedChat,
    downloadProgress,
    downloadedFiles,
    bulkDownloading,
    bulkProgress,
    allMessagesByChat,
    loadingAllChats,
    allChatsProgress,
    bulkDownloadingAllChats,
    bulkDownloadAllChatsProgress,
    connect,
    disconnect,
    sendCode,
    verifyCode,
    selectChat,
    loadMessages,
    loadAllMessagesForAllChats,
    downloadMedia,
    downloadAllMedia,
    downloadAllMediaFromAllChats,
    setAuthStep,
    clearError,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}
