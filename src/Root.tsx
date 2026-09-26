import React from 'react';
import { App, AppRoute, PageData } from './App';
import { ToastProvider } from './components/Toast';

/** The island every page hydrates: the app shell rendered for one route. */
export const Root: React.FC<{ path: string; route: AppRoute; data?: PageData; children?: React.ReactNode }> = props => (
  <React.StrictMode>
    <ToastProvider>
      <App {...props} />
    </ToastProvider>
  </React.StrictMode>
);

export default Root;
