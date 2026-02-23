import type { ReactNode } from "react";

interface ChatBubbleProps {
  isSender?: boolean;
  avatarUrl?: string;
  name?: string;
  time?: string;
  message?: string;
  delivered?: boolean;
  children?: ReactNode; // For any custom content like images or links
}

export default function ChatBubble({
  isSender = false,
  avatarUrl = "/images/default-avatar.png",
  name = "User",
  time = "",
  message = "",
  delivered = false,
  children,
}: ChatBubbleProps) {
  if (isSender) {
    return (
      <div className="flex items-start gap-2.5 flex-row-reverse self-end group">
        <img
          className="w-8 h-8 rounded-full object-cover shrink-0"
          src={avatarUrl}
          alt={name}
        />
        <div className="flex flex-col gap-1 w-full max-w-[320px] items-end">
          <div className="flex items-center flex-row-reverse space-x-1.5 space-x-reverse mb-1 rtl:space-x-reverse">
            <span className="text-sm font-semibold text-gray-900 ml-1.5">
              {name}
            </span>
            <span className="text-sm text-gray-500">{time}</span>
          </div>
          <div className="flex flex-col leading-1.5 p-4 bg-primary text-white rounded-s-2xl rounded-ee-2xl shadow-sm">
            <p className="text-sm">{message}</p>
            {children}
          </div>
          {delivered && (
            <span className="text-xs text-gray-500 mt-1">Delivered</span>
          )}
        </div>

        <button
          className="inline-flex self-center items-center text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg p-1.5 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
          type="button"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeWidth="2"
              d="M12 6h.01M12 12h.01M12 18h.01"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 self-start group">
      <img
        className="w-8 h-8 rounded-full object-cover shrink-0"
        src={avatarUrl}
        alt={name}
      />
      <div className="flex flex-col gap-1 w-full max-w-[320px]">
        <div className="flex items-center space-x-1.5 mb-1 rtl:space-x-reverse">
          <span className="text-sm font-semibold text-gray-900">{name}</span>
          <span className="text-sm text-gray-500">{time}</span>
        </div>

        <div className="flex flex-col leading-1.5 p-4 bg-gray-100 rounded-e-2xl rounded-es-2xl border border-gray-200">
          <p className="text-sm text-gray-800">{message}</p>
          {children}
        </div>
        {delivered && (
          <span className="text-xs text-gray-500 mt-1">Delivered</span>
        )}
      </div>

      <button
        className="inline-flex self-center items-center text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg p-1.5 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
        type="button"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeWidth="2"
            d="M12 6h.01M12 12h.01M12 18h.01"
          />
        </svg>
      </button>
    </div>
  );
}
