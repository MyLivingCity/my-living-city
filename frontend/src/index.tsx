import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Import Bootstrap scss with custom theme
import './scss/styles.scss';

// React query state
import { QueryClientProvider } from 'react-query';
import UserProfileProvider from './contexts/UserProfile.Context';
import { queryClient } from './lib/react-query/clientInitializer';

ReactDOM.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <UserProfileProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </UserProfileProvider>
        </QueryClientProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
