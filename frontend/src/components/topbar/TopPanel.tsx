import React, { FunctionComponent, useEffect } from "react";
import { useAccount } from "wagmi";
import { config } from "../../config/config";
import { readContract } from "@wagmi/core";
import HomeGameplayManager from "../../blockchain/HomeGameplayManager.sol/HomeGameplayManager.json";
import { EventBus } from "../../game/EventBus";

const { abi } = HomeGameplayManager;

const TopPanel: FunctionComponent = () => {
    const { address } = useAccount();
    const [playerState, setPlayerState] = React.useState<any>(null);

    useEffect(() => {
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

        // Fetch when component mounts
        fetchPlayerState();

        // Listen for the "update-score" event to update player state
        EventBus.on("update-score", fetchPlayerState);

        // return () => {
        //     EventBus.off("update-score", fetchPlayerState);
        // };
    }, [address, playerState]);

    return (
        <div className="fixed top-0 left-0 w-full h-10 z-50 overflow-hidden">
            {/* Panel background */}
            <img
                className="absolute top-0 left-0 w-full h-full object-cover"
                alt="Top panel background"
                src="assets/topbar/top-panel@2x.png"
            />
            {/* Left side - Gems and Points */}
            <div className="absolute top-0 left-4 h-full flex items-center space-x-2">
                {/* Gems */}
                <div className="relative">
                    <img
                        className="w-20 h-8"
                        alt="Gem badge"
                        src="assets/topbar/shape-43-1.svg"
                    />
                    <div className="absolute inset-0 flex items-center">
                        <img
                            className="h-5 w-5 ml-1"
                            alt="Gem icon"
                            src="assets/topbar/nftbien-a-classical-shiny-gem-icon-mobile-game-ui-soft-colors-130127895f1e4520ba50595528414266-2-1@2x.png"
                        />
                        <span className="text-white text-sm font-bold ml-1 pt-1">
                            {playerState?.gems.toString()}
                        </span>
                    </div>
                </div>

                {/* Points */}
                <div className="relative">
                    <img
                        className="w-20 h-8"
                        alt="Points badge"
                        src="assets/topbar/shape-43-1.svg"
                    />
                    <div className="absolute inset-0 flex items-center">
                        <img
                            className="h-5 w-5 ml-1"
                            alt="Star icon"
                            src="assets/topbar/star@2x.png"
                        />
                        <span className="text-white text-sm font-bold ml-1 pt-1">
                            {playerState?.points.toString()}
                        </span>
                    </div>
                </div>

                {/* Lives */}
                <div className="relative">
                    <img
                        className="w-20 h-8"
                        alt="Lives badge"
                        src="assets/topbar/shape-43-1.svg"
                    />
                    <div className="absolute inset-0 flex items-center">
                        <img
                            className="h-5 w-5 ml-1"
                            alt="Lives icon"
                            src="assets/topbar/hearts.png"
                        />
                        <span className="text-white text-sm font-bold ml-1 pt-1">
                            {playerState?.lives.toString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right side - Trophies and Settings */}
            <div className="absolute top-0 right-4 h-full flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <div className="relative w-10 h-10">
                        <img
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6"
                            alt="Chest icon"
                            src="assets/topbar/slice40-40@2x.png"
                        />
                    </div>
                    <div className="relative w-7 h-7">
                        <img
                            className="w-full h-full"
                            alt="Chest frame"
                            src="assets/topbar/chest-frame@2x.png"
                        />
                        <img
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6"
                            alt="Chest icon"
                            src="assets/topbar/slice09-09@2x.png"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopPanel;

