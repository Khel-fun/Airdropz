import React, { useRef, useEffect } from "react";

const InfoPopup: React.FC<{ navigateToScene: (scene: string) => void }> = ({
    navigateToScene,
}) => {
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

    const handlePopupClick = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const popupElement = document.getElementById("info-popup-image");

        if (popupElement) {
            const { left, top } = popupElement.getBoundingClientRect();
            // Check if the click is in the top left corner for close button
            if (clientX < left + 100 && clientY < top + 100) {
                handleNavigate("menu");
            }
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
                id="info-popup-image"
                className="relative w-[90%] max-w-[337px] bg-contain bg-no-repeat bg-center"
                style={{
                    backgroundImage: "url('/assets/popups/info-popup.svg')",
                    aspectRatio: "337/693",
                    maxHeight: "85vh",
                    backgroundSize: "100% 100%",
                }}
                onClick={handlePopupClick}
            >
                {/* Close button */}
                <div
                    className="absolute top-4 left-4 flex items-center justify-center p-1 cursor-pointer z-10"
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

                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col items-center px-8 pt-12 pb-20">
                    {/* Coins Section */}
                    <div className="w-full mb-10">
                        {/* Coins Title */}
                        <div className="relative mb-3">
                            <div
                                className="text-center text-[24px] leading-[1em] tracking-[-0.02em] absolute left-1/2 transform -translate-x-1/2"
                                style={{
                                    fontFamily: "'Jersey 20', sans-serif",
                                    fontWeight: 400,
                                    color: "#F10B8B",
                                    top: "1px",
                                }}
                            >
                                coins
                            </div>
                            <div
                                className="text-center text-[24px] leading-[1em] tracking-[-0.02em]"
                                style={{
                                    fontFamily: "'Jersey 20', sans-serif",
                                    fontWeight: 400,
                                    color: "#FFFFFF",
                                }}
                            >
                                coins
                            </div>
                        </div>

                        {/* Coins List */}
                        <div className="flex flex-col gap-[-2px] ml-6">
                            {/* BTC - Super Rare */}
                            <div className="flex items-center justify-between">
                                <img
                                    src="/assets/coins/bitcoin.svg"
                                    alt="BTC"
                                    className="w-11 h-11"
                                />
                                <div className="flex-1 ml-2 relative h-[39px] flex items-center justify-between px-3">
                                    <div
                                        className="absolute inset-0 rounded-r"
                                        style={{
                                            background:
                                                "linear-gradient(90deg, rgba(255, 249, 91, 0) 0%, rgba(255, 198, 53, 0.5) 12.5%, #FF930F 100%)",
                                        }}
                                    />
                                    <span
                                        className="relative text-[24px] leading-[1.579em] tracking-[-0.02em] z-10"
                                        style={{
                                            fontFamily:
                                                "'Coda Caption', sans-serif",
                                            fontWeight: 800,
                                            color: "#FFFFFF",
                                            fontStyle: "extrabold",
                                        }}
                                    >
                                        +100
                                    </span>
                                    <span
                                        className="relative text-[8px] leading-[1.2em] tracking-[-0.02em] z-10"
                                        style={{
                                            fontFamily: "'Barlow', sans-serif",
                                            fontWeight: 500,
                                            color: "#F2F0C9",
                                            opacity: 0.8,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        SUPER RARE
                                    </span>
                                </div>
                            </div>

                            {/* ZEC - Rare */}
                            <div className="flex items-center justify-between">
                                <img
                                    src="/assets/coins/zcash.svg"
                                    alt="ZEC"
                                    className="w-11 h-11"
                                />
                                <div className="flex-1 ml-2 relative h-[39px] flex items-center justify-between px-3">
                                    <div
                                        className="absolute inset-0 rounded-r"
                                        style={{
                                            background:
                                                "linear-gradient(90deg, rgba(255, 249, 91, 0) 0%, rgba(255, 198, 53, 0.5) 12.5%, #FF930F 100%)",
                                        }}
                                    />
                                    <span
                                        className="relative text-[24px] leading-[1.579em] tracking-[-0.02em] z-10"
                                        style={{
                                            fontFamily:
                                                "'Coda Caption', sans-serif",
                                            fontWeight: 800,
                                            color: "#FFFFFF",
                                        }}
                                    >
                                        +50
                                    </span>
                                    <span
                                        className="relative text-[8px] leading-[1.2em] tracking-[-0.02em] z-10"
                                        style={{
                                            fontFamily: "'Barlow', sans-serif",
                                            fontWeight: 500,
                                            color: "#F2F0C9",
                                            opacity: 0.8,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        RARE
                                    </span>
                                </div>
                            </div>

                            {/* ETH - Regular */}
                            <div className="flex items-center justify-between">
                                <img
                                    src="/assets/coins/ethereum.svg"
                                    alt="ETH"
                                    className="w-11 h-11"
                                />
                                <div className="flex-1 ml-2 relative h-[39px] flex items-center justify-between px-3">
                                    <div
                                        className="absolute inset-0 rounded-r"
                                        style={{
                                            background:
                                                "linear-gradient(90deg, rgba(255, 249, 91, 0) 0%, rgba(255, 198, 53, 0.5) 12.5%, #FF930F 100%)",
                                        }}
                                    />
                                    <span
                                        className="relative text-[24px] leading-[1.579em] tracking-[-0.02em] z-10"
                                        style={{
                                            fontFamily:
                                                "'Coda Caption', sans-serif",
                                            fontWeight: 800,
                                            color: "#FFFFFF",
                                        }}
                                    >
                                        +10
                                    </span>
                                    <span
                                        className="relative text-[8px] leading-[1.2em] tracking-[-0.02em] z-10"
                                        style={{
                                            fontFamily: "'Barlow', sans-serif",
                                            fontWeight: 500,
                                            color: "#F2F0C9",
                                            opacity: 0.8,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        REGULAR
                                    </span>
                                </div>
                            </div>

                            {/* USDC - Regular */}
                            <div className="flex items-center justify-between">
                                <img
                                    src="/assets/coins/usdc.svg"
                                    alt="USDC"
                                    className="w-11 h-11"
                                />
                                <div className="flex-1 ml-2 relative h-[39px] flex items-center justify-between px-3">
                                    <div
                                        className="absolute inset-0 rounded-r"
                                        style={{
                                            background:
                                                "linear-gradient(90deg, rgba(255, 249, 91, 0) 0%, rgba(255, 198, 53, 0.5) 12.5%, #FF930F 100%)",
                                        }}
                                    />
                                    <span
                                        className="relative text-[24px] leading-[1.579em] tracking-[-0.02em] z-10"
                                        style={{
                                            fontFamily:
                                                "'Coda Caption', sans-serif",
                                            fontWeight: 800,
                                            color: "#FFFFFF",
                                        }}
                                    >
                                        +10
                                    </span>
                                    <span
                                        className="relative text-[8px] leading-[1.2em] tracking-[-0.02em] z-10"
                                        style={{
                                            fontFamily: "'Barlow', sans-serif",
                                            fontWeight: 500,
                                            color: "#F2F0C9",
                                            opacity: 0.8,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        REGULAR
                                    </span>
                                </div>
                            </div>

                            {/* SOL - Regular */}
                            <div className="flex items-center justify-between">
                                <img
                                    src="/assets/coins/solana.svg"
                                    alt="SOL"
                                    className="w-11 h-11"
                                />
                                <div className="flex-1 ml-2 relative h-[39px] flex items-center justify-between px-3">
                                    <div
                                        className="absolute inset-0 rounded-r"
                                        style={{
                                            background:
                                                "linear-gradient(90deg, rgba(255, 249, 91, 0) 0%, rgba(255, 198, 53, 0.5) 12.5%, #FF930F 100%)",
                                        }}
                                    />
                                    <span
                                        className="relative text-[24px] leading-[1.579em] tracking-[-0.02em] z-10"
                                        style={{
                                            fontFamily:
                                                "'Coda Caption', sans-serif",
                                            fontWeight: 800,
                                            color: "#FFFFFF",
                                        }}
                                    >
                                        +10
                                    </span>
                                    <span
                                        className="relative text-[8px] leading-[1.2em] tracking-[-0.02em] z-10"
                                        style={{
                                            fontFamily: "'Barlow', sans-serif",
                                            fontWeight: 500,
                                            color: "#F2F0C9",
                                            opacity: 0.8,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        REGULAR
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Power-ups Section */}
                    <div className="w-full">
                        {/* Power-ups Title */}
                        <div className="relative mb-3">
                            <div
                                className="text-center text-[24px] leading-[1em] tracking-[-0.02em] absolute left-1/2 transform -translate-x-1/2"
                                style={{
                                    fontFamily: "'Jersey 20', sans-serif",
                                    fontWeight: 400,
                                    color: "#F10B8B",
                                    top: "1px",
                                }}
                            >
                                power-ups
                            </div>
                            <div
                                className="text-center text-[24px] leading-[1em] tracking-[-0.02em]"
                                style={{
                                    fontFamily: "'Jersey 20', sans-serif",
                                    fontWeight: 400,
                                    color: "#FFFFFF",
                                }}
                            >
                                power-ups
                            </div>
                        </div>

                        {/* Power-ups List */}
                        <div className="flex flex-col gap-[-2px]">
                            {/* 2x Points */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1 relative h-[39px] flex items-center px-3">
                                    <div
                                        className="absolute inset-0 rounded-l"
                                        style={{
                                            background:
                                                "linear-gradient(90deg, #E60939 0%, rgba(231, 109, 45, 0.5) 88%, rgba(233, 208, 34, 0) 100%)",
                                        }}
                                    />
                                    <span
                                        className="relative text-[11px] leading-[1.2em] tracking-[0.01em] lowercase z-10"
                                        style={{
                                            fontFamily: "'Barlow', sans-serif",
                                            fontWeight: 600,
                                            color: "#FFFFFF",
                                            opacity: 0.8,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        get twice the points for the coins
                                        captured
                                    </span>
                                </div>
                                <img
                                    src="/assets/double_points.svg"
                                    alt="2x"
                                    className="w-11 h-11 ml-2"
                                />
                            </div>

                            {/* Bear - Reduce Speed */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1 relative h-[39px] flex items-center px-3">
                                    <div
                                        className="absolute inset-0 rounded-l"
                                        style={{
                                            background:
                                                "linear-gradient(90deg, #E60939 0%, rgba(231, 109, 45, 0.5) 88%, rgba(233, 208, 34, 0) 100%)",
                                        }}
                                    />
                                    <span
                                        className="relative text-[11px] leading-[1.2em] tracking-[0.01em] lowercase z-10"
                                        style={{
                                            fontFamily: "'Barlow', sans-serif",
                                            fontWeight: 600,
                                            color: "#FFFFFF",
                                            opacity: 0.8,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        reduce the speed of the coin fall
                                    </span>
                                </div>
                                <img
                                    src="/assets/slower_ingredient.svg"
                                    alt="Bear"
                                    className="w-11 h-11 ml-2"
                                />
                            </div>

                            {/* Bull - Increase Speed */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1 relative h-[39px] flex items-center px-3">
                                    <div
                                        className="absolute inset-0 rounded-l"
                                        style={{
                                            background:
                                                "linear-gradient(90deg, #E60939 0%, rgba(231, 109, 45, 0.5) 88%, rgba(233, 208, 34, 0) 100%)",
                                        }}
                                    />
                                    <span
                                        className="relative text-[11px] leading-[1.2em] tracking-[0.01em] lowercase z-10"
                                        style={{
                                            fontFamily: "'Barlow', sans-serif",
                                            fontWeight: 600,
                                            color: "#FFFFFF",
                                            opacity: 0.8,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        increase the rate of the coin fall
                                    </span>
                                </div>
                                <img
                                    src="/assets/speed_booster.svg"
                                    alt="Bull"
                                    className="w-11 h-11 ml-2"
                                />
                            </div>

                            {/* Magnet - Catch All */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1 relative h-[39px] flex items-center px-3">
                                    <div
                                        className="absolute inset-0 rounded-l"
                                        style={{
                                            background:
                                                "linear-gradient(90deg, #E60939 0%, rgba(231, 109, 45, 0.5) 88%, rgba(233, 208, 34, 0) 100%)",
                                        }}
                                    />
                                    <span
                                        className="relative text-[11px] leading-[1.2em] tracking-[0.01em] lowercase z-10"
                                        style={{
                                            fontFamily: "'Barlow', sans-serif",
                                            fontWeight: 600,
                                            color: "#FFFFFF",
                                            opacity: 0.8,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        catch all coins at without missing any
                                    </span>
                                </div>
                                <img
                                    src="/assets/magnet.svg"
                                    alt="Magnet"
                                    className="w-11 h-11 ml-2"
                                />
                            </div>

                            {/* Shield - Immune */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1 relative h-[39px] flex items-center px-3">
                                    <div
                                        className="absolute inset-0 rounded-l"
                                        style={{
                                            background:
                                                "linear-gradient(90deg, #E60939 0%, rgba(231, 109, 45, 0.5) 88%, rgba(233, 208, 34, 0) 100%)",
                                        }}
                                    />
                                    <span
                                        className="relative text-[11px] leading-[1.2em] tracking-[0.01em] lowercase z-10"
                                        style={{
                                            fontFamily: "'Barlow', sans-serif",
                                            fontWeight: 600,
                                            color: "#FFFFFF",
                                            opacity: 0.8,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        immune to missing out on catching coins
                                    </span>
                                </div>
                                <img
                                    src="/assets/shield.svg"
                                    alt="Shield"
                                    className="w-11 h-11 ml-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoPopup;

