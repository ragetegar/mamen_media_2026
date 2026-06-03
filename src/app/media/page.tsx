import { redirect } from "next/navigation";

// Redirect old /media route to /music for backward compatibility
export default function MediaPage() {
    redirect("/music");
}
