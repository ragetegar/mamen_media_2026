import ProfileClient from "./ProfileClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Profile | Mamen",
    description: "View user profile, comment history, and concert attendance on Mamen.",
};

interface ProfilePageProps {
    params: Promise<{ handle: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { handle } = await params;

    return (
        <main className="min-h-screen bg-mamen-black py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <ProfileClient handle={handle} />
            </div>
        </main>
    );
}
