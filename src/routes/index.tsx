import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import UsersPage from '../features/users/UsersPage';
import Dashboard from '../features/dashboard/Dashboard';
import Login from '../features/auth/routes/Login';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
    {
        path: '/auth/login',
        element: <Login />,
    },
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: 'users',
                        element: <UsersPage />,
                    },
                    {
                        path: 'settings',
                        element: (
                            <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                                <p className="text-gray-500">Trang Cài đặt - Đang phát triển</p>
                            </div>
                        ),
                    },
                ],
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
