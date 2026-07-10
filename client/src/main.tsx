import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './features/auth/AuthContext';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </FluentProvider>
  </React.StrictMode>
);
