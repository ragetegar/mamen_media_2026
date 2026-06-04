type BarenganCapacityInput = {
    approved_count?: number | null;
    looking_for?: number | null;
    max_members?: number | null;
};

function positiveNumber(value: number | null | undefined) {
    return typeof value === "number" && Number.isFinite(value) && value > 0
        ? value
        : null;
}

export function getBarenganCapacity(post: BarenganCapacityInput) {
    const lookingFor = positiveNumber(post.looking_for);
    if (lookingFor !== null) return lookingFor + 1;

    return positiveNumber(post.max_members) ?? 1;
}

export function getBarenganMemberTotal(post: BarenganCapacityInput, approvedJoinerCount?: number) {
    return 1 + (approvedJoinerCount ?? post.approved_count ?? 0);
}
