export interface AdConfig {
  /** true = real AdSense ads render karo (live), false = placeholder box */
  enabled: boolean;
  /** false = real ads hain, placeholder box bilkul mat dikhao (AdSense policy) */
  showPlaceholders: boolean;
  /** Apna Google AdSense publisher ID — https://www.google.com/adsense/ me milta hai */
  client: string;
  /** Har ad slot ka AdSense "Ad unit" ID (AdSense → Ads → By ad unit → get code me se data-ad-slot) */
  slots: Record<'leaderboard' | 'sidebar' | 'native' | 'footer', string>;
}

export const AD_CONFIG: AdConfig = {
  enabled: false,
  showPlaceholders: false,
  client: 'ca-pub-XXXXXXXXXXXXXXXX',
  slots: {
    leaderboard: '0000000000000',
    sidebar:     '0000000000000',
    native:      '0000000000000',
    footer:      '0000000000000',
  },
};
