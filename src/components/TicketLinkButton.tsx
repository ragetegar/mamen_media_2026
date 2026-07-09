"use client";

import { Ticket } from "lucide-react";
import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

interface TicketLinkButtonProps {
    href: string;
    concertId: string;
    concertTitle: string;
}

export default function TicketLinkButton({ href, concertId, concertTitle }: TicketLinkButtonProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("ticket_click", { concert_id: concertId, concert_title: concertTitle })}
        >
            <Button variant="lime" size="lg">
                <Ticket size={18} className="mr-2" />
                Get Tickets
            </Button>
        </a>
    );
}
