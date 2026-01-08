/// <reference types="vite/client" />
/// <reference types="react-toastify" />

interface ImportMetaEnv {
    readonly VITE_CLIENT_ID: string;
    readonly VITE_SECRET_KEY: string;
    readonly VITE_WALLET_CONNECT_PROJECT_ID: string;
    readonly VITE_CONTRACT_ADDRESS: string;
    readonly VITE_AMPLITUDE_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}