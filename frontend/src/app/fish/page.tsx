"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, LogOut, Users, MessageSquare, User, Plus, ArrowRight, Globe } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

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
  owner_id: number | null;
  room_type: string;
  lifecycle: string;
  is_public: number;
  max_participants: number;
  destroyed_at: string | null;
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
  roomId: number;
  ownerId: number | null;
  nickname: string;
  lastSeen: string;
  is_public: number;
  lifecycle: string;
}

// 会话按账号隔离：每个账号各自独立的房间/消息列表，避免换号串台
const LS_SESSION_KEYS = (account: string) => ({
  token: "fish_token_" + account,
  code: "fish_room_code_" + account,
  id: "fish_room_id_" + account,
});

export default function FishPage() {
  const { user, loading: authLoading } = useAuth();
  const nickname = user?.username || "";
  const [joinCode, setJoinCode] = useState("");
  const [createIsPublic, setCreateIsPublic] = useState(false);
  const [createIsTemp, setCreateIsTemp] = useState(false);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
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

  // Restore session on load（登录态就绪后按账号恢复，切换账号自动清空上一个人的状态）
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    // 切换账号时先清掉上一个账号的聊天状态
    setRoom(null);
    setParticipantToken(null);
    setMessages([]);
    setIsChatting(false);
    lastMsgIdRef.current = 0;

    const keys = LS_SESSION_KEYS(user.username || "");
    const savedToken = localStorage.getItem(keys.token);
    const savedRoomCode = localStorage.getItem(keys.code);
    const savedRoomId = localStorage.getItem(keys.id);

    // Load saved room history + public lobby
    loadSavedRooms();
    loadPublicRooms();

    if (savedToken && savedRoomCode && savedRoomId) {
      restoreSession(savedToken, savedRoomCode, parseInt(savedRoomId));
    } else {
      setIsLoading(false);
    }
  }, [authLoading, user?.username]);

  const loadSavedRooms = () => {
    authFetch("/api/fish/my-rooms")
      .then(res => res.json())
      .then(data => {
        if (data.rooms) {
          const rooms: SavedRoom[] = data.rooms.map((r: any) => ({
            code: r.code,
            roomId: r.id,
            ownerId: r.owner_id ?? null,
            nickname: nickname,
            lastSeen: new Date().toISOString(),
            is_public: r.is_public ?? 0,
            lifecycle: r.lifecycle ?? 'permanent',
          }));
          setSavedRooms(rooms);
          data.rooms.forEach((r: any) => {
            setRoomStatus(prev => ({ ...prev, [r.code]: { count: r.participants.length, max: r.max_participants } }));
          });
        }
      })
      .catch(() => {});
  };

  const loadPublicRooms = () => {
    authFetch("/api/fish/rooms/public")
      .then(res => res.json())
      .then(data => {
        if (data.rooms) setPublicRooms(data.rooms);
      })
      .catch(() => {});
  };

  const saveRoomToHistory = (code: string, nick: string) => {
    // 房间归属已按账号存入后端库，进入后直接刷新列表，不再写入 localStorage
    loadSavedRooms();
  };

  const removeRoomFromHistory = async (code: string) => {
    const room = savedRooms.find(r => r.code === code);
    // 房主删除整个房间；普通成员仅退出
    if (room?.ownerId === user?.id) {
      if (!window.confirm("确定删除房间 " + code + " 吗？房间内消息将一并删除。")) {
        return;
      }
    }
    setSavedRooms(prev => prev.filter(r => r.code !== code));
    setRoomStatus(prev => {
      const copy = { ...prev };
      delete copy[code];
      return copy;
    });
    try {
      if (room?.roomId) {
        if (room.ownerId === user?.id) {
          await authFetch("/api/fish/room/" + room.roomId, { method: "DELETE" });
        } else {
          await authFetch("/api/fish/room/" + room.roomId + "/leave", { method: "POST" });
        }
      }
    } catch {}
    loadSavedRooms();
    loadPublicRooms();
  };

  const handleEnterSavedRoom = async (code: string, nick: string) => {
    setIsLoading(true);
    try {
      const joinRes = await authFetch("/api/fish/room/" + encodeURIComponent(code) + "/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!joinRes.ok) {
        alert("房间不可用");
        return;
      }
      const data = await joinRes.json();
      saveSession(data.participantToken, data.room.code, data.room.id);
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

  const restoreSession = async (token: string, code: string, roomId: number) => {
    try {
      // Try to use existing token first
      const pRes = await authFetch("/api/fish/participant?participantToken=" + encodeURIComponent(token));
      if (pRes.ok) {
        // Token is still valid - restore directly
        const rRes = await authFetch("/api/fish/room/" + encodeURIComponent(code) + "/full?participantToken=" + encodeURIComponent(token));
        if (rRes.ok) {
          const rData = await rRes.json();
          setRoom(rData.room);
          setParticipantToken(token);
          setIsChatting(true);
          fetchMessages(token, roomId);
          return;
        }
      }
      // Token expired or room gone - re-join (creates new token)
      const joinRes = await authFetch("/api/fish/room/" + encodeURIComponent(code) + "/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!joinRes.ok) throw new Error("cannot rejoin");
      const joinData = await joinRes.json();
      saveSession(joinData.participantToken, joinData.room.code, joinData.room.id);
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
      const res = await authFetch("/api/fish/room/" + roomId + "/messages?participantToken=" + encodeURIComponent(token));
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
      // 实时刷新在线成员/人数（后端按最近心跳时间判定）
      if (Array.isArray(data.participants)) {
        setRoom(prev => (prev ? { ...prev, participants: data.participants } : prev));
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

  // 大厅在线人数定时刷新（未进房间时每 15 秒）
  useEffect(() => {
    if (authLoading || !user || isChatting) return;
    loadPublicRooms();
    loadSavedRooms();
    const t = setInterval(() => {
      loadPublicRooms();
      loadSavedRooms();
    }, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.username, isChatting]);

  const handleCreateRoom = async () => {
    if (!nickname) {
      alert("请先登录");
      return;
    }
    setIsLoading(true);
    try {
      const res = await authFetch("/api/fish/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: createIsPublic, lifecycle: createIsTemp ? "temp" : "permanent" }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      saveSession(data.participantToken, data.room.code, data.room.id);
      saveRoomToHistory(data.room.code, nickname);
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
    if (!nickname || !code) return;
    setIsLoading(true);
    try {
      const res = await authFetch("/api/fish/room/" + encodeURIComponent(code) + "/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      saveSession(data.participantToken, data.room.code, data.room.id);
      saveRoomToHistory(data.room.code, nickname);
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
      await authFetch("/api/fish/room/" + room.id + "/messages", {
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
    loadPublicRooms();
    loadSavedRooms();
  };

  const handleFullyLeaveRoom = async () => {
    if (!participantToken || !room) return;
    try {
      await authFetch("/api/fish/room/" + room.id + "/leave", {
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
    loadPublicRooms();
    loadSavedRooms();
  };

  function saveSession(token: string, code: string, roomId: number) {
    const keys = LS_SESSION_KEYS(nickname);
    localStorage.setItem(keys.token, token);
    localStorage.setItem(keys.code, code);
    localStorage.setItem(keys.id, roomId.toString());
  }

  function clearSession() {
    const keys = LS_SESSION_KEYS(nickname);
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.code);
    localStorage.removeItem(keys.id);
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="text-center backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 rounded-2xl p-8 border border-white/20 dark:border-white/10 max-w-sm">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">需要登录</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">登录后即可使用摸鱼聊天室</p>
          <Link href="/login" className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium transition shadow-lg shadow-indigo-500/30">
            去登录
          </Link>
        </div>
      </div>
    );
  }

  if (!isChatting) {
    return (
      <div className="min-h-screen pt-20 pb-8 px-4 flex flex-col items-center">
        <div className="w-full max-w-md sm:max-w-5xl space-y-6">
          {/* Title */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">摸鱼聊天室</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">当前身份：<span className="font-semibold text-indigo-500">{nickname}</span>（固定为你的账号）</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
          {/* Public lobby */}
          <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              公开大厅
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {publicRooms.map((r) => (
                <button
                  key={r.code}
                  onClick={() => handleEnterSavedRoom(r.code, nickname)}
                  className="text-left p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-white/30 dark:border-white/10 hover:from-indigo-500/20 hover:to-purple-600/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{r.code}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{r.participants.length}/{r.max_participants} 在线</span>
                  </div>
                </button>
              ))}
              {publicRooms.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 col-span-full">暂无公开房间</p>
              )}
            </div>
          </div>

          {/* Create room panel */}
          <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-500" />
              创建房间
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">可见性</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
                  <button
                    onClick={() => setCreateIsPublic(false)}
                    className={`flex-1 py-2 text-sm font-medium transition-all ${!createIsPublic ? "bg-indigo-600 text-white" : "bg-white/40 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300"}`}
                  >
                    私密
                  </button>
                  <button
                    onClick={() => setCreateIsPublic(true)}
                    className={`flex-1 py-2 text-sm font-medium transition-all ${createIsPublic ? "bg-emerald-600 text-white" : "bg-white/40 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300"}`}
                  >
                    公开
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">生命周期</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
                  <button
                    onClick={() => setCreateIsTemp(false)}
                    className={`flex-1 py-2 text-sm font-medium transition-all ${!createIsTemp ? "bg-indigo-600 text-white" : "bg-white/40 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300"}`}
                  >
                    长期
                  </button>
                  <button
                    onClick={() => setCreateIsTemp(true)}
                    className={`flex-1 py-2 text-sm font-medium transition-all ${createIsTemp ? "bg-amber-600 text-white" : "bg-white/40 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300"}`}
                  >
                    临时
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              {createIsPublic ? "公开房会出现在公开大厅，任何人都能进入。" : "私密房生成随机链接，仅持有链接者可进入。"}
              {createIsTemp ? " 临时房每日清理一次，人走光即销毁。" : " 长期房持久保留，聊天记录可回看。"}
            </p>

            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              创建并进入
            </button>

            <div className="pt-1">
              <button
                onClick={() => setShowJoin(!showJoin)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-600 hover:bg-white/70 dark:hover:bg-slate-700 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                用链接加入房间
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
                    placeholder="例如 RM_8F3K2A9X"
                    maxLength={20}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={!joinCode.trim() || isLoading}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                  >
                    进入
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Saved rooms */}
          </div>

          <div className="lg:col-span-1 space-y-6 flex flex-col">
            <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-4 flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                我的房间
              </h3>
              {savedRooms.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {savedRooms.map((sr) => (
                    <div key={sr.code} className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/50 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800 dark:text-white">{sr.code}</div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span
                              className={
                                "px-1.5 py-0.5 rounded text-[10px] font-medium " +
                                (sr.is_public === 1
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400")
                              }
                            >
                              {sr.is_public === 1 ? "公开" : "私密"}
                            </span>
                            {sr.lifecycle === "temp" && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                                临时
                              </span>
                            )}
                            {roomStatus[sr.code] ? roomStatus[sr.code].count + "/" + roomStatus[sr.code].max + " 人在线" : "加载中..."}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEnterSavedRoom(sr.code, sr.nickname)}
                          className="px-3 py-1 text-xs rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
                        >
                          进入
                        </button>
                        <button
                          onClick={() => removeRoomFromHistory(sr.code)}
                          className={
                            "p-1.5 text-xs rounded-lg transition-all " +
                            (sr.ownerId === user?.id
                              ? "text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600/50")
                          }
                          title={sr.ownerId === user?.id ? "删除房间" : "退出房间"}
                        >
                          {sr.ownerId === user?.id ? "删" : "退"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">还没有加入任何房间</p>
                  <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-1">在左侧创建或加入房间后，会显示在这里</p>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Chatting view
  return (
    <div className="h-dvh pt-16 pb-4 px-4 flex flex-col">
      <div className="flex-1 max-w-3xl lg:max-w-5xl mx-auto w-full flex flex-col rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg overflow-hidden">
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
