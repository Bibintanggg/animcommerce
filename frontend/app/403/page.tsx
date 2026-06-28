export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-5xl font-bold">403</h1>
                <p className="mt-2 text-gray-600">
                    Unauthorized. Kamu tidak memiliki akses ke halaman ini.
                </p>
            </div>
        </div>
    );
}