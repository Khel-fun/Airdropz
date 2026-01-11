import React, { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { EventBus } from "../../game/EventBus";
import HomeGameplayManager from "../../blockchain/HomeGameplayManager.sol/HomeGameplayManager.json";
import { config } from "../../config/config";
import {
    readContract,
    waitForTransactionReceipt,
    writeContract,
} from "@wagmi/core";
import { toast } from "react-toastify";
import {
    trackEvent,
    trackGameScore,
    trackTransaction,
} from "../../utils/analytics";
import useTelegramClient from "../../hooks/telegram-client";

const { abi } = HomeGameplayManager;

interface PlayerState {
    points: bigint;
    gems: bigint;
    lives: bigint;
    characterIds: bigint[];
    lastReset: bigint;
}

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

const GameScoreManager: React.FC = () => {
    const { address } = useAccount();
    const [playerState, setPlayerState] = useState<PlayerState | null>(null);
    const { isTelegram } = useTelegramClient();
    
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

    useEffect(() => {
        const handleScoreUpdate = async (data: { score: number }) => {
            if (!address || data.score <= 0) return;

            // Track the game score in analytics
            trackGameScore(data.score);

            try {
                toast.info("Opening MetaMask to update score...");

                // Track that we're initiating a transaction
                trackEvent("Update Score Transaction Started", {
                    score: data.score,
                });

                const hash = await writeContract(config, {
                    address: import.meta.env.VITE_CONTRACT_ADDRESS,
                    abi: abi,
                    functionName: "updatePoints",
                    args: [address, BigInt(data.score)],
                });
                const pendingToastId = toast.loading(
                    "Updating points... Please wait for confirmation.",
                );

                try {
                    // Wait for transaction to be mined
                    const receipt = await waitForTransactionReceipt(config, {
                        hash,
                    });

                    // Check if transaction was successful
                    if (receipt.status === "success") {
                        toast.dismiss(pendingToastId);

                        toast.success("Scores updated successfully!");
                    } else {
                        toast.dismiss(pendingToastId);
                        toast.error(
                            "Failed to update score. Transaction reverted.",
                        );
                    }
                } catch (receiptError: any) {
                    toast.dismiss(pendingToastId);

                    // Extract blockchain error message using improved function
                    const revertReason = extractRevertReason(receiptError);

                    toast.error(`Failed to update score: ${revertReason}`);
                    console.error("Transaction receipt error:", receiptError);
                }
                console.log("Score updated on blockchain:", data.score);
                // Track successful transaction
                trackTransaction(hash, "update_points", "success");

                if (playerState && playerState.lives <= 0) {
                    setTimeout(() => {
                        // Add a small delay to allow the game over scene to show first
                        EventBus.emit("return-to-menu");
                    }, 3000);
                }
            } catch (error) {
                // Track failed transaction
                trackEvent("Transaction Failed", {
                    function: "updatePoints",
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                console.error("Error updating score:", error);
            }
        };

        // Listen for score update events
        EventBus.on("update-score", handleScoreUpdate);

        // Cleanup listener
        // return () => {
        //     EventBus.off("update-score", handleScoreUpdate);
        // };
    }, [address, writeContract, playerState]);

    return null;
};

export default GameScoreManager;

