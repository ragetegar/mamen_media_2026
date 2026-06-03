import UsersListClient from "./UsersListClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Users | Mamen Admin",
    description: "Manage system user roles on Mamen.",
};

export default function UsersAdminPage() {
    return <UsersListClient />;
}
