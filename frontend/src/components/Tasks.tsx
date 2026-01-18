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

                {/* Tasks title */}
                <div
                    className="text-center pt-12 pb-4 px-4 relative"
                    style={{ fontFamily: "'Jersey 20', sans-serif" }}
                >
                    {/* White shadow layer */}
                    <div
                        className="text-center text-[24px] leading-[1em] tracking-[-0.02em] absolute left-1/2 transform -translate-x-1/2"
                        style={{
                            fontFamily: "'Jersey 20', sans-serif",
                            fontWeight: 400,
                            color: "#FFFFFF",
                            top: "49px",
                            zIndex: 1,
                        }}
                    >
                        tasks
                    </div>
                    {/* Pink main layer */}
                    <div
                        className="text-center text-[24px] leading-[1em] tracking-[-0.02em] relative"
                        style={{
                            fontFamily: "'Jersey 20', sans-serif",
                            fontWeight: 400,
                            color: "#F10B8B",
                            textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                            zIndex: 2,
                        }}
                    >
                        tasks
                    </div>
                </div>

                {/* Tasks list */}
                <div
                    className="flex flex-col gap-3 px-8 pb-6 overflow-y-auto"
                    style={{
                        fontFamily: "Kode Mono, monospace",
                        maxHeight: "calc(100% - 120px)",
                    }}
                >
                    {/* Task 1: Follow team on X */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
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
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-[#211627] text-[14px] leading-[1.28em] font-medium">
                                    follow team on
                                </span>
                                <img
                                    src="/assets/X.svg"
                                    alt="X"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                    }}
                                />
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
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
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
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-[#211627] text-[14px] leading-[1.28em] font-medium">
                                    follow team on
                                </span>
                                <img
                                    src="/assets/Farcaster.svg"
                                    alt="Farcaster"
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                    }}
                                />
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
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
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
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
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

