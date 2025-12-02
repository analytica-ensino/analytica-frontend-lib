import { z } from 'zod';

// Schema de validação para o formulário de suporte
export const supportSchema = z.object({
  // Tipo de problema selecionado
  problemType: z.enum(['tecnico', 'acesso', 'outros'], {
    // istanbul ignore next - errorMap é testado em runtime pelo zod real
    errorMap: /* istanbul ignore next */ () => ({
      message:
        'Campo obrigatório! Por favor, preencha este campo para continuar.',
    }),
  }),

  // Título do problema
  title: z
    .string()
    .min(1, 'Campo obrigatório! Por favor, preencha este campo para continuar.')
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres')
    .trim(),

  // Descrição do problema
  description: z
    .string()
    .min(1, 'Campo obrigatório! Por favor, preencha este campo para continuar.')
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .trim(),
});

// Type inferido do schema
export type SupportFormData = z.infer<typeof supportSchema>;
