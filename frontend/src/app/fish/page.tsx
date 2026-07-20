"use client";

import { useState, useEffect, useRef } from "react";

interface Room {
  id: number;
  code: string;
  participant1_id: number;
  participant1_nickname: string;
  participant2_id: number | null;
  participant2_nickname: string;
  created_at: string;
}

interface Message {
  id: number;
  room_id: number;
  sender_id: number;
  sender_nickname: string;
  content: string;
  created_at: string;
}

type PageState = "landing" | "creating" | "joining" | "waiting" | "chatting";

export default function FishPage() {
  const [pageState, setPageState] = useState<PageState>("landing");
  const [room, setRoom] = useState<Room | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isMe, setIsMe] = useState(true);
  const [myNickname, setMyNickname] = useState("");
  const [otherNickname, setOtherNickname] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageState === "waiting" && room) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/fish/room/${room.code}`);
          const data = await res.json();
          if (data.room && data.room.participant2_id) {
            setRoom(data.room);
            setOtherNickname(data.room.participant2_nickname);
            setPageState("chatting");
            fetchMessages(data.room.id);
          }
        } catch (error) {
          console.error("轮询失败:", error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [pageState, room]);

  useEffect(() => {
    if (pageState === "chatting" && room) {
      const interval = setInterval(() => {
        fetchMessages(room.id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [pageState, room]);

  const fetchMessages = async (roomId: number) => {
    try {
      const res = await fetch(`/api/fish/room/${roomId}/messages`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = data.messages.filter((m: Message) => !existingIds.has(m.id));
          if (newMessages.length === 0) return prev;
          return [...prev, ...newMessages];
        });
      }
    } catch (error) {
      console.error("获取消息失败:", error);
    }
  };

  const handleCreateRoom = async () => {
    if (!myNickname.trim()) {
      alert("请先输入你的昵称");
      return;
    }
    try {
      setPageState("creating");
      const res = await fetch("/api/fish/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: myNickname.trim() }),
      });
      console.log("Create response status:", res.status);
      const data = await res.json();
      console.log("Create response data:", data);
      if (data.room) {
        setRoom(data.room);
        setIsMe(true);
        setPageState("waiting");
      } else {
        alert(data.error || "创建房间失败");
        setPageState("landing");
      }
    } catch (error) {
      console.error("创建房间失败:", error);
      alert("创建房间失败，请检查网络连接");
      setPageState("landing");
    }
  };

  const handleJoinRoom = async () => {
    if (!myNickname.trim()) {
      alert("请先输入你的昵称");
      return;
    }
    if (!joinCode.trim()) {
      alert("请输入对接码");
      return;
    }
    try {
      setPageState("joining");
      const res = await fetch(`/api/fish/room/${joinCode.trim()}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: myNickname.trim() }),
      });
      console.log("Join response status:", res.status);
      const data = await res.json();
      console.log("Join response data:", data);
      if (data.room) {
        setRoom(data.room);
        setIsMe(false);
        setOtherNickname(data.room.participant1_nickname || "对方");
        setPageState("chatting");
        fetchMessages(data.room.id);
      } else {
        const errorMsg = data.error || "加入失败";
        alert(errorMsg === "房间已满" ? "❌ 房间已满，请创建新房间或使用其他对接码" : errorMsg);
        setPageState("landing");
      }
    } catch (error) {
      console.error("加入房间失败:", error);
      alert("加入失败，请检查网络连接或对接码是否正确");
      setPageState("landing");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inputMessage.trim() || !room) return;

    try {
      const res = await fetch(`/api/fish/room/${room.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: isMe ? 1 : 2,
          senderNickname: myNickname.trim(),
          content: inputMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
        setInputMessage("");
      }
    } catch (error) {
      console.error("发送消息失败:", error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 md:px-8 min-h-screen flex items-center justify-center overflow-hidden">
      {pageState === "landing" && (
        <div className="text-center max-w-md w-full p-4">
          <div className="mb-8">
            <div className="text-6xl mb-4">🐟</div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              zzd摸鱼专用
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              设置昵称，开始和好友悄悄聊天~
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={myNickname}
                onChange={(e) => setMyNickname(e.target.value)}
                placeholder="请输入你的昵称"
                className="w-full py-3 px-4 pr-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                maxLength={10}
              />
              <button
                onClick={handleCreateRoom}
                className="absolute right-2 top-1/2 -translate-y-1/2 py-1.5 px-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 whitespace-nowrap text-sm"
              >
                🎉 创建
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                placeholder="输入对接码加入房间..."
                className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                maxLength={6}
              />
              <button
                onClick={handleJoinRoom}
                className="absolute right-2 top-1/2 -translate-y-1/2 py-1.5 px-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
              >
                加入
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              💡 提示：创建房间后会生成一个6位对接码，分享给好友即可一起聊天
            </p>
          </div>
        </div>
      )}

      {pageState === "creating" && (
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">正在创建房间...</p>
        </div>
      )}

      {pageState === "joining" && (
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">正在加入房间...</p>
        </div>
      )}

      {pageState === "waiting" && room && (
        <div className="text-center max-w-md w-full p-4">
          <div className="mb-6">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              房间已创建
            </h2>
            <p className="text-slate-500 dark:text-slate-400">等待好友加入中...</p>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">您的对接码</p>
            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-widest select-all">
              {room.code}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              你的昵称：<span className="text-indigo-500 font-medium">{myNickname}</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
              复制对接码分享给好友，好友输入后即可加入
            </p>
          </div>

          <button
            onClick={() => {
              setPageState("landing");
              setRoom(null);
            }}
            className="mt-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm transition-colors"
          >
            返回首页
          </button>
        </div>
      )}

      {pageState === "chatting" && room && (
        <div className="w-full max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden m-2 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">🐟 zzd摸鱼专用</h2>
              <p className="text-xs text-white/70">
                和 <span className="font-medium">{otherNickname || "对方"}</span> 聊天中 | 对接码: {room.code}
              </p>
            </div>
            <button
              onClick={() => {
                setPageState("landing");
                setRoom(null);
                setMessages([]);
                setOtherNickname("");
              }}
              className="text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <div className="text-4xl mb-2">💬</div>
                <p>和 {otherNickname || "对方"} 打个招呼吧~</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === (isMe ? 1 : 2) ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      msg.sender_id === (isMe ? 1 : 2)
                        ? "items-end"
                        : "items-start"
                    } flex flex-col`}
                  >
                    <div
                      className={`text-xs mb-1 ${
                        msg.sender_id === (isMe ? 1 : 2) ? "text-white/60" : "text-slate-500 dark:text-slate-400"
                      } ${
                        msg.sender_id === (isMe ? 1 : 2) ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.sender_nickname || "未知"}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        msg.sender_id === (isMe ? 1 : 2)
                          ? "bg-indigo-500 text-white rounded-tr-sm"
                          : "bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-tl-sm shadow-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender_id === (isMe ? 1 : 2) ? "text-white/60" : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="输入消息..."
                className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-4 py-1.5 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                发送
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">
              你：{myNickname}
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
