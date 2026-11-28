import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { ExternalLink, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { messageApi, TOKEN_STORAGE_KEY } from '../services/api';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

const QUICK_REPLIES = [
  'สวัสดีครับ สนใจนัดสัมภาษณ์เบื้องต้นครับ',
  'ขอดู Portfolio หรือ GitHub เพิ่มเติมได้ไหมครับ',
  'สะดวกคุยรายละเอียดงานช่วงเวลาไหนดีครับ?',
];

function getSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return 'http://localhost:3000';
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
}

function formatMessageTime(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatWindow({
  isOpen,
  onClose,
  match,
  effectiveRole,
  currentUser,
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnectedSocket, setIsConnectedSocket] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const connectionId = useMemo(() => {
    if (!match) return '';
    return match.match_id || `${match.candidate_id}_${match.job_id}`;
  }, [match]);

  const partnerInfo = useMemo(() => {
    if (!match) return { title: '', subtitle: '', avatar: FALLBACK_AVATAR };
    const isCandView = effectiveRole === 'candidate';
    return {
      title: isCandView ? match.job_title : match.candidate_name,
      subtitle: isCandView ? match.company_name : match.candidate_title,
      avatar: isCandView
        ? match.company_logo || FALLBACK_AVATAR
        : match.candidate_avatar || FALLBACK_AVATAR,
    };
  }, [match, effectiveRole]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen || !connectionId) return undefined;

    let active = true;
    setIsLoadingHistory(true);
    setErrorMsg('');

    messageApi
      .getMessages(connectionId)
      .then((res) => {
        if (active && res?.success) {
          setMessages(res.data || []);
        }
      })
      .catch((err) => {
        if (active) {
          setErrorMsg(err?.response?.data?.message || 'ไม่สามารถโหลดประวัติแชทได้');
        }
      })
      .finally(() => {
        if (active) setIsLoadingHistory(false);
      });

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const socket = io(getSocketUrl(), {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    const handleConnect = () => {
      if (!active) return;
      setIsConnectedSocket(true);
      socket.emit('join_room', { connectionId });
    };

    const handleDisconnect = () => {
      if (active) setIsConnectedSocket(false);
    };

    const handleConnectError = (err) => {
      if (active) {
        setIsConnectedSocket(false);
        setErrorMsg(err?.message || 'การเชื่อมต่อ Socket.IO ถูกปฏิเสธ');
      }
    };

    const handleReceiveMessage = (incoming) => {
      if (!active || !incoming) return;
      if (incoming.connectionId && incoming.connectionId !== connectionId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;
        return [...prev, incoming];
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      active = false;
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('receive_message', handleReceiveMessage);
      socket.disconnect();
      socketRef.current = null;
      setIsConnectedSocket(false);
    };
  }, [isOpen, connectionId]);

  const sendMessage = useCallback(
    (rawText) => {
      const content = String(rawText || '').trim();
      if (!content || !connectionId || !socketRef.current || isSending) return;

      setIsSending(true);
      setErrorMsg('');

      socketRef.current.emit(
        'send_message',
        { connectionId, content },
        (ack) => {
          setIsSending(false);
          if (ack && !ack.success) {
            setErrorMsg(ack.message || 'ส่งข้อความไม่สำเร็จ');
          }
        }
      );

      setInputText('');
    },
    [connectionId, isSending]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  if (!isOpen || !match) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#141416] rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-lg w-full max-w-lg h-[82vh] max-h-[640px] flex flex-col overflow-hidden animate-editorial-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={partnerInfo.avatar}
              alt={partnerInfo.title}
              className="w-9 h-9 rounded-md object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#111111] dark:text-white truncate">
                  {partnerInfo.title}
                </h3>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isConnectedSocket ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                  title={isConnectedSocket ? 'เชื่อมต่อ Real-time แล้ว' : 'กำลังเชื่อมต่อ'}
                />
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {partnerInfo.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {match.interview_link && (
              <a
                href={match.interview_link}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:border-[#111111] dark:hover:border-neutral-500 text-[11px] font-medium text-neutral-700 dark:text-neutral-200 inline-flex items-center gap-1"
              >
                <span>Google Meet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-300 cursor-pointer"
              aria-label="ปิดหน้าต่างแชท"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA] dark:bg-[#0B0B0C]">
          {isLoadingHistory ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <MessageCircle className="w-6 h-6 text-neutral-300 dark:text-neutral-700 mb-2" />
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                เริ่มต้นบทสนทนาได้เลย
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                เลือกข้อความด่วนด้านล่างหรือพิมพ์ข้อความเพื่อสอบถามรายละเอียดงาน
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2 rounded-lg text-xs leading-relaxed border ${
                      isMine
                        ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111] border-[#111111] dark:border-white'
                        : 'bg-white dark:bg-[#141416] text-[#111111] dark:text-neutral-100 border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="font-mono-num text-[10px] text-neutral-400 mt-1 px-1">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {errorMsg && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-900 text-[11px] text-red-700 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="px-3 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] flex gap-1.5 overflow-x-auto shrink-0">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => sendMessage(reply)}
              className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300 whitespace-nowrap cursor-pointer"
            >
              {reply}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#0B0B0C] border border-neutral-200 dark:border-neutral-800 rounded-md focus:outline-none focus:border-[#111111] dark:focus:border-neutral-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-3.5 py-2 rounded-md bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 text-white dark:text-[#111111] text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ส่ง</span>
          </button>
        </form>
      </div>
    </div>
  );
}
