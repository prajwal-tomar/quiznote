import "./globals.css";
import { Poppins } from 'next/font/google';
import SupabaseProvider from '../components/supabase-provider';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import HeaderWrapper from "@/components/header-wrapper";

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

    return (
        <html lang="en">
            <body className={poppins.variable}>
                <SupabaseProvider session={session}>
                    <HeaderWrapper>{children}</HeaderWrapper>
                </SupabaseProvider>
            </body>
        </html>
    );
}