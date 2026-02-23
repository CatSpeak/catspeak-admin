import { useState } from "react";
import ChatUsersList from "./components/ChatUsersList";
import ChatWindow from "./components/ChatWindow";

export type ChatUser = {
  id: string;
  name: string;
  userId: string;
  time: string;
  newsCount: number;
  avatarUrl?: string;
};

const mockUsers: ChatUser[] = [
  {
    id: "1",
    name: "User 1",
    userId: "abc123456789",
    time: "32 minutes ago",
    newsCount: 3,
    avatarUrl: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: "2",
    name: "User 2",
    userId: "abc123456789",
    time: "32 minutes ago",
    newsCount: 0,
    avatarUrl: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: "3",
    name: "User 3",
    userId: "abc123456789",
    time: "32 minutes ago",
    newsCount: 0,
    avatarUrl: "https://i.pravatar.cc/150?u=3",
  },
];

export default function LiveChatPage() {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-fade-in relative z-0">
      {/* Left Pane - Users List */}
      <div
        className={`w-full lg:w-[65%] flex-col min-w-0 h-full ${selectedUser ? "hidden lg:flex" : "flex"}`}
      >
        <ChatUsersList
          users={mockUsers}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
      </div>

      {/* Right Pane - Chat Window */}
      <div
        className={`w-full lg:w-[35%] flex-col min-w-0 h-full ${selectedUser ? "flex" : "hidden"} lg:flex`}
      >
        <ChatWindow user={selectedUser} onBack={() => setSelectedUser(null)} />
      </div>
    </div>
  );
}
