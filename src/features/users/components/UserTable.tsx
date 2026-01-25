import type { Account } from '../types';
import { getAccounts } from '../api/getUsers';
import { MoreVertical, Edit, Trash2, Ban, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

// Mock data - sẽ thay thế bằng API sau
// Mock data deleted

const roleColors: Record<number, string> = {
    1: 'bg-purple-100 text-purple-800', // Admin
    2: 'bg-gray-100 text-gray-800',   // User
    3: 'bg-blue-100 text-blue-800',    // Moderator (example)
};

const statusColors: Record<number, string> = {
    1: 'bg-green-100 text-green-800',   // Active
    0: 'bg-yellow-100 text-yellow-800', // Inactive
    2: 'bg-red-100 text-red-800',       // Banned
};

const statusLabels: Record<number, string> = {
    1: 'Hoạt động',
    0: 'Không hoạt động',
    2: 'Bị cấm',
};

interface ActionMenuProps {
    userId: string;
    onClose: () => void;
}

function ActionMenu({ onClose }: ActionMenuProps) {
    return (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
            <button
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={onClose}
            >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
            </button>
            <button
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                onClick={onClose}
            >
                <Ban className="h-4 w-4" />
                Cấm tài khoản
            </button>
            <button
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={onClose}
            >
                <Trash2 className="h-4 w-4" />
                Xóa
            </button>
        </div>
    );
}

export default function UserTable() {
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await getAccounts();
                setAccounts(data);
            } catch (err) {
                setError('Không thể tải danh sách tài khoản');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Người dùng
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Vai trò
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Trạng thái
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Cấp độ
                            </th>
                            <th className="relative px-6 py-4">
                                <span className="sr-only">Hành động</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {accounts.map((account) => (
                            <tr key={account.accountId} className="transition-colors hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium overflow-hidden">
                                            {account.avatarImageUrl ? (
                                                <img src={account.avatarImageUrl} alt={account.username} className="h-full w-full object-cover" />
                                            ) : (
                                                account.username.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{account.username}</div>
                                            <div className="text-sm text-gray-500">{account.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleColors[account.roleId] || 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {account.roleId === 1 ? 'Admin' : account.roleId === 2 ? 'User' : 'Unknown'}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[account.status] || 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {statusLabels[account.status] || 'Không xác định'}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {account.level}
                                </td>
                                <td className="relative whitespace-nowrap px-6 py-4 text-right">
                                    <button
                                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                        onClick={() =>
                                            setActiveMenu(activeMenu === account.accountId ? null : account.accountId)
                                        }
                                    >
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                    {activeMenu === account.accountId && (
                                        <ActionMenu
                                            userId={account.accountId.toString()}
                                            onClose={() => setActiveMenu(null)}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
