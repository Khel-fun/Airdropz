import { http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { createWeb3Modal } from "@web3modal/wagmi/react";

export const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

export const config = defaultWagmiConfig({
    chains: [baseSepolia],
    projectId,
    transports: {
        [baseSepolia.id]: http(),
    },
    metadata: {
        name: "Airdropz Game",
        description: "Airdropz Game on Farcaster",
        url: "https://your-domain.com", // Update with your production domain
        icons: ["https://your-domain.com/favicon.ico"],
    },
});

createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: false,
    themeMode: "light",
    enableOnramp: false,
    defaultChain: baseSepolia,
});

