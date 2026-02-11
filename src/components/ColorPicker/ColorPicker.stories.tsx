import type { Story } from '@ladle/react';
import { useState } from 'react';
import ColorPicker from './ColorPicker';

/**
 * Showcase principal: todas as variações do ColorPicker
 */
export const AllColorPickers: Story = () => {
  const [color1, setColor1] = useState('#3B82F6');
  const [color2, setColor2] = useState('#EF4444');
  const [color3, setColor3] = useState('#10B981');
  const [color4, setColor4] = useState('#F59E0B');

  return (
    <div className="flex flex-col gap-8 max-w-md p-4">
      <h2 className="font-bold text-3xl text-text-900">ColorPicker</h2>
      <p className="text-text-700">
        Componente para seleção de cores com input nativo e campo de texto para
        entrada manual de valores hexadecimais.
      </p>

      {/* Estado padrão */}
      <div>
        <h3 className="font-bold text-xl text-text-900 mb-4">Estado Padrão</h3>
        <ColorPicker
          label="Cor"
          value={color1}
          onChange={(e) => setColor1(e.target.value)}
          helperText="Selecione uma cor para representar o componente curricular"
        />
      </div>

      {/* Com erro */}
      <div>
        <h3 className="font-bold text-xl text-text-900 mb-4">Com Erro</h3>
        <ColorPicker
          label="Cor"
          value={color2}
          onChange={(e) => setColor2(e.target.value)}
          errorMessage="Formato de cor inválido"
        />
      </div>

      {/* Desabilitado */}
      <div>
        <h3 className="font-bold text-xl text-text-900 mb-4">Desabilitado</h3>
        <ColorPicker
          label="Cor"
          value={color3}
          onChange={(e) => setColor3(e.target.value)}
          helperText="Este campo está desabilitado"
          disabled
        />
      </div>

      {/* Obrigatório */}
      <div>
        <h3 className="font-bold text-xl text-text-900 mb-4">Obrigatório</h3>
        <ColorPicker
          label="Cor"
          value={color4}
          onChange={(e) => setColor4(e.target.value)}
          helperText="Este campo é obrigatório"
          required
        />
      </div>
    </div>
  );
};

export const Default: Story = () => {
  const [color, setColor] = useState('#3B82F6');

  return (
    <div className="max-w-md p-4">
      <ColorPicker
        label="Cor"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        helperText="Selecione uma cor para representar o componente curricular"
      />
    </div>
  );
};

export const WithError: Story = () => {
  const [color, setColor] = useState('#FF0000');

  return (
    <div className="max-w-md p-4">
      <ColorPicker
        label="Cor"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        errorMessage="Formato de cor inválido"
      />
    </div>
  );
};

export const Disabled: Story = () => (
  <div className="max-w-md p-4">
    <ColorPicker
      label="Cor"
      value="#10B981"
      helperText="Este campo está desabilitado"
      disabled
    />
  </div>
);

export const Required: Story = () => {
  const [color, setColor] = useState('#F59E0B');

  return (
    <div className="max-w-md p-4">
      <ColorPicker
        label="Cor"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        helperText="Este campo é obrigatório"
        required
      />
    </div>
  );
};

export const WithoutLabel: Story = () => {
  const [color, setColor] = useState('#8B5CF6');

  return (
    <div className="max-w-md p-4">
      <ColorPicker
        value={color}
        onChange={(e) => setColor(e.target.value)}
        placeholder="#FFFFFF"
      />
    </div>
  );
};
