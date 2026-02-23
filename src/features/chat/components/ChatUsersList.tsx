import { Search } from "lucide-react";
import Card from "../../../components/ui/Card";
import type { ChatUser } from "../LiveChatPage";

interface ChatUsersListProps {
  users: ChatUser[];
  selectedUser: ChatUser | null;
  onSelectUser: (user: ChatUser) => void;
}

export default function ChatUsersList({
  users,
  selectedUser,
  onSelectUser,
}: ChatUsersListProps) {
  const totalNews = users.reduce((acc, user) => acc + user.newsCount, 0);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Search Header */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold"
            size={24}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-primary text-primary font-bold shadow-sm bg-white">
            {totalNews}
          </span>
          <span className="font-bold text-primary text-lg">Mess</span>
        </div>
      </div>

      {/* Table Card */}
      <Card
        noPadding
        className="flex flex-col flex-1 overflow-hidden shadow-sm"
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-[#A41A1A] text-white shadow z-10">
              <tr>
                <th className="px-6 py-4 font-semibold text-sm">User</th>
                <th className="px-6 py-4 font-semibold text-sm">User's ID</th>
                <th className="px-6 py-4 font-semibold text-sm">
                  Message Sent Time
                </th>
                <th className="px-6 py-4 font-semibold text-sm">
                  New / not report
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`cursor-pointer transition-colors ${selectedUser?.id === user.id ? "bg-gray-50" : "hover:bg-gray-50"}`}
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 shadow-sm border border-gray-100">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <span className="font-medium text-primary hover:underline">
                      {user.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-primary font-medium">
                    {user.userId}
                  </td>
                  <td className="px-6 py-4 text-sm text-primary font-medium">
                    {user.time}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">
                    <span
                      className={
                        user.newsCount > 0 ? "text-[#A41A1A]" : "text-[#A41A1A]"
                      }
                    >
                      {user.newsCount} news
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Container matching HandleReports table */}
        <div className="bg-[#A41A1A] text-white px-6 py-3 flex items-center justify-between shadow-t">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>Number of mess per page</span>
            <div className="relative">
              <select className="appearance-none bg-white text-gray-800 rounded px-3 py-1 pr-8 outline-none text-sm font-semibold ml-2 text-center align-middle h-8">
                <option>50</option>
                <option>100</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-1 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <button className="p-1 hover:bg-white/10 rounded transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 17L13 12L18 7M11 17L6 12L11 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="p-1 hover:bg-white/10 rounded transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="text-sm px-2 text-[#F2994A]">1/37</span>
            <button className="p-1 hover:bg-white/10 rounded transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="p-1 hover:bg-white/10 rounded transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 17L11 12L6 7M13 17L18 12L13 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
