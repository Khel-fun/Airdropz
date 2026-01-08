// Type definitions for Telegram WebApp and related interfaces

interface TelegramWebApp {
  WebApp: {
    initData: string;
    initDataUnsafe: any;
    MainButton: any;
    BackButton: any;
    // Add other WebApp properties as needed
    ready(): void;
    expand(): void;
    close(): void;
    openLink(url: string): void;
  };
}

interface TelegramWebviewProxy {
  postEvent(eventName: string, eventData: any): void;
}

interface TelegramGameProxy {
  receiveEvent(eventName: string, eventData: any): void;
}

// Extend the global Window interface
declare global {
  interface Window {
    Telegram?: TelegramWebApp;
    TelegramWebviewProxy?: TelegramWebviewProxy;
    TelegramGameProxy?: TelegramGameProxy;
    ethereum?: any; 
  }
}

export {};