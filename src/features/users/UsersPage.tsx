import UserTable from './components/UserTable';
import { Plus, Search } from 'lucide-react';

export default function UsersPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài khoản</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Quản lý tất cả người dùng trong hệ thống
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <Plus className="h-5 w-5" />
                    Thêm người dùng
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <option value="">Tất cả vai trò</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="user">User</option>
                    </select>
                    <select className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                        <option value="banned">Bị cấm</option>
                    </select>
                </div>
            </div>

            {/* User Table */}
            <UserTable />

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">
                    Hiển thị <span className="font-medium">1</span> đến{' '}
                    <span className="font-medium">4</span> trong{' '}
                    <span className="font-medium">4</span> kết quả
                </p>
                <div className="flex gap-2">
                    <button
                        disabled
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Trước
                    </button>
                    <button
                        disabled
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
}
