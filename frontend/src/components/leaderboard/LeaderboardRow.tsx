import React from "react";

interface LeaderboardRowProps {
    position: number;
    username: string;
    score: number;
    isCurrentUser?: boolean;
    isTopThree?: boolean;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
    position,
    username,
    score,
    isCurrentUser = false,
    isTopThree = false,
}) => {
    // Format rank with leading zeros
    const formattedRank = `#${position.toString().padStart(3, "0")}`;

    return (
        <div
            className={`flex items-center justify-between w-full gap-[74px] px-3 py-2 ${
                isCurrentUser
                    ? "bg-[rgba(255,249,243,0.36)] rounded-lg shadow-[0px_4px_3px_0px_rgba(171,95,28,0.24)]"
                    : ""
            }`}
            style={{
                fontFamily: "Kode Mono, monospace",
            }}
        >
            {/* Left side: Rank, Profile Image, Username */}
            <div className="flex items-center gap-2 flex-1">
                {/* Rank */}
                <span
                    className="text-[#211627]"
                    style={{
                        fontFamily: "Kode Mono, monospace",
                        fontSize: "14px",
                        lineHeight: "1.28em",
                        fontWeight: isTopThree ? 556 : 400,
                    }}
                >
                    {formattedRank}
                </span>

                {/* User info */}
                <div className="flex items-center gap-1 flex-1">
                    {/* Profile image */}
                    <div
                        className="flex-shrink-0 rounded-md overflow-hidden"
                        style={{
                            width: "22px",
                            height: "22px",
                            border: isCurrentUser
                                ? "1px solid #8F2638"
                                : "0.48px solid #904D81",
                        }}
                    >
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{
                                backgroundImage: `url(/assets/leaderboard/default-avatar.png)`,
                                backgroundColor: "#C4B5FD",
                            }}
                        />
                    </div>

                    {/* Username */}
                    <span
                        className="text-[#211627] flex-1"
                        style={{
                            fontFamily: "Kode Mono, monospace",
                            fontSize: "14px",
                            lineHeight: "1.28em",
                            fontWeight: isTopThree || isCurrentUser ? 500 : 400,
                        }}
                    >
                        {username}
                    </span>
                </div>
            </div>

            {/* Right side: Score */}
            <span
                className="text-[#211627] text-right"
                style={{
                    fontFamily: "Kode Mono, monospace",
                    fontSize: "14px",
                    lineHeight: "1.28em",
                    fontWeight: isCurrentUser ? 500 : 400,
                }}
            >
                {score.toLocaleString()}
            </span>
        </div>
    );
};

export default LeaderboardRow;
