import { QueryCache, QueryClient } from 'react-query';

const SECOND = 1000;

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: SECOND * 60 * 30,
        }
    }
});

export const queryCache = new QueryCache({
    onError: error => {
        console.log(error);
    }
}); 