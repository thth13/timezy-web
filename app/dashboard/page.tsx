import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { logout } from '../actions';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    redirect('/');
  }

  const secret = process.env.JWT_SECRET;
  let user = null;

  try {
    if (!secret) throw new Error('JWT_SECRET missing');
    user = jwt.verify(sessionCookie.value, secret) as any;
  } catch (e) {
    // If validation fails, force logout
    // redirect to home which is probably public
    // effectively this loop might occur if home checks session too, but assuming home is public
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50 text-gray-900">
      <main className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Дашборд</h1>
          <form action={logout}>
            <button 
              type="submit" 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Вийти
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Інформація про користувача</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 rounded">
              <span className="block text-sm text-gray-500">Роль</span>
              <span className="font-medium capitalize">{user.role}</span>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              <span className="block text-sm text-gray-500">Telegram ID</span>
              <span className="font-medium">{user.telegramId}</span>
            </div>
             <div className="p-4 bg-gray-100 rounded col-span-full">
              <span className="block text-sm text-gray-500">Session ID</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
