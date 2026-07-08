"use client";

import { useAuth, AuthUser } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { getAdminUsers, updateAdminUserBadges, updateAdminUserRole } from "@/app/admin/actions";
import { RoleBadge, VerifiedBadge } from "@/components/ProfileBadges";

export default function UsersListClient() {
    const { user } = useAuth();
    const [usersList, setUsersList] = useState<AuthUser[]>([]);
    const [error, setError] = useState("");
    const [savingId, setSavingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const data = await getAdminUsers();
            setUsersList(data as AuthUser[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load users");
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

        setSavingId(targetId);
        try {
            await updateAdminUserRole(targetId, newRole);
            await fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update role");
        } finally {
            setSavingId(null);
        }
    };

    const handleBadgeChange = async (
        target: AuthUser,
        updates: Partial<Pick<AuthUser, "is_verified" | "official_partner_name" | "official_partner_logo" | "official_partner_url" | "barengan_custom_tag">>,
    ) => {
        setError("");
        setSavingId(target.id);
        try {
            await updateAdminUserBadges(target.id, {
                is_verified: updates.is_verified ?? target.is_verified ?? false,
                official_partner_name: updates.official_partner_name ?? target.official_partner_name ?? "",
                official_partner_logo: updates.official_partner_logo ?? target.official_partner_logo ?? "",
                official_partner_url: updates.official_partner_url ?? target.official_partner_url ?? "",
                barengan_custom_tag: updates.barengan_custom_tag ?? target.barengan_custom_tag ?? "",
            });
            await fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile badges");
        } finally {
            setSavingId(null);
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
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Badges
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
                                    <RoleBadge role={u.role} />
                                    {u.role === "user" && (
                                        <span className="text-xs px-2 py-1 font-bold uppercase tracking-wider text-mamen-lime">
                                            User
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="space-y-3 min-w-64">
                                        <label className="flex items-center gap-2 text-xs text-mamen-gray-200">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(u.is_verified)}
                                                disabled={savingId === u.id}
                                                onChange={(e) => handleBadgeChange(u, { is_verified: e.target.checked })}
                                                className="accent-[#1D9BF0]"
                                            />
                                            <span className="inline-flex items-center gap-1">
                                                Verified <VerifiedBadge compact />
                                            </span>
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <input
                                                value={u.official_partner_name || ""}
                                                onChange={(e) => setUsersList((prev) => prev.map((item) => item.id === u.id ? { ...item, official_partner_name: e.target.value } : item))}
                                                onBlur={(e) => handleBadgeChange(u, { official_partner_name: e.target.value })}
                                                placeholder="Partner name"
                                                className="bg-mamen-gray-900 border border-mamen-gray-700 text-mamen-white px-2 py-1 text-xs outline-none focus:border-mamen-purple"
                                            />
                                            <input
                                                value={u.official_partner_logo || ""}
                                                onChange={(e) => setUsersList((prev) => prev.map((item) => item.id === u.id ? { ...item, official_partner_logo: e.target.value } : item))}
                                                onBlur={(e) => handleBadgeChange(u, { official_partner_logo: e.target.value })}
                                                placeholder="Logo URL"
                                                className="bg-mamen-gray-900 border border-mamen-gray-700 text-mamen-white px-2 py-1 text-xs outline-none focus:border-mamen-purple"
                                            />
                                            <input
                                                value={u.official_partner_url || ""}
                                                onChange={(e) => setUsersList((prev) => prev.map((item) => item.id === u.id ? { ...item, official_partner_url: e.target.value } : item))}
                                                onBlur={(e) => handleBadgeChange(u, { official_partner_url: e.target.value })}
                                                placeholder="Partner link"
                                                className="bg-mamen-gray-900 border border-mamen-gray-700 text-mamen-white px-2 py-1 text-xs outline-none focus:border-mamen-purple"
                                            />
                                        </div>
                                        <input
                                            value={u.barengan_custom_tag || ""}
                                            onChange={(e) => setUsersList((prev) => prev.map((item) => item.id === u.id ? { ...item, barengan_custom_tag: e.target.value.slice(0, 24) } : item))}
                                            onBlur={(e) => handleBadgeChange(u, { barengan_custom_tag: e.target.value })}
                                            placeholder="Barengan custom tag (max 24)"
                                            maxLength={24}
                                            className="w-full bg-mamen-gray-900 border border-mamen-gray-700 text-mamen-white px-2 py-1 text-xs outline-none focus:border-mamen-purple"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <select
                                        className="bg-mamen-gray-900 border border-mamen-gray-700 text-mamen-white px-2 py-1 text-sm rounded outline-none cursor-pointer hover:border-mamen-purple"
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value as AuthUser["role"])}
                                        disabled={u.id === user?.id || savingId === u.id}
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
