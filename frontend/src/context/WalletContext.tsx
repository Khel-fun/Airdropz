import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { trackWalletConnected } from '../utils/analytics';

interface WalletContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (loggedIn: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isConnected } = useAccount();
    const [isLoggedIn, setIsLoggedIn] = useState(isConnected);
    const { address, connector } = useAccount();

    useEffect(() => {
        setIsLoggedIn(isConnected);
        if (isLoggedIn && address) {
            // Track the wallet connection event with wallet type
            trackWalletConnected(
                address, 
                connector?.name || 'unknown'
            );
        }
    }, [isConnected]);

    return (
        <WalletContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWalletContext = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWalletContext must be used within a WalletProvider');
    }
    return context;
}; 