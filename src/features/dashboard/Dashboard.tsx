export default function Dashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Tổng quan về hệ thống CatSpeak
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">1,234</p>
                    <p className="mt-1 text-sm text-green-600">+12% so với tháng trước</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Đang hoạt động</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">892</p>
                    <p className="mt-1 text-sm text-green-600">+5% so với tháng trước</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Bị cấm</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">23</p>
                    <p className="mt-1 text-sm text-red-600">+2 trong tuần này</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Đăng ký mới</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">56</p>
                    <p className="mt-1 text-sm text-gray-500">Trong 7 ngày qua</p>
                </div>
            </div>

            {/* Placeholder for charts */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Biểu đồ thống kê</h2>
                <div className="mt-4 flex h-64 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                    Biểu đồ sẽ được thêm vào đây
                </div>
            </div>
        </div>
    );
}
