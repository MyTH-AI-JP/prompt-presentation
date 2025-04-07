import { useEffect } from 'react';
import { useRouter } from 'next/router';

// この関数はApp Router（/app）を使用しているので、通常は呼ばれません
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // App Routerにリダイレクト
    router.push('/');
  }, []);

  return <div>Redirecting to App Router...</div>;
} 