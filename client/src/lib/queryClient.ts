import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Função aprimorada para lançar erro com mais detalhes, incluindo JSON da resposta se disponível
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorDetail: any;
    try {
      // Tenta parsear a resposta como JSON para obter detalhes do erro do servidor
      errorDetail = await res.json();
    } catch (e) {
      // Se não for JSON, usa o texto puro ou o statusText
      errorDetail = (await res.text()) || res.statusText;
    }
    // Lança um erro que inclui o status e os detalhes (JSON ou texto)
    const errorToThrow = new Error(`${res.status}: ${JSON.stringify(errorDetail)}`);
    // Opcional: Anexar os detalhes do erro à propriedade 'response' do erro para melhor tratamento no frontend
    (errorToThrow as any).response = { status: res.status, data: errorDetail };
    throw errorToThrow;
  }
}

export async function apiRequest(method: string, url: string, data?: any) {
  console.log(`Making ${method} request to ${url} with data:`, data); // Novo log
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`API Error (${response.status}) for ${url}:`, errorData); // Novo log
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log(`API Success (${response.status}) for ${url}:`, responseData); // Novo log
    return responseData;
  } catch (error) {
    console.error(`Error in apiRequest for ${url}:`, error); // Novo log
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    // Se o comportamento for 'returnNull' para 401 e o status for 401, retorna null
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res); // Usa a função aprimorada para validação e lançamento de erro
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity, // Os dados nunca ficam "stale" automaticamente
      retry: false, // Não tentar requisições falhas automaticamente
    },
    mutations: {
      retry: false, // Não tentar mutações falhas automaticamente
    },
  },
});