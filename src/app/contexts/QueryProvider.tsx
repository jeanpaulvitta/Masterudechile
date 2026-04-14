import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Configurar QueryClient con estrategias de caché agresivas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mantener datos en caché por 30 minutos (reducir consultas)
      gcTime: 1000 * 60 * 30,
      // Datos frescos por 5 minutos (no revalidar innecesariamente)
      staleTime: 1000 * 60 * 5,
      // No refetch automático al hacer focus en la ventana
      refetchOnWindowFocus: false,
      // No refetch automático al reconectar
      refetchOnReconnect: false,
      // Reintentos solo 1 vez (reducir tráfico en errores)
      retry: 1,
      // Tiempo de espera antes de reintentar
      retryDelay: 1000,
    },
    mutations: {
      // Reintentar mutaciones 1 vez
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
