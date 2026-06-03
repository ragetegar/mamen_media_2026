"use client";

interface FollowCountsProps {
    userId: string;
    followerCount: number;
    followingCount: number;
    onClickFollowers?: () => void;
    onClickFollowing?: () => void;
}

export default function FollowCounts({
    followerCount,
    followingCount,
    onClickFollowers,
    onClickFollowing,
}: FollowCountsProps) {
    return (
        <div className="flex items-center gap-4">
            <button
                onClick={onClickFollowers}
                className="text-sm text-mamen-gray-200 hover:text-mamen-white transition-colors cursor-pointer"
            >
                <span className="font-bold text-mamen-white">{followerCount}</span>{" "}
                <span className="text-mamen-gray-400">Follower{followerCount !== 1 ? "s" : ""}</span>
            </button>
            <button
                onClick={onClickFollowing}
                className="text-sm text-mamen-gray-200 hover:text-mamen-white transition-colors cursor-pointer"
            >
                <span className="font-bold text-mamen-white">{followingCount}</span>{" "}
                <span className="text-mamen-gray-400">Following</span>
            </button>
        </div>
    );
}
