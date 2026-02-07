'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { loginWithTelegramToken } from '../../actions';

function TelegramAuthContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loginWithTelegramToken(token).then((result) => {
        // Since loginWithTelegramToken redirects on success, 
        // we only handle the error case here if it returns (i.e. didn't redirect).
        // However, redirect throws an error in Next.js, 
        // checking the "result" might depend on how the promise resolves.
        // But for server actions, if redirect happens, this .then might not be reached comfortably without catch 
        // or the client component unmounts.
        // Actually, redirect() in Server Action throws NEXT_REDIRECT error which is caught by Next.js.
        // If we get a result here, it means no redirect happened (error).
        if (result && result.error) {
          setError(result.error);
        }
      });
    } else {
      setError('No token provided');
    }
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-4">Автонизация...</h1>
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          Ошибка: {error}
        </div>
      )}
      {!error && <div className="animate-pulse">Проверка токена...</div>}
    </div>
  );
}

export default function TelegramAuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TelegramAuthContent />
    </Suspense>
  );
}
