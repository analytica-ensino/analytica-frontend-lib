import { action } from '@ladle/react';
import { ThemeToggle } from './ThemeToggle';

export const Default = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>
          Variante Padrão (salva automaticamente)
        </h3>
        <ThemeToggle />
      </div>
    </div>
  );
};

export const WithSave = () => {
  const handleSave = (theme: 'light' | 'dark' | 'system') => {
    console.log('Tema salvo:', theme);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>Variante com Botão Salvar</h3>
        <ThemeToggle variant="with-save" onToggle={handleSave} />
      </div>
    </div>
  );
};

export const AllVariants = () => {
  const handleSave = action('onToggle');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>
          Variante Padrão (salva automaticamente)
        </h3>
        <ThemeToggle />
      </div>
      <div>
        <h3 style={{ marginBottom: 16 }}>Variante com Botão Salvar</h3>
        <ThemeToggle variant="with-save" onToggle={handleSave} />
      </div>
    </div>
  );
};
