import "./globals.css";
import { Poppins } from 'next/font/google';
import SupabaseProvider from '../components/supabase-provider';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Header from "@/components/header";

const poppins = Poppins({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-poppins'
});

export const metadata = {
    title: "QuizNote",
    description: "Create custom quizzes from your notes.",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Get the current pathname
    const pathname = cookies().get('pathname')?.value || '/';

    // Check if the current path is one of the excluded routes
    const isExcludedRoute = ['/', '/login', '/sign-up'].includes(pathname);

    return (
        <html lang="en">
            <body className={poppins.variable}>
                <SupabaseProvider session={session}>
                    {!isExcludedRoute && <Header />}
                    {children}
                </SupabaseProvider>
            </body>
        </html>
    );
}