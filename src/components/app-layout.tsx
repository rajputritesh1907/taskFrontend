'use client';

import { useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();

    // Public routes that don't need sidebar
    const publicRoutes = ['/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(pathname);

    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user && !isPublicRoute) {
            router.push('/login');
        }
    }, [user, isLoading, isPublicRoute, router]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (isPublicRoute) {
        return <main className="h-screen overflow-auto">{children}</main>;
    }

    if (!user) {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex">
                <Sidebar />
            </div>

            {/* Mobile Layout */}
            <div className="flex flex-col flex-1 lg:hidden">
                <MobileHeader />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Desktop Main Content */}
            <main className="hidden lg:flex flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
