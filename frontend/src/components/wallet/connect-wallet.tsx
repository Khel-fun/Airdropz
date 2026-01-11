import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";

export function ConnectWallet() {
    const { open } = useWeb3Modal();
    const { isConnected } = useAccount();
    const [isInFarcaster, setIsInFarcaster] = useState(false);

    useEffect(() => {
        const checkFarcasterContext = async () => {
            try {
                const context = await sdk.context;
                if (context?.user?.fid) {
                    setIsInFarcaster(true);
                }
            } catch (error) {
                setIsInFarcaster(false);
            }
        };

        checkFarcasterContext();
    }, []);

    const buttonText = isConnected
        ? "connected"
        : isInFarcaster
          ? "sign in with farcaster"
          : "connect wallet";

    const textColor = isInFarcaster ? "#8B5CF6" : "#F10B8B"; // Purple for Farcaster, Pink otherwise
    const fontSize = isInFarcaster && !isConnected ? "18px" : "24px"; // Smaller for Farcaster text
    const lineHeight = isInFarcaster && !isConnected ? "18px" : "24px";

    return (
        <button
            onClick={() => open()}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "0px",
                gap: "8px",
                isolation: "isolate",
                width: "169px",
                height: "38px",
                position: "relative",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                transform: "scale(1.5)",
            }}
        >
            {/* Combined button background SVG */}
            <img
                src="/assets/connect-wallet.svg"
                alt=""
                style={{
                    position: "absolute",
                    width: "169px",
                    height: "38px",
                    left: "0px",
                    top: "0px",
                    zIndex: 0,
                }}
            />

            {/* White text (shadow effect) */}
            <span
                style={{
                    position: "absolute",
                    fontFamily: "'Jersey 20', sans-serif",
                    fontSize: fontSize,
                    fontWeight: 400,
                    lineHeight: lineHeight,
                    letterSpacing: "-0.48px",
                    color: "#FFFFFF",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%) translate(0px, 1px)",
                    width: "160px",
                    textAlign: "center",
                    zIndex: 2,
                    userSelect: "none",
                    WebkitFontSmoothing: "none",
                    textRendering: "optimizeSpeed",
                }}
            >
                {buttonText}
            </span>

            {/* Pink/Purple text (main text) */}
            <span
                style={{
                    position: "absolute",
                    fontFamily: "'Jersey 20', sans-serif",
                    fontSize: fontSize,
                    fontWeight: 400,
                    lineHeight: lineHeight,
                    letterSpacing: "-0.48px",
                    color: textColor,
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "160px",
                    textAlign: "center",
                    zIndex: 3,
                    userSelect: "none",
                    WebkitFontSmoothing: "none",
                    textRendering: "optimizeSpeed",
                }}
            >
                {buttonText}
            </span>
        </button>
    );
}

