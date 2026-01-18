import React, { useEffect, useRef, useState } from "react";
import { readContract } from "@wagmi/core";
import { config } from "../config/config";
import HomeGameplayManager from "../blockchain/HomeGameplayManager.sol/HomeGameplayManager.json";
import { useAccount, useDisconnect } from "wagmi";
import ButtonSmall from "./buttons/button_small";
import useTelegramClient from "../hooks/telegram-client";
import ButtonGreenSmall from "./buttons/button_green_small";
import { toast } from "react-toastify";

const { abi } = HomeGameplayManager;

interface PlayerState {
    points: bigint;
    gems: bigint;
    lives: bigint;
    characterIds: bigint[];
    lastReset: bigint;
}

const Profile: React.FC<{ navigateToScene: (scene: string) => void }> = ({
    navigateToScene,
}) => {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const [playerState, setPlayerState] = useState<PlayerState | null>(null);

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

    const handleLogout = () => {
        disconnect();

        localStorage.clear();
        sessionStorage.clear();

        navigateToScene("menu");

        toast.info("Wallet disconnected");
    };

    useEffect(() => {
        const fetchPlayerState = async () => {
            const state = await readContract(config, {
                address: import.meta.env.VITE_CONTRACT_ADDRESS,
                abi: abi,
                functionName: "getPlayerState",
                args: [address!],
            });
            setPlayerState(state as PlayerState);
            console.log("Player state:", state);
        };

        if (address) {
            fetchPlayerState();
        }
    }, [address]);

    const handlePopupClick = (e: any) => {
        const { clientX, clientY } = e;
        const popupElement = document.getElementById("popup-image");

        if (popupElement) {
            const { left, top, width } = popupElement.getBoundingClientRect();
            // Check if the click is in the top right corner
            if (clientX > left + width - 100 && clientY < top + 100) {
                handleNavigate("menu"); // Navigate to the main menu
            }
        }
    };

    const truncateAddress = (address: string) => {
        if (!address) return "";
        return `${address.slice(0, 10)}......${address.slice(-8)}`;
    };
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
                className="relative w-[90%] max-w-[313px] bg-contain bg-no-repeat bg-center"
                style={{
                    backgroundImage: "url('/assets/popups/profile-popup.svg')",
                    aspectRatio: "313/181",
                    maxHeight: "60vh",
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

                {/* Profile content */}
                <div
                    className="flex flex-col gap-3 px-6 pt-6 pb-3"
                    style={{ fontFamily: "Kode Mono, monospace" }}
                >
                    {/* User section */}
                    <div className="flex items-center gap-3">
                        {/* Profile image */}
                        <div
                            className="flex-shrink-0 rounded-[4px] overflow-hidden"
                            style={{
                                width: "40px",
                                height: "40px",
                                border: "1px solid #904D81",
                            }}
                        >
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(/assets/profile-face.png)`,
                                    backgroundColor: "#C4B5FD",
                                }}
                            />
                        </div>

                        {/* Username */}
                        <div className="flex flex-col gap-1 flex-1">
                            <span
                                className="text-[#211627] truncate"
                                style={{
                                    fontFamily: "Kode Mono, monospace",
                                    fontSize: "14px",
                                    lineHeight: "1.28em",
                                    fontWeight: 600,
                                }}
                            >
                                {address
                                    ? truncateAddress(address)
                                    : "0x74gt...7h8"}
                            </span>
                        </div>
                    </div>

                    {/* Stats section */}
                    <div className="flex flex-col gap-3 pl-12">
                        {/* Lives */}
                        <div className="flex items-center justify-between">
                            <span
                                className="text-[#211627]"
                                style={{
                                    fontFamily: "Kode Mono, monospace",
                                    fontSize: "12px",
                                    lineHeight: "1.28em",
                                    fontWeight: 500,
                                }}
                            >
                                lives
                            </span>
                            <div className="flex items-center gap-1">
                                {/* Heart icons */}
                                {[...Array(5)].map((_, i) => {
                                    const isFilled =
                                        playerState &&
                                        i < Number(playerState.lives);
                                    return (
                                        <svg
                                            key={i}
                                            width="12"
                                            height="11"
                                            viewBox="0 0 16 14"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{
                                                filter: isFilled
                                                    ? "drop-shadow(0px 1px 1.6px rgba(68, 24, 54, 0.46))"
                                                    : "none",
                                            }}
                                        >
                                            <path
                                                d="M8 13.5L6.9 12.5C2.8 8.9 0 6.4 0 3.5C0 1.5 1.5 0 3.5 0C4.6 0 5.6 0.5 6.3 1.3L8 3L9.7 1.3C10.4 0.5 11.4 0 12.5 0C14.5 0 16 1.5 16 3.5C16 6.4 13.2 8.9 9.1 12.5L8 13.5Z"
                                                fill={
                                                    isFilled
                                                        ? "url(#heart-gradient-filled)"
                                                        : "url(#heart-gradient-empty)"
                                                }
                                                stroke={
                                                    isFilled
                                                        ? "#D69AA5"
                                                        : "#4D212A"
                                                }
                                                strokeWidth="0.32"
                                            />
                                            <defs>
                                                <linearGradient
                                                    id="heart-gradient-filled"
                                                    x1="8"
                                                    y1="0.78"
                                                    x2="8"
                                                    y2="18.67"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="#EA485E" />
                                                    <stop
                                                        offset="1"
                                                        stopColor="#632984"
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="heart-gradient-empty"
                                                    x1="8"
                                                    y1="0.78"
                                                    x2="8"
                                                    y2="18.67"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="#EA485E" />
                                                    <stop
                                                        offset="1"
                                                        stopColor="#632984"
                                                    />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ranking */}
                        <div className="flex items-center justify-between">
                            <span
                                className="text-[#211627]"
                                style={{
                                    fontFamily: "Kode Mono, monospace",
                                    fontSize: "12px",
                                    lineHeight: "1.28em",
                                    fontWeight: 500,
                                }}
                            >
                                ranking
                            </span>
                            <span
                                className="text-[#211627]"
                                style={{
                                    fontFamily: "Kode Mono, monospace",
                                    fontSize: "14px",
                                    lineHeight: "1.28em",
                                    fontWeight: 600,
                                }}
                            >
                                #067
                            </span>
                        </div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex items-center justify-center gap-3 pb-3">
                    {/* Go back button */}
                    <img
                        src="/assets/buttons/go-back.svg"
                        alt="Go back"
                        className="cursor-pointer h-auto"
                        style={{ width: "auto", maxHeight: "40px" }}
                        onClick={() => handleNavigate("menu")}
                    />

                    {/* Sign out button */}
                    <img
                        src="/assets/buttons/sign-out.svg"
                        alt="Sign out"
                        className="cursor-pointer h-auto"
                        style={{ width: "auto", maxHeight: "40px" }}
                        onClick={handleLogout}
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;

