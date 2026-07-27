"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, LogOut, Users, MessageSquare, User, Plus, ArrowRight } from "lucide-react";

interface Participant {
  id: number;
  room_id: number;
  token: string;
  nickname: string;
  joined_at: string;
  last_active: string;
}

interface Room {
  id: number;
  code: string;
  max_participants: number;
  participants: Participant[];
  created_at: string;
}

interface Message {
  id: number;
  room_id: number;
  sender_nickname: string;
  content: string;
  created_at: string;
}

interface SavedRoom {
  code: string;
  nickname: string;
  lastSeen: string;
}

const LS_NICKNAME = "fish_nickname";
const LS_TOKEN = "fish_token";
const LS_ROOM_CODE = "fish_room_code";
const LS_ROOM_ID = "fish_room_id";
const LS_ROOMS = "fish_saved_rooms";

export default function FishPage() {
  const [nickname, setNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [roomStatus, setRoomStatus] = useState<Record<string, { count: number; max: number }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMsgIdRef = useRef(0);

  // Scroll messages container to latest
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Restore session on load
  useEffect(() => {
    const savedNick = localStorage.getItem(LS_NICKNAME);
    const savedToken = localStorage.getItem(LS_TOKEN);
    const savedRoomCode = localStorage.getItem(LS_ROOM_CODE);
    const savedRoomId = localStorage.getItem(LS_ROOM_ID);

    if (savedNick) setNickname(savedNick);

    // Load saved room history
    loadSavedRooms();

    if (savedToken && savedRoomCode && savedRoomId) {
      restoreSession(savedToken, savedRoomCode, parseInt(savedRoomId), savedNick || "");
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadSavedRooms = () => {
    try {
      const raw = localStorage.getItem(LS_ROOMS);
      if (raw) {
        const rooms: SavedRoom[] = JSON.parse(raw);
        setSavedRooms(rooms);
        // Fetch status for each room
        rooms.forEach(r => {
          fetch("/api/fish/room/" + encodeURIComponent(r.code))
            .then(res => res.json())
            .then(data => {
              if (data.room) {
                setRoomStatus(prev => ({ ...prev, [r.code]: { count: data.room.participants.length, max: data.room.max_participants } }));
              }
            })
            .catch(() => {});
        });
      }
    } catch {}
  };

  const saveRoomToHistory = (code: string, nick: string) => {
    const existing = localStorage.getItem(LS_ROOMS);
    let rooms: SavedRoom[] = existing ? JSON.parse(existing) : [];
    rooms = rooms.filter(r => r.code !== code);
    rooms.unshift({ code, nickname: nick, lastSeen: new Date().toISOString() });
    if (rooms.length > 20) rooms = rooms.slice(0, 20);
    localStorage.setItem(LS_ROOMS, JSON.stringify(rooms));
    setSavedRooms(rooms);
  };

  const removeRoomFromHistory = (code: string) => {
    const existing = localStorage.getItem(LS_ROOMS);
    let rooms: SavedRoom[] = existing ? JSON.parse(existing) : [];
    rooms = rooms.filter(r => r.code !== code);
    localStorage.setItem(LS_ROOMS, JSON.stringify(rooms));
    setSavedRooms(rooms);
    setRoomStatus(prev => {
      const copy = { ...prev };
      delete copy[code];
      return copy;
    });
  };

  const handleEnterSavedRoom = async (code: string, nick: string) => {
    setIsLoading(true);
    try {
      const joinRes = await fetch("/api/fish/room/" + encodeURIComponent(code) + "/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nick }),
      });
      if (!joinRes.ok) {
        alert("房间不可用");
        return;
      }
      const data = await joinRes.json();
      saveSession(nick, data.participantToken, data.room.code, data.room.id);
      saveRoomToHistory(data.room.code, nick);
      setRoom(data.room);
      setParticipantToken(data.participantToken);
      lastMsgIdRef.current = 0;
      setMessages([]);
      setIsChatting(true);
    } catch {
      alert("进入房间失败");
    } finally {
      setIsLoading(false);
    }
  };

  const restoreSession = async (token: string, code: string, roomId: number, nick: string) => {
    try {
      // Try to use existing token first
      const pRes = await fetch("/api/fish/participant?participantToken=" + encodeURIComponent(token));
      if (pRes.ok) {
        // Token is still valid - restore directly
        const rRes = await fetch("/api/fish/room/" + encodeURIComponent(code) + "/full?participantToken=" + encodeURIComponent(token));
        if (rRes.ok) {
          const rData = await rRes.json();
          setRoom(rData.room);
          setParticipantToken(token);
          setIsChatting(true);
          fetchMessages(token, roomId);
          return;
        }
      }
      // Token expired or room gone - re-join with same nickname (creates new token)
      const joinRes = await fetch("/api/fish/room/" + encodeURIComponent(code) + "/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nick }),
      });
      if (!joinRes.ok) throw new Error("cannot rejoin");
      const joinData = await joinRes.json();
      saveSession(nick, joinData.participantToken, joinData.room.code, joinData.room.id);
      setRoom(joinData.room);
      setParticipantToken(joinData.participantToken);
      setIsChatting(true);
      fetchMessages(joinData.participantToken, joinData.room.id);
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = useCallback(async (token: string, roomId: number) => {
    try {
      const res = await fetch("/api/fish/room/" + roomId + "/messages?participantToken=" + encodeURIComponent(token));
      if (!res.ok) return;
      const data = await res.json();
      const msgs: Message[] = data.messages || [];
      if (msgs.length > 0) {
        const lastId = msgs[msgs.length - 1].id;
        if (lastId > lastMsgIdRef.current) {
          lastMsgIdRef.current = lastId;
          setMessages(msgs);
        }
      }
    } catch {
      // ignore polling errors
    }
  }, []);

  // Polling
  useEffect(() => {
    if (!isChatting || !participantToken || !room) return;

    fetchMessages(participantToken, room.id);
    pollRef.current = setInterval(() => {
      if (participantToken && room) {
        fetchMessages(participantToken, room.id);
      }
    }, 2000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isChatting, participantToken, room, fetchMessages]);

  const handleCreateRoom = async () => {
    if (!nickname.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/fish/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      saveSession(nickname.trim(), data.participantToken, data.room.code, data.room.id);
      saveRoomToHistory(data.room.code, nickname.trim());
      setRoom(data.room);
      setParticipantToken(data.participantToken);
      lastMsgIdRef.current = 0;
      setMessages([]);
      setIsChatting(true);
    } catch {
      alert("创建房间失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!nickname.trim() || !code) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/fish/room/" + encodeURIComponent(code) + "/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      saveSession(nickname.trim(), data.participantToken, data.room.code, data.room.id);
      saveRoomToHistory(data.room.code, nickname.trim());
      setRoom(data.room);
      setParticipantToken(data.participantToken);
      lastMsgIdRef.current = 0;
      setMessages([]);
      setIsChatting(true);
    } catch {
      alert("加入房间失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = sendingMsg.trim();
    if (!msg || !participantToken || !room) return;
    setSendingMsg("");
    try {
      await fetch("/api/fish/room/" + room.id + "/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantToken, content: msg }),
      });
      if (participantToken) fetchMessages(participantToken, room.id);
    } catch {
      // ignore
    }
    inputRef.current?.focus();
  };

  const handleLeaveRoom = () => {
    clearSession();
    setRoom(null);
    setParticipantToken(null);
    setMessages([]);
    setIsChatting(false);
    lastMsgIdRef.current = 0;
  };

  const handleFullyLeaveRoom = async () => {
    if (!participantToken || !room) return;
    try {
      await fetch("/api/fish/room/" + room.id + "/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantToken }),
      });
    } catch {
      // ignore
    }
    handleLeaveRoom();
  };

  const handleReset = () => {
    clearSession();
    setRoom(null);
    setParticipantToken(null);
    setMessages([]);
    setIsChatting(false);
    lastMsgIdRef.current = 0;
  };

  function saveSession(nick: string, token: string, code: string, roomId: number) {
    localStorage.setItem(LS_NICKNAME, nick);
    localStorage.setItem(LS_TOKEN, token);
    localStorage.setItem(LS_ROOM_CODE, code);
    localStorage.setItem(LS_ROOM_ID, roomId.toString());
  }

  function clearSession() {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_ROOM_CODE);
    localStorage.removeItem(LS_ROOM_ID);
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isChatting) {
    return (
      <div className="min-h-screen pt-20 pb-8 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">摸鱼聊天室</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">输入昵称，开始聊天</p>
          </div>

          {/* Nickname input */}
          <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">你的昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="取个名字吧..."
                maxLength={10}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateRoom}
                disabled={!nickname.trim() || isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                创建房间
              </button>
              <button
                onClick={() => setShowJoin(!showJoin)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-600 hover:bg-white/70 dark:hover:bg-slate-700 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                加入房间
              </button>
            </div>

            {showJoin && (
              <div className="pt-2 animate-fade-in-up">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">房间代码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="例如 FISH01"
                    maxLength={10}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={!joinCode.trim() || !nickname.trim() || isLoading}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                  >
                    进入
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tip */}
          <p className="text-xs text-center text-slate-400 dark:text-slate-500">
            昵称仅用于显示，无需注册即可聊天
          </p>

          {/* Saved rooms */}
          {savedRooms.length > 0 && (
            <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                我的房间
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {savedRooms.map((sr) => (
                  <div key={sr.code} className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/50 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800 dark:text-white">{sr.code}</div>
                        <div className="text-xs text-slate-400">
                          {roomStatus[sr.code] ? roomStatus[sr.code].count + "/" + roomStatus[sr.code].max + " 人在线" : "加载中..."}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEnterSavedRoom(sr.code, sr.nickname)}
                        className="px-3 py-1 text-xs rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all opacity-0 group-hover:opacity-100"
                      >
                        进入
                      </button>
                      <button
                        onClick={() => removeRoomFromHistory(sr.code)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                        title="移除"
                      >
                        <span className="text-xs">✕</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chatting view
  return (
    <div className="h-dvh pt-16 pb-4 px-4 flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-800 dark:text-white text-sm">{room?.code}</div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Users className="w-3 h-3" />
                <span>{room?.participants.length || 0} 人在线</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
              <User className="w-3 h-3 inline mr-0.5" />
              {nickname}
            </span>
            <button
              onClick={handleLeaveRoom}
              className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              title="返回首页（房间保留）"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleFullyLeaveRoom}
              className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="完全退出房间"
            >
              <span className="text-xs font-bold">X</span>
            </button>
          </div>
        </div>

        {/* Participants bar */}
        {room && room.participants.length > 0 && (
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 flex flex-wrap gap-1.5">
            {room.participants.map((p) => (
              <span
                key={p.id}
                className={"px-2 py-0.5 rounded-full text-xs " + (p.nickname === nickname
                  ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-medium"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400")}
              >
                {p.nickname}
              </span>
            ))}
          </div>
        )}

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
              <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">暂无消息，发送第一条吧</p>
            </div>
          ) : (
            messages.map((msg) =>
              msg.sender_nickname === "系统" ? (
                <div key={msg.id} className="flex justify-center">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 text-xs rounded-full">
                    {msg.content}
                  </span>
                </div>
              ) : (
                <div
                  key={msg.id}
                  className={"flex " + (msg.sender_nickname === nickname ? "justify-end" : "justify-start")}
                >
                  <div className={"max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm " + (msg.sender_nickname === nickname
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md"
                    : "bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-md border border-slate-100 dark:border-slate-600")}
                  >
                    {msg.sender_nickname !== nickname && (
                      <div className="text-xs font-medium text-indigo-500 dark:text-indigo-400 mb-0.5">
                        {msg.sender_nickname}
                      </div>
                    )}
                    <div className="text-sm leading-relaxed break-words">{msg.content}</div>
                    <div className={"text-right text-xs mt-0.5 " + (msg.sender_nickname === nickname
                      ? "text-white/60" : "text-slate-400 dark:text-slate-500")}
                    >
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              )
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={sendingMsg}
              onChange={(e) => setSendingMsg(e.target.value)}
              placeholder="输入消息..."
              maxLength={500}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!sendingMsg.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">发送</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
