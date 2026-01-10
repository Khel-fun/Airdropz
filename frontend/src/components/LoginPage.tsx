import React from "react";
// import { ConnectButton } from "thirdweb/react";
import { useWalletContext } from "../context/WalletContext";
// import { client } from "../config/client";
// import { sapphireTestnet } from "viem/chains";
import { ConnectWallet } from "./wallet/connect-wallet";
import useTelegramClient from "../hooks/telegram-client";

const LoginPage: React.FC = () => {
    const { setIsLoggedIn } = useWalletContext();
    const { isTelegram } = useTelegramClient();

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    return (
        <div
            className="flex flex-col items-center justify-end h-screen bg-cover bg-no-repeat"
            style={{
                backgroundImage: "url('/assets/login_bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100vw",
                height: "100vh",
            }}
        >
            {/* <ConnectButton
                client={client}
                onConnect={handleLogin}
                accountAbstraction={{
                    chain: sapphireTestnet, // the chain where your smart accounts will be or is deployed
                    sponsorGas: true, // enable or disable sponsored transactions
                }}
            /> */}

            <div className="mb-32">
                <ConnectWallet />
            </div>
        </div>
    );
};

export default LoginPage;

