import { supportSchema, SupportFormData } from './index';

describe('supportSchema', () => {
  it('deve exportar o schema de suporte', () => {
    expect(supportSchema).toBeDefined();
  });

  it('deve ter a estrutura correta', () => {
    expect(supportSchema).toHaveProperty('shape');
  });

  describe('Validação de campos', () => {
    it('deve validar problemType válido', () => {
      const result = supportSchema.safeParse({
        problemType: 'tecnico',
        title: 'Título válido',
        description: 'Descrição válida com mais de 10 caracteres',
      });
      expect(result.success).toBe(true);
    });

    it('deve aceitar todos os tipos de problema válidos', () => {
      const tipos = ['tecnico', 'acesso', 'outros'];

      tipos.forEach((tipo) => {
        const result = supportSchema.safeParse({
          problemType: tipo,
          title: 'Título válido',
          description: 'Descrição válida com mais de 10 caracteres',
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Tipagem', () => {
    it('SupportFormData deve ter os campos corretos', () => {
      const formData: SupportFormData = {
        problemType: 'tecnico',
        title: 'Título',
        description: 'Descrição',
      };

      expect(formData.problemType).toBe('tecnico');
      expect(formData.title).toBe('Título');
      expect(formData.description).toBe('Descrição');
    });
  });
});
