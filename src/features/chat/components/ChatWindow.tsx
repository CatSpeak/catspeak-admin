import { Image, Send } from "lucide-react";
import Card from "../../../components/ui/Card";
import type { ChatUser } from "../LiveChatPage";
import ChatBubble from "./ChatBubble";

interface ChatWindowProps {
  user: ChatUser | null;
  onBack?: () => void;
}

export default function ChatWindow({ user, onBack }: ChatWindowProps) {
  if (!user) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="font-medium">Select a user to start chatting</p>
      </Card>
    );
  }

  return (
    <Card
      noPadding
      className="h-full flex flex-col overflow-hidden bg-white shadow-md ring-1 ring-gray-100 pb-0 border border-gray-100 relative"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10 shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shadow-sm shrink-0 border border-gray-100">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 leading-tight">
            {user.name}
          </h3>
          <p className="text-xs text-primary font-medium">{user.userId}</p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30 custom-scrollbar">
        {/* Demo usage of the chat bubbles */}
        <ChatBubble
          avatarUrl={user.avatarUrl}
          name={user.name}
          time="11:46"
          message="I'm working from home today! 😅"
        />

        {/* Example of Sender bubble */}
        <ChatBubble
          isSender
          avatarUrl="https://i.pravatar.cc/150?u=admin"
          name="Administrator"
          time="11:48"
          message="That's great! Let me know if you need any assistance."
          delivered
        />

        {/* Example of an image attachment bubble */}
        <ChatBubble avatarUrl={user.avatarUrl} name={user.name} time="11:52">
          <div className="group relative mt-1">
            {/* <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
              <button className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"
                  />
                </svg>
              </button>
            </div> */}
            <img
              src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop"
              className="rounded-lg object-cover w-full max-h-48"
              alt="Attachment"
            />
          </div>
        </ChatBubble>

        {/* Example of a more complex bubble from the user snippet */}
        <ChatBubble avatarUrl={user.avatarUrl} name={user.name} time="11:55">
          <div className="mt-1">
            <p className="text-sm pb-2.5">
              <a
                href="https://github.com/themesberg/flowbite"
                className="text-primary underline hover:no-underline font-medium break-all"
                target="_blank"
                rel="noreferrer"
              >
                https://github.com/themesberg/flowbite
              </a>
            </p>
            <a
              href="#"
              className="block bg-white border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition-colors"
            >
              <img
                src="https://flowbite.com/docs/images/og-image.png"
                className="rounded-lg mb-2 w-full object-cover"
                alt="Link Preview"
              />
              <span className="text-sm font-medium text-gray-900 line-clamp-2">
                GitHub - themesberg/flowbite: The most popular and open
                source...
              </span>
              <p className="text-xs text-gray-500 font-normal mt-1">
                github.com
              </p>
            </a>
          </div>
        </ChatBubble>
      </div>

      {/* Input Area */}
      <div className="p-2 bg-white border-t border-gray-100 m-4 rounded-full shadow-sm ring-1 ring-gray-100 flex items-center gap-3">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm px-2 text-gray-900"
        />
        <div className="flex items-center gap-2 shrink-0 pr-1">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Image size={20} />
          </button>
          <button className="p-2 text-primary hover:text-white hover:bg-primary rounded-full transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
}
