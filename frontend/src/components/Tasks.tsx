import React, { useEffect, useRef, useState } from "react";
import Button from "./buttons/button";
import { toast } from "react-toastify";
import ButtonGreenSmall from "./buttons/button_green_small";
// import { readContract } from "@wagmi/core";
// import { config } from "../config/config";
// import HomeGameplayManager from "../blockchain/HomeGameplayManager.sol/HomeGameplayManager.json";
// import { useAccount } from "wagmi";

// const { abi } = HomeGameplayManager;

// interface PlayerState {
//     points: bigint;
//     gems: bigint;
//     lives: bigint;
//     characterIds: bigint[];
//     lastReset: bigint;
// }

const Tasks: React.FC<{ navigateToScene: (scene: string) => void }> = ({
    navigateToScene,
}) => {
    // const { address } = useAccount();
    // const [playerState, setPlayerState] = useState<PlayerState | null>(null);

    // useEffect(() => {
    //     const fetchPlayerState = async () => {
    //         const state = await readContract(config, {
    //             address: import.meta.env.VITE_CONTRACT_ADDRESS,
    //             abi: abi,
    //             functionName: "getPlayerState",
    //             args: [address!],
    //         });
    //         setPlayerState(state as PlayerState);
    //         console.log("Player state:", state);
    //     };

    //     if (address) {
    //         fetchPlayerState();
    //     }
    // }, [address]);

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

    const handlePopupClick = (e: any) => {
        const { clientX, clientY } = e;
        const popupElement = document.getElementById("popup-image");

        if (popupElement) {
            const { left, top, width, height } =
                popupElement.getBoundingClientRect();
            // Check if the click is in the top right corner
            if (clientX > left + width - 100 && clientY < top + 100) {
                navigateToScene("menu"); // Navigate to the main menu
            }
        }
    };

    const handleFollowOnX = () => {
        window.open("https://x.com/eoniangame", "_blank");
    };

    const handleShare = async () => {
        // Share data
        const shareData = {
            title: "Eonian",
            text: "Check out Eonian - an amazing blockchain game!",
            url: window.location.href,
        };

        // Check if Web Share API is supported
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log("Shared successfully");
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            try {
                await navigator.clipboard.writeText(shareData.url);
                toast.success("Link copied to clipboard!", {
                    position: "top-center",
                    autoClose: 2000,
                });
            } catch (err) {
                console.error("Failed to copy link:", err);
                toast.error("Couldn't copy link to clipboard", {
                    position: "top-center",
                    autoClose: 2000,
                });
            }
        }
    };

    // const truncateAddress = (address: string) => {
    //     if (!address) return "";
    //     return `${address.slice(0, 8)}......${address.slice(-6)}`;
    // };
    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen bg-cover bg-no-repeat w-screen"
            style={{
                backgroundImage: "url('/assets/popup-bg.png')",
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
                className="relative w-[90%] max-w-[356px] bg-contain bg-no-repeat bg-center"
                style={{
                    backgroundImage: "url('/assets/popups/tasks-popup.svg')",
                    aspectRatio: "356/382",
                    maxHeight: "85vh",
                    backgroundSize: "100% 100%",
                }}
                onClick={handlePopupClick}
            >
                {/* Close button */}
                <div
                    className="absolute top-2 right-2 flex items-center justify-center p-1 cursor-pointer z-10"
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

                {/* Tasks title */}
                <div
                    className="text-center pt-12 pb-4 px-4"
                    style={{ fontFamily: "Kode Mono, monospace" }}
                >
                    <h1 className="text-[20px] sm:text-[24px] leading-[1em] tracking-[-0.02em] uppercase relative font-bold">
                        <span className="absolute top-[2px] left-1/2 transform -translate-x-1/2 text-white">
                            tasks
                        </span>
                        <span className="relative text-[#F10B8B]">tasks</span>
                    </h1>
                </div>

                {/* Tasks list */}
                <div
                    className="flex flex-col gap-4 px-6 pb-6 overflow-y-auto"
                    style={{
                        fontFamily: "Kode Mono, monospace",
                        maxHeight: "calc(100% - 120px)",
                    }}
                >
                    {/* Task 1: Follow team on X */}
                    <div className="flex items-center justify-between gap-10">
                        <div className="flex items-center gap-4 flex-1">
                            <div
                                className="flex-shrink-0"
                                style={{
                                    width: "18px",
                                    height: "18px",
                                }}
                            >
                                <div
                                    className="w-full h-full bg-[#EBC485] rounded-sm"
                                    style={{
                                        boxShadow:
                                            "inset 2px 2px 1.2px -1px rgba(143, 38, 56, 0.25)",
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-1.5 flex-1">
                                <span className="text-[#211627] text-[14px] leading-[1.28em] font-medium">
                                    follow team on
                                </span>
                                <div
                                    className="bg-black rounded-[4px] flex items-center justify-center"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        padding: "4px",
                                    }}
                                >
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 10 10"
                                        fill="white"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M5.9 0h2.15L5.26 4.26l3.38 4.47H6L3.92 5.89 1.45 8.73H.29l3.04-3.47L0 0h2.68l1.88 2.49L6.89 0zm-.75 7.85h1.19L2.64 1.23H1.36l3.79 6.62z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div
                            className="flex items-center justify-center p-[3px] cursor-pointer"
                            onClick={handleFollowOnX}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="rgba(110, 99, 154, 0.61)"
                                strokeWidth="1.24"
                            >
                                <path
                                    d="M7 4L13 10L7 16"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Task 2: Follow team on Farcaster (checked) */}
                    <div className="flex items-center justify-between gap-10">
                        <div className="flex items-center gap-4 flex-1">
                            <div
                                className="flex-shrink-0 relative"
                                style={{
                                    width: "18px",
                                    height: "18px",
                                }}
                            >
                                <div
                                    className="w-full h-full bg-[#EBC485] rounded-sm"
                                    style={{
                                        boxShadow:
                                            "inset 2px 2px 1.2px -1px rgba(143, 38, 56, 0.25)",
                                    }}
                                />
                                <svg
                                    width="14"
                                    height="13"
                                    viewBox="0 0 14 13"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    stroke="#1B8110"
                                    strokeWidth="2"
                                    style={{
                                        position: "absolute",
                                        top: "3px",
                                        left: "4px",
                                    }}
                                >
                                    <path
                                        d="M1 6L5 10L13 1"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div className="flex items-center gap-1.5 flex-1">
                                <span className="text-[#211627] text-[14px] leading-[1.28em] font-medium">
                                    follow team on
                                </span>
                                <div
                                    className="bg-[#9000FF] rounded-[4px] flex items-center justify-center"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                    }}
                                >
                                    <svg
                                        width="11"
                                        height="9"
                                        viewBox="0 0 11 9"
                                        fill="white"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M8.21 0C7.31 0 6.55.58 6.16 1.38 5.77.58 5.01 0 4.11 0 2.85 0 1.83 1.02 1.83 2.28c0 .36.08.7.23 1l-.02.02 3.71 5.34L9.33 3.3l-.02-.02c.15-.3.23-.64.23-1C9.54 1.02 8.52 0 8.21 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center p-[3px]">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="rgba(110, 99, 154, 0.61)"
                                strokeWidth="1.24"
                            >
                                <path
                                    d="M7 4L13 10L7 16"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Task 3: Add app to Farcaster */}
                    <div className="flex items-center justify-between gap-3.5">
                        <div className="flex items-center gap-4 flex-1">
                            <div
                                className="flex-shrink-0"
                                style={{
                                    width: "18px",
                                    height: "18px",
                                }}
                            >
                                <div
                                    className="w-full h-full bg-[#EBC485] rounded-sm"
                                    style={{
                                        boxShadow:
                                            "inset 2px 2px 1.2px -1px rgba(143, 38, 56, 0.25)",
                                    }}
                                />
                            </div>
                            <span className="text-[#211627] text-[14px] leading-[1.28em] font-medium flex-1">
                                add app to Farcaster
                            </span>
                        </div>
                        <div className="flex items-center justify-center p-[3px]">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="rgba(110, 99, 154, 0.61)"
                                strokeWidth="1.24"
                            >
                                <path
                                    d="M7 4L13 10L7 16"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Task 4: Cast app on Farcaster */}
                    <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-4 flex-1">
                            <div
                                className="flex-shrink-0"
                                style={{
                                    width: "18px",
                                    height: "18px",
                                }}
                            >
                                <div
                                    className="w-full h-full bg-[#EBC485] rounded-sm"
                                    style={{
                                        boxShadow:
                                            "inset 2px 2px 1.2px -1px rgba(143, 38, 56, 0.25)",
                                    }}
                                />
                            </div>
                            <span className="text-[#211627] text-[14px] leading-[1.28em] font-medium flex-1">
                                cast app on Farcaster
                            </span>
                        </div>
                        <div className="flex items-center justify-center p-[3px]">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="rgba(110, 99, 154, 0.61)"
                                strokeWidth="1.24"
                            >
                                <path
                                    d="M7 4L13 10L7 16"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tasks;

