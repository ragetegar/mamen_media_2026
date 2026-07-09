export function formatDate(
    value: string | number | Date,
    options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
) {
    return new Intl.DateTimeFormat("id-ID", options).format(new Date(value));
}

export function formatTime(
    value: string | number | Date,
    options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" },
) {
    return new Intl.DateTimeFormat("id-ID", options).format(new Date(value));
}
