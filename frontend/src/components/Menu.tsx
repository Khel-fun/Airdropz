import React, { useEffect, useRef } from "react";
import {
    writeContract,
    readContract,
    waitForTransactionReceipt,
} from "@wagmi/core";
import { config } from "../config/config";
import HomeGameplayManager from "../blockchain/HomeGameplayManager.sol/HomeGameplayManager.json";
import { useAccount, useDisconnect } from "wagmi";
import { toast } from "react-toastify";
import { trackEvent } from "../utils/analytics";
import { sdk } from "@farcaster/miniapp-sdk";

const { abi } = HomeGameplayManager;
const REPLENISH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in ms

const extractRevertReason = (error: any): string => {
    const errorMessage = error?.message || "";

    const detailsMatch = errorMessage.match(
        /Details: execution reverted: (.*?)(?:\n|$)/,
    );
    if (detailsMatch?.[1]) {
        return detailsMatch[1];
    }

    const reasonMatch = errorMessage.match(/with reason: (.*?)(?:\.|$)/);
    if (reasonMatch?.[1]) {
        return reasonMatch[1];
    }

    if (errorMessage.includes("execution reverted")) {
        return "Transaction reverted by the blockchain";
    }

    return error instanceof Error ? error.message : "Transaction failed";
};

const Menu: React.FC<{
    onStartGame: () => void;
    navigateToScene: (scene: string) => void;
}> = ({ onStartGame, navigateToScene }) => {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    const [playerState, setPlayerState] = React.useState<any>(null);
    const [replenishTimeLeft, setReplenishTimeLeft] = React.useState<number>(0);
    const [displayName, setDisplayName] = React.useState<string>("");
    const [profilePicUrl, setProfilePicUrl] = React.useState<string>(
        "/assets/profile-img.png",
    );
    const [showLogoutModal, setShowLogoutModal] =
        React.useState<boolean>(false);

    const clickSound = useRef<HTMLAudioElement | null>(null);

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

    // Fetch username and profile picture from Farcaster context
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get Farcaster context which includes user info
                const context = await sdk.context;

                if (context?.user) {
                    // Username is directly available in context!
                    if (context.user.username) {
                        setDisplayName(`@${context.user.username}`);
                    }

                    // Profile picture URL is also available!
                    if (context.user.pfpUrl) {
                        setProfilePicUrl(context.user.pfpUrl);
                    }
                    return;
                }
            } catch (error) {
                // Not in Farcaster context
                console.log("Not in Farcaster context");
            }

            // Fallback to shortened wallet address
            if (address) {
                const shortened = `${address.slice(0, 6)}...${address.slice(-4)}`;
                setDisplayName(shortened);
                // Keep default profile image
                setProfilePicUrl("/assets/profile-img.png");
            }
        };

        if (address) {
            fetchUserData();
        }
    }, [address]);

    // Fetch player state
    useEffect(() => {
        const fetchStates = async () => {
            if (!address) return;
            await fetchPlayerState();
        };

        fetchStates();
    }, [address]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (playerState?.lastReset !== undefined) {
            intervalId = setInterval(() => {
                const lastResetMs = Number(playerState.lastReset) * 1000;
                const now = Date.now();
                const diff = lastResetMs + REPLENISH_INTERVAL - now;
                setReplenishTimeLeft(diff > 0 ? diff : 0);
            }, 1000);
        } else {
            setReplenishTimeLeft(0);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [playerState?.lastReset]);

    // Fetch player state
    const fetchPlayerState = async () => {
        if (!address) return;
        try {
            const result = await readContract(config, {
                address: import.meta.env.VITE_CONTRACT_ADDRESS,
                abi: abi,
                functionName: "getPlayerState",
                args: [address],
            });
            setPlayerState(result);
            console.log(result);
        } catch (error) {
            console.error("Error fetching player state:", error);
        }
    };

    // Replenish lives handler
    const handleReplenishLives = async () => {
        if (!address) return;

        try {
            // Initial toast notification
            toast.info("Opening MetaMask to replenish lives...");

            // Prepare transaction
            const hash = await writeContract(config, {
                address: import.meta.env.VITE_CONTRACT_ADDRESS,
                abi: abi,
                functionName: "replenishLives",
            });

            // Show pending toast while transaction is being mined
            const pendingToastId = toast.loading(
                "Replenishing lives... Please wait for confirmation.",
            );

            try {
                // Wait for transaction to be mined
                const receipt = await waitForTransactionReceipt(config, {
                    hash,
                });

                // Check if transaction was successful
                if (receipt.status === "success") {
                    toast.dismiss(pendingToastId);
                    toast.success("Lives replenished successfully!");

                    // Refresh player state after successful transaction
                    await fetchPlayerState();
                } else {
                    toast.dismiss(pendingToastId);
                    toast.error(
                        "Failed to replenish lives. Transaction reverted.",
                    );
                }
            } catch (receiptError: any) {
                toast.dismiss(pendingToastId);

                // Extract blockchain error message using improved function
                extractRevertReason(receiptError);

                toast.error(
                    `Cannot replenish yet - wait 24h from last replenish`,
                );
                console.error("Transaction receipt error:", receiptError);
            }
        } catch (error: any) {
            // Extract error message from rejection using improved function
            const revertReason = extractRevertReason(error);

            toast.error(`Failed to replenish lives: ${revertReason}`);
            console.error("Error replenishing lives:", error);
        }
    };

    // Handler for Play button
    const handlePlayButton = () => {
        playClickSound();

        if (
            playerState?.lives === BigInt(0) ||
            (replenishTimeLeft <= 0 && playerState?.lastReset !== undefined)
        ) {
            handleReplenishLives();
        } else {
            onStartGame();
            trackEvent("Game Started", {
                lives: playerState?.lives.toString(),
            });
        }
    };

    const canReplenish =
        replenishTimeLeft <= 0 && playerState?.lastReset !== undefined;
    const needsReplenish = playerState?.lives === BigInt(0);

    return (
        <div
            className="flex flex-col min-h-screen bg-cover bg-no-repeat"
            style={{
                backgroundImage: "url('/assets/main-menu.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: "100dvh",
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-center w-full px-6 pt-12">
                {/* Sign-out button */}
                <button
                    className="flex items-center gap-2 px-[18px] py-2 rounded-[80px]"
                    style={{
                        backgroundColor: "rgba(139, 147, 236, 0.2)",
                    }}
                    onClick={() => {
                        playClickSound();
                        setShowLogoutModal(true);
                    }}
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4.5 10.5H2.5C2.23478 10.5 1.98043 10.3946 1.79289 10.2071C1.60536 10.0196 1.5 9.76522 1.5 9.5V2.5C1.5 2.23478 1.60536 1.98043 1.79289 1.79289C1.98043 1.60536 2.23478 1.5 2.5 1.5H4.5M8 8.5L10.5 6L8 3.5M10.5 6H4.5"
                            stroke="#B6B8CE"
                            strokeWidth="1.32"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {/* User info */}
                <div className="flex items-center gap-2">
                    {/* Username and lives */}
                    <div
                        className="flex flex-col items-end"
                        style={{ width: "87px" }}
                    >
                        <div
                            className="text-right truncate"
                            style={{
                                fontFamily: "Kode Mono, monospace",
                                fontWeight: 600,
                                fontSize: "16px",
                                lineHeight: "1.28em",
                                color: "#E7E5F0",
                                maxWidth: "87px",
                            }}
                        >
                            {displayName || "..."}
                        </div>
                        {/* <div className="flex items-center gap-1">
                            <span
                                style={{
                                    fontFamily: "Kode Mono, monospace",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    lineHeight: "1.28em",
                                    color: "#E7E5F0",
                                }}
                            >
                                {playerState?.lives.toString() || "0"}/5
                            </span>
                            <svg
                                width="16"
                                height="14"
                                viewBox="0 0 16 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M8 13.5C8 13.5 1 9.5 1 5C1 3.67392 1.52678 2.40215 2.46447 1.46447C3.40215 0.526784 4.67392 0 6 0C6.89 0 7.73 0.25 8.5 0.67C9.27 0.25 10.11 0 11 0C12.3261 0 13.5979 0.526784 14.5355 1.46447C15.4732 2.40215 16 3.67392 16 5C16 9.5 8 13.5 8 13.5Z"
                                    fill="url(#paint0_linear)"
                                />
                                <defs>
                                    <linearGradient
                                        id="paint0_linear"
                                        x1="8"
                                        y1="0.75"
                                        x2="8"
                                        y2="18"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#EA485E" />
                                        <stop offset="1" stopColor="#632984" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div> */}
                    </div>

                    {/* Profile image */}
                    <div
                        className="rounded cursor-pointer"
                        style={{
                            width: "45.18px",
                            height: "45.18px",
                            overflow: "hidden",
                        }}
                        onClick={() => {
                            playClickSound();
                            navigateToScene("profile");
                        }}
                    >
                        <img
                            src={profilePicUrl}
                            alt="Profile"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                            onError={(e) => {
                                // Fallback to default image if Farcaster image fails to load
                                const target = e.target as HTMLImageElement;
                                target.src = "/assets/profile-img.png";
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-end flex-1 w-full px-4 pb-8">
                {/* Play Button */}
                <button
                    className="relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-16"
                    onClick={handlePlayButton}
                    disabled={needsReplenish && !canReplenish}
                    style={{
                        padding: "0px 18px 0px 26px",
                    }}
                >
                    {/* Button Background Layers */}
                    <div
                        className="absolute"
                        style={{ top: "-2px", left: "1px" }}
                    >
                        <img
                            src="/assets/buttons/play-button-yellow.svg"
                            alt=""
                            style={{ width: "108px", height: "36px" }}
                        />
                    </div>
                    <div
                        className="absolute"
                        style={{ top: "-2px", left: "1px" }}
                    >
                        <img
                            src="/assets/buttons/play-button-rose.svg"
                            alt=""
                            style={{ width: "108px", height: "36px" }}
                        />
                    </div>

                    {/* Button Text */}
                    <div className="relative flex items-center gap-[2px]">
                        <span
                            style={{
                                fontFamily: "'Jersey 20', sans-serif",
                                fontWeight: 400,
                                fontSize: "32px",
                                lineHeight: "1em",
                                letterSpacing: "-0.02em",
                                color: "#FFFFFF",
                            }}
                        >
                            PLAY
                        </span>
                        <span
                            style={{
                                fontFamily: "'Jersey 20', sans-serif",
                                fontWeight: 400,
                                fontSize: "32px",
                                lineHeight: "1em",
                                letterSpacing: "-0.02em",
                                color: "#FFFFFF",
                            }}
                        >
                            !
                        </span>
                    </div>
                </button>

                {/* Navigation Menu */}
                <div className="flex flex-col items-center gap-12 w-full max-w-[400px] mx-auto mb-8">
                    {/* Tasks */}
                    <div
                        className="relative cursor-pointer"
                        onClick={() => handleNavigate("tasks")}
                    >
                        <div
                            className="text-center text-[24px] leading-[1em] tracking-[-0.02em] absolute"
                            style={{
                                fontFamily: "'Jersey 20', sans-serif",
                                fontWeight: 400,
                                color: "#F10B8B",
                                top: "1px",
                                left: "2px",
                                zIndex: 1,
                            }}
                        >
                            tasks
                        </div>
                        <div
                            className="text-center text-[24px] leading-[1em] tracking-[-0.02em] relative"
                            style={{
                                fontFamily: "'Jersey 20', sans-serif",
                                fontWeight: 400,
                                color: "#FFFFFF",
                                textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                                zIndex: 2,
                            }}
                        >
                            tasks
                        </div>
                    </div>

                    {/* Leader Board */}
                    <div
                        className="relative cursor-pointer"
                        onClick={() => handleNavigate("leaderboard")}
                    >
                        <div
                            className="text-center text-[24px] leading-[1em] tracking-[-0.02em] absolute whitespace-nowrap"
                            style={{
                                fontFamily: "'Jersey 20', sans-serif",
                                fontWeight: 400,
                                color: "#F10B8B",
                                top: "1px",
                                left: "1px",
                                zIndex: 1,
                            }}
                        >
                            leader board
                        </div>
                        <div
                            className="text-center text-[24px] leading-[1em] tracking-[-0.02em] relative whitespace-nowrap"
                            style={{
                                fontFamily: "'Jersey 20', sans-serif",
                                fontWeight: 400,
                                color: "#FFFFFF",
                                zIndex: 2,
                            }}
                        >
                            leader board
                        </div>
                    </div>

                    {/* Info */}
                    <div
                        className="relative cursor-pointer"
                        onClick={() => handleNavigate("info")}
                    >
                        <div
                            className="text-center text-[24px] leading-[1em] tracking-[-0.02em] absolute"
                            style={{
                                fontFamily: "'Jersey 20', sans-serif",
                                fontWeight: 400,
                                color: "#F10B8B",
                                top: "1px",
                                left: "2px",
                                zIndex: 1,
                            }}
                        >
                            info
                        </div>
                        <div
                            className="text-center text-[24px] leading-[1em] tracking-[-0.02em] relative"
                            style={{
                                fontFamily: "'Jersey 20', sans-serif",
                                fontWeight: 400,
                                color: "#FFFFFF",
                                zIndex: 2,
                            }}
                        >
                            info
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                    onClick={() => setShowLogoutModal(false)}
                >
                    <div
                        className="relative flex flex-col items-center justify-center gap-6 px-8 py-8"
                        style={{
                            backgroundImage:
                                "url('/assets/popups/sign-out-popup.svg')",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            width: "268px",
                            height: "144px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Content */}
                        <div
                            className="relative text-center"
                            style={{
                                fontFamily: "'Kode Mono', monospace",
                                fontWeight: 600,
                                fontSize: "16px",
                                lineHeight: "1.28em",
                                color: "#211627",
                            }}
                        >
                            Confirm sign out ?
                        </div>

                        {/* Buttons */}
                        <div className="relative flex items-center justify-center gap-[60px] px-4 w-full">
                            {/* Cancel Button */}
                            <button
                                className="relative"
                                onClick={() => {
                                    playClickSound();
                                    setShowLogoutModal(false);
                                }}
                            >
                                <div
                                    className="text-[20px] leading-[1em] tracking-[-0.02em]"
                                    style={{
                                        fontFamily: "'Jersey 20', sans-serif",
                                        fontWeight: 400,
                                        color: "#6646F6",
                                    }}
                                >
                                    cancel
                                </div>
                            </button>

                            {/* Sign Out Button */}
                            <button
                                className="relative"
                                onClick={() => {
                                    playClickSound();
                                    disconnect();
                                    setShowLogoutModal(false);
                                    toast.success("Successfully signed out!");
                                }}
                            >
                                <div
                                    className="text-[20px] leading-[1em] tracking-[-0.02em]"
                                    style={{
                                        fontFamily: "'Jersey 20', sans-serif",
                                        fontWeight: 400,
                                        color: "#F10B8B",
                                    }}
                                >
                                    sign out
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;

