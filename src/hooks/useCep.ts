import { useState, useCallback } from 'react';

export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface UseCepResult {
  loading: boolean;
  error: string | null;
  fetchCep: (cep: string) => Promise<CepData | null>;
}

/**
 * Hook para buscar dados de endereço pela API ViaCEP
 *
 * @example
 * ```tsx
 * const { loading, error, fetchCep } = useCep();
 *
 * const handleCepChange = async (cep: string) => {
 *   const data = await fetchCep(cep);
 *   if (data) {
 *     setStreet(data.logradouro);
 *     setCity(data.localidade);
 *     setState(data.uf);
 *     setNeighborhood(data.bairro);
 *   }
 * };
 * ```
 */
export function useCep(): UseCepResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCep = useCallback(async (cep: string): Promise<CepData | null> => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');

    // Valida se o CEP tem 8 dígitos
    if (cleanCep.length !== 8) {
      setError('CEP deve conter 8 dígitos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data: CepData = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return null;
      }

      return data;
    } catch (err) {
      // Log error details for debugging
      console.error('Erro ao buscar CEP:', err);

      // Always show user-friendly Portuguese message
      setError('Erro ao buscar CEP');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchCep };
}
