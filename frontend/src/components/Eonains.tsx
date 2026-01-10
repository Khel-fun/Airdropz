import React, { useEffect, useRef, useState } from "react";
import Button from "./buttons/button";
import { useWriteContract, useAccount } from "wagmi";
import HomeGameplayManager from "../blockchain/HomeGameplayManager.sol/HomeGameplayManager.json";
import MarketplaceHost from "../blockchain/MarketplaceHost.sol/MarketplaceHost.json";
import { readContract, writeContract } from "@wagmi/core";
import { config } from "../config/config";
import { toast } from "react-toastify";
// Import the analytics tracking functions
import { trackEvent, trackTransaction } from "../utils/analytics";
import ButtonGreenBig from "./buttons/button_green_big";
import ButtonSmall from "./buttons/button_small";
import useTelegramClient from "../hooks/telegram-client";
import ButtonBig from "./buttons/button_big";

const { abi: gameplayManagerAbi } = HomeGameplayManager;
const { abi: marketplaceHostAbi } = MarketplaceHost;

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

interface PlayerState {
    points: bigint;
    gems: bigint;
    lives: bigint;
    characterIds: bigint[];
    lastReset: bigint;
}

interface Character {
    name: string;
    image: string;
    ipfsCid: string;
    characterId: number;
}

const characters: Character[] = [
    {
        name: "HERB GATHERER",
        image: "/assets/char-herb-gatherer.png",
        ipfsCid: "bafkreidlawwo4nvkse3phcpuhosjliiekvf7k4gwbswqr2w3zzxq5z2dc4",
        characterId: 1,
    },
    {
        name: "WOOD SPRITE",
        image: "/assets/char-wood-sprite.png",
        ipfsCid: "bafkreifqdi6wpz2wle45oetcuby2kwwwz27a7qgq5cqtnorzo5vgrorpj4",
        characterId: 2,
    },
    {
        name: "BRONZE BUILDER",
        image: "/assets/char-bronze-builder.png",
        ipfsCid: "bafkreibp5rffruxhjsbv2tdyohg4zdtynyttoj6pmrt7i4u4zpi756hchy",
        characterId: 3,
    },
    {
        name: "GARDEN DRYAD",
        image: "/assets/char-garden-dryad.png",
        ipfsCid: "bafkreih6rr64y5vnfjv5y67jfvcaibhuco3rerhstiy6jmdxc6lm4sdyee",
        characterId: 4,
    },
    {
        name: "GOLDEN GRIFFON",
        image: "/assets/char-golden-griffon.png",
        ipfsCid: "bafkreihc7ws6xdjfwwth6hpag7lmopouah2psqtkab2bsiakiia4uvteae",
        characterId: 5,
    },
    {
        name: "WATER NYMPH",
        image: "/assets/char-water-nymph.png",
        ipfsCid: "bafkreibk2sfivvpucttegm4opeg4fhhn7bstsdobnfj3sk7a7oqogwforq",
        characterId: 6,
    },
    {
        name: "ARCHITECT TURTLE",
        image: "/assets/char-architect-turtle.png",
        ipfsCid: "bafkreiah55jzw73wia73rhjafolnsucdkre4frctmf5dvneoam7cwlrbpe",
        characterId: 7,
    },
    {
        name: "MYSTIC DRAGON",
        image: "/assets/char-mystic-dragon.png",
        ipfsCid: "bafkreigfmaw64wquahd564xknptjo2rou7bmhxnpvskpjoplsns4orjlgq",
        characterId: 8,
    },
    {
        name: "DIVINE GOLEM",
        image: "/assets/char-divine-golem.png",
        ipfsCid: "bafkreihmpvaoc3nl7q5gxt4xtq3nyqfll3rxvlpm6vvxqcwex5sfahee2e",
        characterId: 9,
    },
];

const Eonians: React.FC<{ navigateToScene: (scene: string) => void }> = ({
    navigateToScene,
}) => {
    const { address } = useAccount();
    const [minting, setMinting] = useState<{ [key: string]: boolean }>({});
    const [playerState, setPlayerState] = useState<PlayerState | null>(null);
    const { isTelegram } = useTelegramClient();

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

    React.useEffect(() => {
        fetchPlayerState();

        // Track page view on component mount
        trackEvent("Eonians Page Viewed");
    }, []);

    React.useEffect(() => {
        if (address) {
            fetchPlayerState();

            // Track when a user views their collection with a wallet connected
            trackEvent("Eonians Collection Viewed", {
                wallet_connected: !!address,
            });
        }
    }, [address]);

    // Fetch player state
    const fetchPlayerState = async () => {
        if (!address) return;
        try {
            const state = await readContract(config, {
                address: import.meta.env.VITE_CONTRACT_ADDRESS,
                abi: gameplayManagerAbi,
                functionName: "getPlayerState",
                args: [address!],
            });
            setPlayerState(state as PlayerState);

            // Track owned characters count
            if (state) {
                const ownedCount = (state as PlayerState).characterIds.length;
                trackEvent("Characters Collection Status", {
                    characters_owned: ownedCount,
                    total_characters: characters.length,
                    completion_percentage: Math.round(
                        (ownedCount / characters.length) * 100,
                    ),
                });
            }
        } catch (error) {
            console.error("Error fetching player state:", error);
            trackEvent("Player State Fetch Failed", {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    };

    const isCharacterOwned = (characterIndex: number) => {
        if (!playerState?.characterIds) return false;
        return playerState.characterIds.length > characterIndex;
    };

    const handleMint = async (character: Character) => {
        if (!address) {
            toast.error("Please connect your wallet first");
            return;
        }

        // Track mint attempt
        trackEvent("Character Mint Started", {
            character_name: character.name,
            character_id: character.characterId,
        });

        setMinting({ ...minting, [character.name]: true });

        try {
            // Initial toast notification
            toast.info(`Initiating purchase for ${character.name}...`);

            // SGN fee of 0.001 BNB (in wei)
            const SGN_FEE = BigInt("1000000000000000"); // 0.001 BNB

            // Prepare transaction - using initiatePurchase from MarketplaceHost
            const hash = await writeContract(config, {
                address: import.meta.env.VITE_MARKETPLACE_HOST_ADDRESS,
                abi: marketplaceHostAbi,
                functionName: "initiatePurchase",
                args: [
                    BigInt(character.characterId),
                    BigInt(0), // pointsRequired - set to 0 for now
                    BigInt(0), // gemsRequired - set to 0 for now
                ],
                value: SGN_FEE, // Pay the SGN fee with the transaction
            });

            // Track transaction initiated
            trackTransaction(hash, "initiate_character_purchase", "pending");

            // Show success message with longer processing time info
            toast.success(
                `Purchase initiated for ${character.name}! Your Eonian will be credited to your wallet in 5-10 minutes. Please check back later.`,
                {
                    autoClose: 8000, // Show for 8 seconds
                },
            );

            // Track successful purchase initiation
            trackEvent("Character Purchase Initiated", {
                character_name: character.name,
                character_id: character.characterId,
                transaction_hash: hash,
            });

            // Note: We don't wait for transaction receipt here since it's handled off-chain
            // The user will see their Eonian in 5-10 minutes
        } catch (error: any) {
            const revertReason = extractRevertReason(error);

            toast.error(
                `Failed to initiate purchase for ${character.name}: ${revertReason}`,
            );
            console.error(
                `Error initiating purchase for ${character.name}:`,
                error,
            );

            // Track transaction error
            trackEvent("Character Purchase Failed", {
                character_name: character.name,
                character_id: character.characterId,
                error_type: "transaction_error",
                error_message: revertReason,
            });
        } finally {
            setMinting({ ...minting, [character.name]: false });
        }
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

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen bg-cover bg-no-repeat w-screen"
            style={{
                backgroundImage: "url('/assets/main-menu.png')",
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
                className="relative p-4 sm:p-6 w-[92%] max-w-md bg-contain bg-no-repeat bg-center overflow-visible"
                style={{
                    backgroundImage: "url('/assets/popup.png')",
                    height: "80dvh",
                    backgroundSize: "100% 100%",
                    marginTop: "env(safe-area-inset-top)",
                    marginBottom: "env(safe-area-inset-bottom)",
                }}
                onClick={handlePopupClick}
            >
                <h1 className="text-base sm:text-lg font-bold text-center mb-2 mt-[10vh] sm:mt-[8vh]">
                    EONIANS
                </h1>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 px-2">
                    {characters.map((character, index) => (
                        <div
                            key={character.name}
                            className="rounded-lg flex flex-col items-center"
                        >
                            <p className="font-semibold text-[10px] sm:text-xs text-center whitespace-nowrap">
                                {character.name}
                            </p>
                            <img
                                src={character.image}
                                alt={character.name}
                                className="w-14 h-18 sm:w-12 sm:h-16 object-contain my-1"
                                onClick={() => {
                                    trackEvent("Character Viewed", {
                                        character_name: character.name,
                                        character_id: character.characterId,
                                        is_owned: isCharacterOwned(index),
                                    });
                                }}
                            />
                            {isCharacterOwned(index) ? (
                                <ButtonGreenBig
                                    disabled
                                    style={{ maxWidth: "80px" }}
                                    className="text-xs"
                                >
                                    OWNED
                                </ButtonGreenBig>
                            ) : (
                                <ButtonBig
                                    onClick={() => handleMint(character)}
                                    disabled={minting[character.name]}
                                    style={{ maxWidth: "80px" }}
                                    className="text-xs"
                                >
                                    {minting[character.name]
                                        ? "MINTING..."
                                        : "CLAIM"}
                                </ButtonBig>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Icons */}
            <div className="fixed bottom-0 w-full px-4 pb-safe">
                <div className="flex justify-around w-full max-w-[400px] mx-auto mb-4">
                    {[
                        // {
                        //     src: "Market",
                        //     onClick: () => console.log("Market clicked"),
                        // },
                        {
                            src: "../tabs-colored/Eonian",
                            onClick: () => handleNavigate("eonians"),
                        },
                        {
                            src: "Tasks",
                            onClick: () => handleNavigate("tasks"),
                        },
                        {
                            src: "Alchemist",
                            onClick: () => handleNavigate("profile"),
                        },
                    ].map((item) => (
                        <div
                            key={item.src}
                            className="flex flex-col items-center cursor-pointer"
                            onClick={item.onClick}
                        >
                            <img
                                src={`/assets/tabs-uncolored/${item.src}.png`}
                                alt={item.src}
                                className="w-[20vw] max-w-[80px] min-w-[50px] h-auto object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Eonians;

