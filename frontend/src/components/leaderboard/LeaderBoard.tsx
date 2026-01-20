import React, { useEffect, useRef, useState } from "react";
import LeaderboardRow from "./LeaderboardRow";
import { useAccount } from "wagmi";
import { readContract } from "@wagmi/core";
import { config } from "../../config/config";
import HomeGameplayManager from "../../blockchain/HomeGameplayManager.sol/HomeGameplayManager.json";
import ButtonGreenSmall from "../buttons/button_green_small";
import { trackEvent } from "../../utils/analytics";
import ButtonBig from "../buttons/button_big";

interface LeaderboardEntry {
    username: string;
    score: number;
    address: string;
    position: number;
}

export type LeaderBoardType = {
    className?: string;
    navigateToScene: (scene: string) => void;
};

const LeaderBoard: React.FC<LeaderBoardType> = ({
    className = "",
    navigateToScene,
}) => {
    const { address } = useAccount();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    const clickSound = useRef<HTMLAudioElement | null>(null);

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;
    const pageSize = 7; // Display 7 players per page

    useEffect(() => {
        clickSound.current = new Audio("/assets/music/click_.wav");
        clickSound.current.volume = 0.6;

        return () => {
            if (clickSound.current) {
                clickSound.current = null;
            }
        };
    }, []);

    const playClickSound = () => {
        if (clickSound.current) {
            clickSound.current.currentTime = 0;
            clickSound.current.play().catch((error) => {
                console.log("Error playing click sound:", error);
            });
        }
    };

    const handleNavigate = (scene: string) => {
        playClickSound();
        navigateToScene(scene);
    };

    // Truncate ethereum address for display
    const truncateAddress = (addr: string): string => {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    // Fetch blockchain data
    const fetchLeaderboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Track analytics event
            trackEvent("Leaderboard Viewed", { page: currentPage });

            // Fetch total number of players first
            const totalPlayersResult = await readContract(config, {
                address: contractAddress,
                abi: HomeGameplayManager.abi,
                functionName: "getTotalPlayers",
            });

            const totalPlayersCount = Number(totalPlayersResult);
            setTotalPlayers(totalPlayersCount);

            if (totalPlayersCount === 0) {
                setLeaderboard([]);
                setIsLoading(false);
                return;
            }

            // Fetch leaderboard page
            const leaderboardData = await readContract(config, {
                address: contractAddress,
                abi: HomeGameplayManager.abi,
                functionName: "getLeaderboardPage",
                args: [BigInt(currentPage * pageSize), BigInt(pageSize)],
            });

            // Extract addresses and points from result
            const [addresses, points] = leaderboardData as [string[], bigint[]];

            // Transform the data into our LeaderboardEntry format
            const entries: LeaderboardEntry[] = addresses.map(
                (addr, index) => ({
                    username: truncateAddress(addr), // Use truncated address as username
                    score: Number(points[index]),
                    address: addr,
                    position: currentPage * pageSize + index + 1, // 1-based position
                }),
            );

            setLeaderboard(entries);

            // Find user's position if they're on the current page
            if (address) {
                const userEntry = entries.find(
                    (entry) =>
                        entry.address.toLowerCase() === address.toLowerCase(),
                );

                if (userEntry) {
                    setUserRank(userEntry.position);
                } else {
                    // Fetch user's points specifically if not on current page
                    try {
                        const userPoints = await readContract(config, {
                            address: contractAddress,
                            abi: HomeGameplayManager.abi,
                            functionName: "getPlayerPoints",
                            args: [address],
                        });

                        // If we have user points, we can show them in a special section
                        if (Number(userPoints) > 0) {
                            // We'd need to calculate user's actual rank, but for now we can show their points
                            const userScore = Number(userPoints);

                            // We could add a special entry for the user that's not part of the displayed list
                            // This would be shown in a separate "Your Rank" section
                        }
                    } catch (userError) {
                        console.error("Error fetching user rank:", userError);
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching leaderboard data:", err);
            setError(
                "Failed to load leaderboard data. Please try again later.",
            );

            // Fallback to empty leaderboard
            setLeaderboard([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when component mounts or page changes
    useEffect(() => {
        fetchLeaderboardData();
    }, [address, currentPage]);

    const handlePopupClick = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const popupElement = document.getElementById("popup-image");

        if (popupElement) {
            const { left, top, width, height } =
                popupElement.getBoundingClientRect();
            // Check if the click is in the top right corner
            if (clientX > left + width - 100 && clientY < top + 100) {
                handleNavigate("menu");
            }
        }
    };

    const handlePlayGame = () => {
        playClickSound();
        navigateToScene("gameplay");
    };

    const goToNextPage = () => {
        if ((currentPage + 1) * pageSize < totalPlayers) {
            playClickSound();
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 0) {
            playClickSound();
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen bg-cover bg-no-repeat w-screen"
            style={{
                backgroundImage: "url('/assets/popup_bg.png')",
                height: "100dvh",
                backgroundPosition: "center",
                backgroundSize: "cover",
            }}
        >
            <div
                className="absolute inset-0 bg-black opacity-60 z-0"
                aria-hidden="true"
            ></div>
            <div
                id="popup-image"
                className="relative w-[90%] max-w-[337px] bg-contain bg-no-repeat bg-center"
                style={{
                    backgroundImage:
                        "url('/assets/popups/leaderboard-popup.svg')",
                    aspectRatio: "337/693",
                    maxHeight: "85vh",
                    backgroundSize: "100% 100%",
                }}
                onClick={handlePopupClick}
            >
                {/* Close button */}
                <div
                    className="absolute -top-4 right-2 flex items-center justify-center p-1 cursor-pointer z-10"
                    onClick={() => handleNavigate("menu")}
                >
                    <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        stroke="#F8F5F7"
                        strokeWidth="2"
                    >
                        <path d="M1 1L9 9M9 1L1 9" />
                    </svg>
                </div>

                {/* Leaderboard title */}
                <div
                    className="text-center pt-8 pb-4 px-4 relative"
                    style={{ fontFamily: "'Jersey 20', sans-serif" }}
                >
                    {/* White shadow layer */}
                    <div
                        className="text-center pr-12 text-[24px] leading-[1em] tracking-[-0.02em] whitespace-nowrap absolute left-1/2 transform -translate-x-1/2"
                        style={{
                            fontFamily: "'Jersey 20', sans-serif",
                            fontWeight: 400,
                            color: "#FFFFFF",
                            top: "33px",
                            zIndex: 1,
                        }}
                    >
                        leader board
                    </div>
                    {/* Pink main layer */}
                    <div
                        className="text-center pr-12 text-[24px] leading-[1em] tracking-[-0.02em] whitespace-nowrap relative"
                        style={{
                            fontFamily: "'Jersey 20', sans-serif",
                            fontWeight: 400,
                            color: "#F10B8B",
                            textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                            zIndex: 2,
                        }}
                    >
                        leader board
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-[45vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-center mt-8">
                        {error}
                        <ButtonBig
                            onClick={fetchLeaderboardData}
                            style={{ maxWidth: "100px" }}
                            className="block mx-auto mt-4 text-white px-4 py-2"
                        >
                            Retry
                        </ButtonBig>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-white text-center mt-8">
                        No players on the leaderboard yet. Be the first!
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-8 w-[270px] mx-4">
                            {/* Leaderboard content */}
                            <div className="overflow-hidden">
                                {/* Top 3 holders section */}
                                <div className="flex flex-col">
                                    {leaderboard.slice(0, 3).map((entry) => (
                                        <LeaderboardRow
                                            key={entry.position}
                                            position={entry.position}
                                            username={entry.username}
                                            score={entry.score}
                                            isCurrentUser={
                                                address &&
                                                entry.address.toLowerCase() ===
                                                    address.toLowerCase()
                                            }
                                            isTopThree={true}
                                        />
                                    ))}
                                </div>

                                {/* Scrollable regular entries section */}
                                {leaderboard.length > 3 && (
                                    <div
                                        className="relative overflow-hidden"
                                        style={{
                                            height: "344px",
                                        }}
                                    >
                                        {/* Gradient masks */}
                                        <div
                                            className="absolute top-0 left-0 right-0 pointer-events-none z-10"
                                            style={{
                                                height: "230px",
                                                background:
                                                    "linear-gradient(180deg, #D9D9D9 0%, rgba(115, 115, 115, 0) 100%)",
                                            }}
                                        />
                                        <div
                                            className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
                                            style={{
                                                height: "114px",
                                                background:
                                                    "linear-gradient(180deg, rgba(217, 217, 217, 0) 0%, rgba(191, 191, 191, 0.6) 25%, #A6A6A6 50%, rgba(140, 140, 140, 0.6) 75%, rgba(115, 115, 115, 0) 100%)",
                                            }}
                                        />

                                        {/* Scrollable content */}
                                        <div
                                            className="overflow-y-auto h-full"
                                            style={{
                                                scrollbarWidth: "none",
                                                msOverflowStyle: "none",
                                            }}
                                        >
                                            <style>{`
                                                div::-webkit-scrollbar {
                                                    display: none;
                                                }
                                            `}</style>
                                            {leaderboard
                                                .slice(3)
                                                .map((entry) => (
                                                    <LeaderboardRow
                                                        key={entry.position}
                                                        position={
                                                            entry.position
                                                        }
                                                        username={
                                                            entry.username
                                                        }
                                                        score={entry.score}
                                                        isCurrentUser={
                                                            address &&
                                                            entry.address.toLowerCase() ===
                                                                address.toLowerCase()
                                                        }
                                                        isTopThree={false}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pagination controls */}
                        {totalPlayers > pageSize && (
                            <div className="flex justify-between items-center mt-4 w-full px-4">
                                <button
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 0}
                                    className={`px-4 py-1 text-white rounded ${
                                        currentPage === 0
                                            ? "bg-gray-500"
                                            : "bg-blue-600"
                                    }`}
                                >
                                    ← Prev
                                </button>
                                <span className="text-white">
                                    Page {currentPage + 1} of{" "}
                                    {Math.ceil(totalPlayers / pageSize)}
                                </span>
                                <button
                                    onClick={goToNextPage}
                                    disabled={
                                        (currentPage + 1) * pageSize >=
                                        totalPlayers
                                    }
                                    className={`px-4 py-1 text-white rounded ${
                                        (currentPage + 1) * pageSize >=
                                        totalPlayers
                                            ? "bg-gray-500"
                                            : "bg-blue-600"
                                    }`}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LeaderBoard;

