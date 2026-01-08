import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThirdwebProvider } from "thirdweb/react";
import { WalletProvider } from "./context/WalletContext";
import { config } from "./config/config";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sdk } from "@farcaster/miniapp-sdk";

const queryClient = new QueryClient();

// Call ready() as early as possible to hide Farcaster splash screen
sdk.actions.ready().catch(() => {
    // SDK not available - running in standalone mode
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ThirdwebProvider>
                    <WalletProvider>
                        <App />
                    </WalletProvider>
                </ThirdwebProvider>
            </QueryClientProvider>
        </WagmiProvider>
    </React.StrictMode>,
);

