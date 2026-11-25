import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { messageApi, TOKEN_STORAGE_KEY } from '../services/api';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

const QUICK_REPLIES = [
  'สวัสดีครับ สนใจนัดสัมภาษณ์เบื้องต้นครับ',
  'ขอดู Portfolio เพิ่มเติมได้ไหมครับ',
  'สะดวกคุยรายละเอียดงานวันไหนดีครับ?',
  'ยินดีครับ สามารถส่งลิงก์ Google Meet มาได้เลยครับ',
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
    if (!match) {
      return { title: '', subtitle: '', avatar: FALLBACK_AVATAR };
    }
    const isCandView = effectiveRole === 'candidate';
    return {
      title: isCandView ? match.job_title : match.candidate_name,
      subtitle: isCandView ? match.company_name : match.candidate_title,
      avatar: isCandView
        ? match.company_logo || FALLBACK_AVATAR
        : match.candidate_avatar || FALLBACK_AVATAR,
    };
  }, [match, effectiveRole]);

  // Auto-scroll to newest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Load chat history & establish Socket.io connection when modal opens
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
          setErrorMsg(err?.response?.data?.message || 'ไม่สามารถโหลดประวัติแชตได้');
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
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      active = false;
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
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
        {
          connectionId,
          senderId: currentUser?.id,
          content,
        },
        (ack) => {
          setIsSending(false);
          if (ack && !ack.success) {
            setErrorMsg(ack.message || 'ส่งข้อความไม่สำเร็จ');
          }
        }
      );

      setInputText('');
    },
    [connectionId, currentUser?.id, isSending]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  if (!isOpen || !match) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg h-[85vh] max-h-[680px] flex flex-col overflow-hidden animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={partnerInfo.avatar}
                alt={partnerInfo.title}
                className="w-11 h-11 rounded-2xl object-cover border border-slate-200 bg-slate-100"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  isConnectedSocket ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                title={isConnectedSocket ? 'Real-time Connected' : 'Connecting...'}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 truncate">
                  {partnerInfo.title}
                </h3>
                {match.is_connected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-500 truncate">
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
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold inline-flex items-center gap-1 transition"
                title="เปิดลิงก์สัมภาษณ์ Google Meet"
              >
                <span>Meet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/80">
          {isLoadingHistory ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs font-medium">กำลังโหลดประวัติแชต...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                เริ่มต้นบทสนทนากับ {partnerInfo.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                พิมพ์ข้อความด้านล่าง หรือกดปุ่ม Quick Reply เพื่อทักทายและนัดสัมภาษณ์ได้ทันที
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
                  {!isMine && msg.senderName && (
                    <span className="text-[10px] font-semibold text-slate-500 mb-1 px-1">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs break-words ${
                      isMine
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white rounded-2xl rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-[11px] font-semibold text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Quick Reply Suggestions */}
        <div className="px-3.5 pt-2.5 pb-2 bg-white border-t border-slate-200/80 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Quick Replies</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                type="button"
                disabled={isSending}
                onClick={() => sendMessage(reply)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-[11px] font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 sm:p-3.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="พิมพ์ข้อความเพื่อคุยหรือนัดสัมภาษณ์..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="ส่งข้อความ"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">ส่ง</span>
          </button>
        </form>
      </div>
    </div>
  );
}
