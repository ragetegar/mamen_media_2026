"use client";

import { useAuth, AuthUser } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";

export default function UsersListClient() {
    const { user } = useAuth();
    const [usersList, setUsersList] = useState<AuthUser[]>([]);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*");

        if (error) {
            setError("Failed to load users: " + error.message);
        } else if (data) {
            setUsersList(data as AuthUser[]);
        }
    };

    useEffect(() => {
        if (user?.role === "admin") {
            fetchUsers();
        }
    }, [user?.role]);

    const handleRoleChange = async (targetId: string, newRole: "admin" | "contributor" | "user") => {
        setError("");

        // Prevent an admin from accidentally demoting themselves if they are the only admin. 
        // For our prototype, just block demoting the current logged-in admin completely.
        if (targetId === user?.id && newRole !== "admin") {
            setError("You cannot demote yourself from admin.");
            return;
        }

        const { error: updateError } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", targetId);

        if (!updateError) {
            fetchUsers(); // refresh
        } else {
            setError(updateError.message || "Failed to update role");
        }
    };

    if (user?.role !== "admin") {
        return <div className="p-8 text-center text-red-500 font-bold">You do not have permission to view this page.</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="font-headline text-3xl font-black text-mamen-white">
                    Manage System Users
                </h1>
            </div>

            {error && (
                <div className="mb-4 p-4 border border-mamen-magenta bg-mamen-magenta/20 text-mamen-magenta font-medium">
                    {error}
                </div>
            )}

            <div className="bg-mamen-black border-2 border-mamen-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-mamen-gray-800 bg-mamen-gray-900/50">
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                User
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden md:table-cell">
                                Email
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Role
                            </th>
                            <th className="text-right px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersList.map((u) => (
                            <tr
                                key={u.id}
                                className="border-b border-mamen-gray-800 hover:bg-mamen-gray-800/30 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-mamen-purple flex items-center justify-center font-headline font-black text-xs text-white shrink-0">
                                            {u.avatar || u.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-mamen-white font-bold">{u.name}</p>
                                            <p className="text-xs text-mamen-gray-400">@{u.handle}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell text-mamen-gray-200">
                                    {u.email}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 font-bold uppercase tracking-wider ${u.role === "admin"
                                        ? "text-mamen-purple"
                                        : u.role === "contributor"
                                            ? "text-mamen-magenta"
                                            : "text-mamen-lime"
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <select
                                        className="bg-mamen-gray-900 border border-mamen-gray-700 text-mamen-white px-2 py-1 text-sm rounded outline-none cursor-pointer hover:border-mamen-purple"
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                                        disabled={u.id === user?.id}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="contributor">Contributor</option>
                                        <option value="user">User</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
