import * as amplitude from '@amplitude/analytics-browser';

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY || 'default-key';

export const initAnalytics = () => {
  amplitude.init(AMPLITUDE_API_KEY, {
    defaultTracking: {
      sessions: true,
      pageViews: true,
      formInteractions: true,
      fileDownloads: true
    }
  });
  console.log('Amplitude Analytics initialized');
};

export const trackEvent = (eventName: string, eventProperties?: Record<string, any>) => {
  amplitude.track(eventName, eventProperties);
};

export const trackPageView = (pageName: string, pageProperties?: Record<string, any>) => {
  amplitude.track('Page Viewed', {
    page_name: pageName,
    ...pageProperties
  });
};

export const setUserProfile = (userId: string, userProperties?: Record<string, any>) => {
  amplitude.setUserId(userId);
  
  if (userProperties) {
    const identifyObj = new amplitude.Identify();
    
    Object.entries(userProperties).forEach(([key, value]) => {
      identifyObj.set(key, value);
    });
    
    amplitude.identify(identifyObj);
  }
};

export const trackGameScore = (score: number, gameMode?: string) => {
  amplitude.track('Game Completed', {
    score,
    game_mode: gameMode || 'standard'
  });
};

export const trackWalletConnected = (walletAddress: string, walletType: string) => {
  amplitude.track('Wallet Connected', {
    wallet_address: walletAddress,
    wallet_type: walletType
  });
};

export const trackTransaction = (txHash: string, txType: string, status: string) => {
  amplitude.track('Blockchain Transaction', {
    transaction_hash: txHash,
    transaction_type: txType,
    status
  });
};