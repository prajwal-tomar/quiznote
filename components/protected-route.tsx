'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const supabase = createClientComponentClient()

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
    });
  }, [router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}