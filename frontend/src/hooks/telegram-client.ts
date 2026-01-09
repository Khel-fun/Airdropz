import { useEffect, useState } from "react";
import { initUtils } from "@telegram-apps/sdk";

/**
 * Checks if the application is running in a Telegram environment
 */
export const isTelegramEnvironment = async (): Promise<boolean> => {
    try {
        if (
            typeof window !== "undefined" &&
            window.Telegram &&
            window.Telegram.WebApp
        ) {
            return true;
        }

        if (
            typeof window !== "undefined" &&
            "TelegramWebviewProxy" in window &&
            typeof window.TelegramWebviewProxy?.postEvent === "function"
        ) {
            window.TelegramGameProxy = { receiveEvent() {} };
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error detecting Telegram environment", error);
        return false;
    }
};

/**
 * React hook to initialize Telegram environment and handle window.open overrides
 */
export const useTelegramClient = () => {
    const [isTelegram, setIsTelegram] = useState<boolean | null>(null);

    useEffect(() => {
        const init = async () => {
            const isTG = await isTelegramEnvironment();
            setIsTelegram(isTG);

            if (!isTG) {
                return;
            }

            const utils = initUtils(); // Initialize the Telegram SDK utility class

            // Override window.open
            const originalOpen = window.open;
            window.open = (url, target?, features?) => {
                console.log(`Try to openLink ${url}`);
                try {
                    if (!url) {
                        return null;
                    }

                    let urlString: string;
                    if (typeof url !== "string") {
                        urlString = url.toString();
                    } else {
                        urlString = url;
                    }

                    if (urlString.startsWith("metamask://")) {
                        urlString = urlString.replace(
                            "metamask://",
                            "https://metamask.app.link/",
                        );
                    }

                    console.log(`Opening ${urlString}`);
                    utils.openLink(urlString); // Use Telegram's SDK utility for links
                } catch (error) {
                    console.error(`Failed to openLink ${url}`, error);

                    // Fallback to original window.open
                    try {
                        return originalOpen?.(url, target, features);
                    } catch (e) {
                        console.error("Original window.open also failed", e);
                    }
                }

                return null;
            };
        };

        init();

        return () => {
            // Restore original window.open when component unmounts
            // This might not work well if multiple components use this hook simultaneously
            // Better to only use this hook in a high-level component
        };
    }, []);

    return { isTelegram };
};

export default useTelegramClient;
