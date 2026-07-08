import { useState, useRef, useEffect, KeyboardEvent } from "react";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import { MOCK_CHATS, CURRENT_USER } from "../data";
import {
  Send,
  ShieldCheck,
  Languages,
  MoreVertical,
  Package,
  Info,
  ArrowLeft,
  MessageSquare,
  Smile,
  Mic,
  Star,
  Trash2,
  CornerUpLeft,
  Forward,
  Plus,
  X,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { LOGO_URL } from "../lib/logo";

export function MessagesView({ userProfile, currentUserId, onUnreadChange, initialContext }: { userProfile?: any, currentUserId: string, onUnreadChange?: (count: number) => void, initialContext?: any }) {
  const [chats, setChats] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isPointerDownRef = useRef(false);
  const [audioData, setAudioData] = useState<number[]>(new Array(20).fill(10));
  const animationRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const chat = activeChatId ? chats.find((c) => c.id === activeChatId) : null;
  const otherParticipant = chat?.participants.find(
    (p) => p.id !== currentUserId,
  );

  useEffect(() => {
    const handleResetChat = () => setActiveChatId(null);
    window.addEventListener('reset-chat', handleResetChat);
    return () => window.removeEventListener('reset-chat', handleResetChat);
  }, []);

  // Fetch inicial e WebSocket
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`/api/chats?userId=${currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          setChats(data);
          // Calcula não lidos - para simplificar, se não for activeChat e msg.senderId != me
          // Aqui usamos 0, pois a API precisaria de campo "read" para contar. Mas podemos manter no localstorage
        }
      } catch (e) {
        console.error("Erro ao carregar chats:", e);
      }
    };

    fetchChats();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WS Connectado');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'history') {
          setChats(prev => prev.map(c => c.id === data.room.id ? data.room : c));
        } else if (data.type === 'message') {
          setChats(prev => {
            const exists = prev.some(c => c.id === data.chatId);
            if (!exists) {
              // Se a sala não existe no estado, precisa buscar de novo (novo chat iniciado)
              fetchChats();
              return prev;
            }
            return prev.map(c => {
              if (c.id === data.chatId) {
                 // Evita duplicar se eu que mandei (o send já atualiza)
                 if (c.messages.some((m: any) => m.id === data.message.id)) return c;
                 return { ...c, messages: [...c.messages, data.message], lastUpdated: data.message.timestamp };
              }
              return c;
            });
          });
          
          if (onUnreadChange && data.message.senderId !== currentUserId && activeChatId !== data.chatId) {
             onUnreadChange(1); // Incrementa
          }
        }
      } catch(e) {
        console.error(e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // Cria ou carrega um chat quando vier do "Contato" em um produto
  useEffect(() => {
    if (initialContext) {
      const startChat = async () => {
        try {
          const res = await fetch('/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUserId,
              currentUserName: userProfile?.name || 'Você',
              currentUserAvatar: userProfile?.avatar || '',
              targetUserId: initialContext.targetUserId,
              targetUserName: initialContext.targetUserName,
              targetUserAvatar: initialContext.targetUserAvatar,
              productId: initialContext.productId,
              productTitle: initialContext.productTitle,
            })
          });
          if (res.ok) {
            const data = await res.json();
            
            // Adiciona aos chats se não existir
            setChats(prev => {
              if (!prev.find(c => c.id === data.id)) {
                return [data, ...prev];
              }
              return prev;
            });
            
            setActiveChatId(data.id);
          }
        } catch (e) {
          console.error("Erro ao iniciar chat via contexto:", e);
        }
      };
      startChat();
    }
  }, [initialContext, currentUserId, userProfile]);

  // Quando ativa um chat, avisa o server e zera notificações (simplificado)
  useEffect(() => {
    if (activeChatId && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'join', userId: currentUserId, chatId: activeChatId }));
      if (onUnreadChange) onUnreadChange(0);
    }
  }, [activeChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChatId) return;

    const newMsg = {
      id: `m${Date.now()}`,
      senderId: currentUserId,
      senderName: userProfile?.name || CURRENT_USER.name,
      senderAvatar: userProfile?.avatar || CURRENT_USER.avatar,
      text: newMessage,
      language: "pt",
      timestamp: new Date().toISOString(),
      replyToMessageId: replyToMessageId || undefined,
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', chatId: activeChatId, message: newMsg }));
    }

    setChats((prevChats) =>
      prevChats.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
            lastUpdated: newMsg.timestamp,
          };
        }
        return c;
      }),
    );

    setNewMessage("");
    setReplyToMessageId(null);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleEmojiClick = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const onEmojiSelect = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleReact = (msgId: string, emoji: string) => {
    setChats((prevChats) =>
      prevChats.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === msgId) {
                // If this emoji is already the reaction, remove it (toggle). If not, add/replace.
                const hasReaction = m.reactions?.some(
                  (r) => r.userId === CURRENT_USER.id && r.emoji === emoji,
                );
                let newReactions = m.reactions ? [...m.reactions] : [];

                if (hasReaction) {
                  newReactions = newReactions.filter(
                    (r) => !(r.userId === CURRENT_USER.id && r.emoji === emoji),
                  );
                } else {
                  // Remove existing from this user
                  newReactions = newReactions.filter(
                    (r) => r.userId !== CURRENT_USER.id,
                  );
                  newReactions.push({ emoji, userId: CURRENT_USER.id });
                }

                return { ...m, reactions: newReactions };
              }
              return m;
            }),
          };
        }
        return c;
      }),
    );
    setSelectedMessageId(null);
  };

  const startRecording = async () => {
    isPointerDownRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isPointerDownRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        if (!activeChatId) return;

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audioMsg = {
          id: `m${Date.now()}`,
          senderId: CURRENT_USER.id,
          text: `Mensagem de voz`,
          language: "pt",
          timestamp: new Date().toISOString(),
          audioUrl: audioUrl,
        };

        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === activeChatId) {
              return {
                ...c,
                messages: [...c.messages, audioMsg],
                lastUpdated: audioMsg.timestamp,
              };
            }
            return c;
          }),
        );

        // Stop all tracks
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream
            .getTracks()
            .forEach((track) => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      audioContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);
      analyzerRef.current.fftSize = 64;
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioVisualizer = () => {
        if (!analyzerRef.current) return;
        analyzerRef.current.getByteFrequencyData(dataArray);

        const bins = Array.from(dataArray).slice(0, 20);
        const mapped = bins.map((val) => Math.max(10, (val / 255) * 100));
        setAudioData(mapped);

        animationRef.current = requestAnimationFrame(updateAudioVisualizer);
      };

      updateAudioVisualizer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setIsRecording(false);
      isPointerDownRef.current = false;
    }
  };

  const stopRecording = () => {
    isPointerDownRef.current = false;
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(console.error);
    }
    setAudioData(new Array(20).fill(10));
    setIsRecording(false);
  };

  return (
    <div className="bg-white h-full w-full overflow-hidden flex">
      {/* Sidebar */}
      <div
        className={`w-full md:w-80 border-r border-slate-200 flex-col bg-slate-50 shrink-0 ${activeChatId ? "hidden md:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-2">
          <img src={LOGO_URL} alt="ShopConnect" className="h-7 w-auto object-contain" />
          <h2 className="text-lg font-bold text-slate-900">Mensagens</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {chats.map((c) => {
            const participant = c.participants.find(
              (p) => p.id !== CURRENT_USER.id,
            );
            const lastMessage = c.messages[c.messages.length - 1];
            return (
              <div
                key={c.id}
                onClick={() => setActiveChatId(c.id)}
                className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${activeChatId === c.id ? "bg-indigo-50" : "hover:bg-slate-100 bg-white"}`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={participant?.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full bg-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {participant?.name}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        {format(new Date(lastMessage.timestamp), "HH:mm")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {lastMessage.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      {chat && otherParticipant ? (
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {/* Chat Header */}
          {selectedMessageId ? (
            <div className="h-16 border-b border-slate-200 bg-indigo-50 flex justify-between items-center px-4 sm:px-6 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center space-x-4">
                <button
                  className="text-slate-600 p-1 hover:bg-indigo-100 rounded-full transition-colors"
                  onClick={() => {
                    setSelectedMessageId(null);
                    setShowMessageMenu(false);
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-slate-700 font-medium text-lg">1</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 text-slate-600">
                <button
                  className="hover:bg-indigo-100 p-2 rounded-full transition-colors"
                  onClick={() => {
                    setReplyToMessageId(selectedMessageId);
                    setSelectedMessageId(null);
                  }}
                >
                  <CornerUpLeft className="w-5 h-5" />
                </button>
                <button
                  className="hover:bg-indigo-100 p-2 rounded-full transition-colors"
                  onClick={() => {
                    setChats((prevChats) =>
                      prevChats.map((c) => {
                        if (c.id === activeChatId) {
                          return {
                            ...c,
                            messages: c.messages.map((m) => {
                              if (m.id === selectedMessageId) {
                                return { ...m, isStarred: !m.isStarred };
                              }
                              return m;
                            }),
                          };
                        }
                        return c;
                      }),
                    );
                    setSelectedMessageId(null);
                  }}
                >
                  <Star
                    className={`w-5 h-5 ${chat.messages.find((m) => m.id === selectedMessageId)?.isStarred ? "fill-amber-400 text-amber-400" : ""}`}
                  />
                </button>
                <button
                  className="hover:bg-indigo-100 p-2 rounded-full transition-colors"
                  onClick={() =>
                    alert(
                      "Informações da mensagem não disponíveis na versão atual.",
                    )
                  }
                >
                  <Info className="w-5 h-5" />
                </button>
                <button
                  className="hover:bg-indigo-100 p-2 rounded-full transition-colors"
                  onClick={() => {
                    setChats((prevChats) =>
                      prevChats.map((c) => {
                        if (c.id === activeChatId) {
                          return {
                            ...c,
                            messages: c.messages.filter(
                              (m) => m.id !== selectedMessageId,
                            ),
                          };
                        }
                        return c;
                      }),
                    );
                    setSelectedMessageId(null);
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                {!chat.messages.find(m => m.id === selectedMessageId)?.audioUrl && (
                  <button
                    className="hover:bg-indigo-100 p-2 rounded-full transition-colors"
                    onClick={() => {
                      const msg = chat.messages.find(m => m.id === selectedMessageId);
                      if (msg) {
                        navigator.clipboard.writeText(msg.text);
                        setSelectedMessageId(null);
                      }
                    }}
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                )}
                <button
                  className="hover:bg-indigo-100 p-2 rounded-full transition-colors"
                  onClick={() => alert("Encaminhar mensagem...")}
                >
                  <Forward className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button
                    className="hover:bg-indigo-100 p-2 rounded-full transition-colors"
                    onClick={() => setShowMessageMenu(!showMessageMenu)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {showMessageMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm"
                        onClick={() => {
                          alert("Mensagem fixada no topo!");
                          setShowMessageMenu(false);
                          setSelectedMessageId(null);
                        }}
                      >
                        Fixar
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm"
                        onClick={() => {
                          setChats(prev => prev.map(c => {
                            if (c.id === activeChatId) {
                              return {
                                ...c,
                                messages: c.messages.map(m => {
                                  if (m.id === selectedMessageId) {
                                    return { 
                                      ...m, 
                                      originalText: m.text,
                                      text: `[Traduzido] ${m.text}` 
                                    };
                                  }
                                  return m;
                                })
                              }
                            }
                            return c;
                          }));
                          setShowMessageMenu(false);
                          setSelectedMessageId(null);
                        }}
                      >
                        Traduzir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-16 border-b border-slate-200 bg-white flex justify-between items-center px-4 sm:px-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  className="md:hidden text-slate-500 hover:text-slate-700 p-1 -ml-2"
                  onClick={() => setActiveChatId(null)}
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <img
                  src={otherParticipant.avatar}
                  alt=""
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 flex items-center text-sm sm:text-base truncate">
                    <span className="truncate">{otherParticipant.name}</span>
                  </h3>
                  <p className="text-xs text-emerald-500 font-medium">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4 text-slate-400 ml-2">
                <button className="hover:text-slate-600 transition-colors p-1">
                  <Package className="w-5 h-5" />
                </button>
                <button className="hover:text-slate-600 transition-colors p-1">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Product Context Banner */}
          <div className="bg-indigo-50 border-b border-indigo-100 px-4 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-0">
            <div className="flex items-center text-xs sm:text-sm text-slate-600 min-w-0 w-full sm:w-auto">
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-indigo-500 shrink-0" />
              <span className="truncate">
                Negociando:{" "}
                <strong className="ml-1 text-slate-900">
                  PlayStation 5 Edição Física
                </strong>
              </span>
            </div>
            <div className="font-medium text-indigo-700 text-xs sm:text-sm pl-5 sm:pl-0">
              R$ 3.500,00
            </div>
          </div>

          {/* Messages List */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50"
            onClick={(e) => {
              if (selectedMessageId) setSelectedMessageId(null);
            }}
          >
            {chat.messages.map((msg) => {
              const isMe = msg.senderId === CURRENT_USER.id;
              const isSystem = msg.isSystem;
              const isSelected = selectedMessageId === msg.id;

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-6">
                    <div className="bg-white border border-slate-200 px-3 sm:px-4 py-2 rounded-full flex items-center shadow-sm text-center max-w-[90%]">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                        {msg.text}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col relative transition-all duration-200 ${isMe ? "items-end" : "items-start"} ${isSelected ? "bg-indigo-50 p-2 -mx-2 rounded-xl" : ""}`}
                >
                  {isSelected && (
                    <div
                      className={`absolute top-0 z-10 flex items-center space-x-1 sm:space-x-3 bg-white rounded-full px-3 sm:px-4 py-2 shadow-xl border border-slate-200 transform -translate-y-[110%] animate-in slide-in-from-bottom-2 duration-200 ${isMe ? "right-2" : "left-2"}`}
                    >
                      {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                        <button
                          key={emoji}
                          className="text-2xl sm:text-3xl hover:scale-125 transition-transform origin-bottom hover:-translate-y-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReact(msg.id, emoji);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                      <div className="w-px h-8 bg-slate-200 mx-1"></div>
                      <button
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMessageId(null);
                        }}
                      >
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>
                  )}

                  <div
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedMessageId(msg.id);
                    }}
                    onTouchStart={() => {
                      longPressTimerRef.current = setTimeout(() => {
                        setSelectedMessageId(msg.id);
                      }, 400);
                    }}
                    onTouchEnd={() => {
                      if (longPressTimerRef.current)
                        clearTimeout(longPressTimerRef.current);
                    }}
                    onTouchMove={() => {
                      if (longPressTimerRef.current)
                        clearTimeout(longPressTimerRef.current);
                    }}
                    onMouseDown={() => {
                      longPressTimerRef.current = setTimeout(() => {
                        setSelectedMessageId(msg.id);
                      }, 400);
                    }}
                    onMouseUp={() => {
                      if (longPressTimerRef.current)
                        clearTimeout(longPressTimerRef.current);
                    }}
                    onMouseLeave={() => {
                      if (longPressTimerRef.current)
                        clearTimeout(longPressTimerRef.current);
                    }}
                    className={`max-w-[85%] sm:max-w-[70%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl cursor-pointer relative flex flex-col gap-1 shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"} ${isSelected ? "ring-2 ring-indigo-400 opacity-90" : "hover:opacity-95"}`}
                  >
                    {msg.replyToMessageId && (
                      <div
                        className={`mb-1 p-2 rounded text-xs border-l-2 opacity-90 ${isMe ? "bg-indigo-700/50 border-white/50 text-indigo-50" : "bg-slate-50 border-indigo-400 text-slate-600"}`}
                      >
                        <div className="font-medium mb-0.5 truncate">
                          Respondendo
                        </div>
                        <p className="truncate opacity-90">
                          {chat.messages.find(
                            (m) => m.id === msg.replyToMessageId,
                          )?.text || "Mensagem de voz"}
                        </p>
                      </div>
                    )}
                    {msg.audioUrl ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium">{msg.text}</p>
                        <audio
                          controls
                          src={msg.audioUrl}
                          className="max-w-[200px] sm:max-w-[250px] h-8"
                        />
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    )}
                    {msg.originalText && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-start text-[10px] sm:text-xs opacity-75">
                        <Languages className="w-3 h-3 mr-1.5 shrink-0 mt-0.5" />
                        <span>{msg.originalText}</span>
                      </div>
                    )}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div
                        className={`absolute -bottom-3 ${isMe ? "right-2" : "left-2"} bg-white border border-slate-200 text-sm px-1.5 py-0.5 rounded-full shadow-sm flex items-center space-x-1`}
                      >
                        {Array.from(
                          new Set(msg.reactions.map((r) => r.emoji)),
                        ).map((emoji) => (
                          <span key={emoji}>{emoji}</span>
                        ))}
                        {msg.reactions.length > 1 && (
                          <span className="text-[10px] text-slate-500 ml-0.5 font-medium">
                            {msg.reactions.length}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 mx-1 flex items-center font-medium">
                    {msg.isStarred && (
                      <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                    )}
                    {format(new Date(msg.timestamp), "HH:mm")}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200 relative">
            {replyToMessageId && (
              <div className="mb-2 bg-slate-50 rounded-lg p-2 sm:p-3 border-l-4 border-indigo-500 flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="text-xs text-indigo-600 font-medium mb-0.5">
                    Respondendo
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">
                    {chat.messages.find((m) => m.id === replyToMessageId)
                      ?.text || "Mensagem de voz"}
                  </p>
                </div>
                <button
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setReplyToMessageId(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 ml-4 z-50">
                <EmojiPicker onEmojiClick={onEmojiSelect} theme={Theme.LIGHT} />
              </div>
            )}
            <div className="relative flex items-center">
              <button
                className="absolute left-2 p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={handleEmojiClick}
              >
                <Smile className="w-5 h-5" />
              </button>
              {isRecording ? (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 sm:pl-12 pr-24 py-3 sm:py-3.5 h-[48px] sm:h-[50px] flex items-center space-x-1 overflow-hidden">
                  <span className="text-red-500 text-xs font-medium mr-2 animate-pulse flex-shrink-0">
                    Gravando
                  </span>
                  <div className="flex-1 flex items-center justify-center space-x-1 h-full">
                    {audioData.map((val, i) => (
                      <div
                        key={i}
                        className="w-1 sm:w-1.5 bg-red-500 rounded-full transition-all duration-75"
                        style={{ height: `${val}%` }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Digite uma mensagem..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 sm:pl-12 pr-24 py-3 sm:py-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-slate-400 shadow-sm"
                />
              )}
              <div className="absolute right-1.5 sm:right-2 flex items-center space-x-1">
                <button
                  className={`p-1.5 sm:p-2 hover:text-indigo-600 transition-colors touch-none select-none ${
                    isRecording
                      ? "text-red-500 animate-pulse"
                      : "text-slate-400"
                  }`}
                  onPointerDown={startRecording}
                  onPointerUp={stopRecording}
                  onPointerLeave={stopRecording}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  className="p-1.5 sm:p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors shadow-sm"
                  onClick={handleSendMessage}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50/50">
          <img src={LOGO_URL} alt="ShopConnect" className="h-16 w-auto object-contain mb-6 opacity-30" />
          <h3 className="text-xl font-medium text-slate-700">Suas Mensagens</h3>
          <p className="text-slate-500 mt-2">
            Selecione uma conversa para começar a negociar.
          </p>
        </div>
      )}
    </div>
  );
}
