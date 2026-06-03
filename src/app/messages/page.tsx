import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import MessagesClient from "./MessagesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Messages | Mamen",
    description: "Your direct messages on Mamen.",
};

export default async function MessagesPage() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    return (
        <main className="min-h-screen bg-mamen-black">
            <Suspense fallback={
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-mamen-purple"></div>
                </div>
            }>
                <MessagesClient />
            </Suspense>
        </main>
    );
}
