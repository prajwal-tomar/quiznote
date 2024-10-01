'use client'

import { usePathname } from 'next/navigation';
import Header from "@/components/header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isExcludedRoute = ['/', '/login', '/sign-up'].includes(pathname);

    return (
        <>
            {!isExcludedRoute && <Header />}
            {children}
        </>
    );
}