import type { Story } from '@ladle/react';
import { useState } from 'react';
import Select, {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './Select';

const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
const variants = ['outlined', 'underlined', 'rounded'] as const;

/**
 * Showcase principal: todas as combinações possíveis do Select
 */
export const AllSelects: Story = () => {
  const items = [
    { value: 'item1', label: 'Item 1' },
    { value: 'item2', label: 'Item 2' },
    { value: 'item3', label: 'Item 3' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Select</h2>
      <p className="text-text-700">
        Variações possíveis do componente <code>Select</code> com suporte a
        label, helper text e error message:
      </p>

      {/* Demonstração de Label, Helper Text e Error Message */}
      <h3 className="font-bold text-2xl text-text-900">Com Label e Textos</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-medium text-lg text-text-900 mb-4">Com Label</h4>
          <Select label="Categoria" size="medium" defaultValue="item1">
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h4 className="font-medium text-lg text-text-900 mb-4">
            Com Helper Text
          </h4>
          <Select
            label="Status do Projeto"
            helperText="Escolha o status atual do projeto"
            size="medium"
            defaultValue="item2"
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h4 className="font-medium text-lg text-text-900 mb-4">
            Com Error Message
          </h4>
          <Select
            label="Prioridade"
            errorMessage="Este campo é obrigatório"
            size="medium"
          >
            <SelectTrigger invalid>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tamanhos + variantes */}
      <h3 className="font-bold text-2xl text-text-900">Tamanhos e Variantes</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sizes.map((size) => (
          <div key={size}>
            <div className="font-medium text-text-900 mb-2">{size}</div>
            <div className="flex flex-row gap-4 flex-wrap">
              {variants.map((variant) => (
                <div key={variant} className="flex flex-col gap-2">
                  <span className="text-sm text-text-600">{variant}</span>

                  {/* Normal */}
                  <Select size={size} defaultValue={items[0].value}>
                    <SelectTrigger variant={variant}>
                      <SelectValue placeholder={`Select ${variant}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Invalid */}
                  <Select size={size} defaultValue={items[0].value}>
                    <SelectTrigger variant={variant} invalid>
                      <SelectValue
                        placeholder={`Select ${variant} (invalid)`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Disabled */}
                  <Select size={size}>
                    <SelectTrigger variant={variant} disabled>
                      <SelectValue
                        placeholder={`Select ${variant} (disabled)`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                          disabled
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparação de Alturas */}
      <h3 className="font-bold text-2xl text-text-900">
        Comparação de Alturas
      </h3>
      <div className="flex flex-row gap-4 items-end">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col gap-2">
            <span className="text-sm text-text-600">{size}</span>
            <Select size={size} label={`Label ${size}`}>
              <SelectTrigger>
                <SelectValue placeholder={`${size} select`} />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {/* Com valor padrão */}
      <h3 className="font-bold text-2xl text-text-900">Com valor padrão</h3>
      <div className="flex flex-row gap-4 flex-wrap">
        <Select defaultValue="item2" label="Opção pré-selecionada">
          <SelectTrigger>
            <SelectValue placeholder="Select an item" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desabilitado */}
      <h3 className="font-bold text-2xl text-text-900">Desabilitado</h3>
      <div className="flex flex-row gap-4 flex-wrap">
        <Select label="Select desabilitado">
          <SelectTrigger disabled>
            <SelectValue placeholder="Disabled select" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Stories individuais para referência rápida
export const WithLabel: Story = () => (
  <Select label="Escolha uma opção" helperText="Esta é uma informação útil">
    <SelectTrigger>
      <SelectValue placeholder="Clique para selecionar" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="opcao1">Opção 1</SelectItem>
      <SelectItem value="opcao2">Opção 2</SelectItem>
      <SelectItem value="opcao3">Opção 3</SelectItem>
    </SelectContent>
  </Select>
);

export const WithError: Story = () => (
  <Select
    label="Campo obrigatório"
    errorMessage="Por favor, selecione uma opção"
  >
    <SelectTrigger invalid>
      <SelectValue placeholder="Selecione uma opção" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="opcao1">Opção 1</SelectItem>
      <SelectItem value="opcao2">Opção 2</SelectItem>
    </SelectContent>
  </Select>
);

export const ExtraLarge: Story = () => (
  <Select size="extra-large" label="Select Extra Large">
    <SelectTrigger>
      <SelectValue placeholder="Extra large select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="item1">Item 1</SelectItem>
      <SelectItem value="item2">Item 2</SelectItem>
    </SelectContent>
  </Select>
);

export const Outlined: Story = () => (
  <Select>
    <SelectTrigger variant="outlined">
      <SelectValue placeholder="Outlined select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="item1">Item 1</SelectItem>
      <SelectItem value="item2">Item 2</SelectItem>
      <SelectItem value="item3">Item 3</SelectItem>
    </SelectContent>
  </Select>
);

export const Underlined: Story = () => (
  <Select>
    <SelectTrigger variant="underlined">
      <SelectValue placeholder="Underlined select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="item1">Item 1</SelectItem>
      <SelectItem value="item2">Item 2</SelectItem>
      <SelectItem value="item3">Item 3</SelectItem>
    </SelectContent>
  </Select>
);

export const Rounded: Story = () => (
  <Select>
    <SelectTrigger variant="rounded">
      <SelectValue placeholder="Rounded select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="item1">Item 1</SelectItem>
      <SelectItem value="item2">Item 2</SelectItem>
      <SelectItem value="item3">Item 3</SelectItem>
    </SelectContent>
  </Select>
);

export const Small: Story = () => (
  <Select size="small">
    <SelectTrigger>
      <SelectValue placeholder="Small select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="item1">Item 1</SelectItem>
      <SelectItem value="item2">Item 2</SelectItem>
    </SelectContent>
  </Select>
);

export const Medium: Story = () => (
  <Select size="medium">
    <SelectTrigger>
      <SelectValue placeholder="Medium select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="item1">Item 1</SelectItem>
      <SelectItem value="item2">Item 2</SelectItem>
    </SelectContent>
  </Select>
);

export const Large: Story = () => (
  <Select size="large">
    <SelectTrigger>
      <SelectValue placeholder="Large select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="item1">
        Prefixo
        <span>1</span>
        <span>2</span>
      </SelectItem>
      <SelectItem value="item2">Item 2</SelectItem>
    </SelectContent>
  </Select>
);

export const WithDefaultValue: Story = () => (
  <Select defaultValue="item2">
    <SelectTrigger>
      <SelectValue placeholder="Select an item" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="item1">Item 1</SelectItem>
      <SelectItem value="item2">Item 2</SelectItem>
      <SelectItem value="item3">Item 3</SelectItem>
    </SelectContent>
  </Select>
);

export const Disabled: Story = () => (
  <Select>
    <SelectTrigger disabled>
      <SelectValue placeholder="Disabled select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="item1">Item 1</SelectItem>
      <SelectItem value="item2">Item 2</SelectItem>
    </SelectContent>
  </Select>
);

export const WithOnValueChange: Story = () => {
  const [selectedValue, setSelectedValue] = useState('');
  const [changeLog, setChangeLog] = useState<string[]>([]);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    setChangeLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: Selecionado "${value}"`,
    ]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 600,
      }}
    >
      <h3 className="font-bold text-2xl text-text-900">
        Demonstração do onValueChange
      </h3>

      <Select
        label="Escolha uma fruta"
        size="medium"
        value={selectedValue}
        onValueChange={handleValueChange}
        helperText="Observe o valor selecionado e o log de mudanças abaixo"
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma fruta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">🍎 Maçã</SelectItem>
          <SelectItem value="banana">🍌 Banana</SelectItem>
          <SelectItem value="orange">🍊 Laranja</SelectItem>
          <SelectItem value="grape">🍇 Uva</SelectItem>
          <SelectItem value="strawberry">🍓 Morango</SelectItem>
        </SelectContent>
      </Select>

      <div className="p-4 bg-background-50 rounded-lg border">
        <h4 className="font-medium text-lg text-text-900 mb-2">
          Valor Atual:{' '}
          <span className="text-primary-600 ml-2">
            {selectedValue || 'Nenhum selecionado'}
          </span>
        </h4>

        <div className="mt-4">
          <h5 className="font-medium text-text-700 mb-2">Log de Mudanças:</h5>
          <div className="max-h-32 overflow-y-auto text-sm text-text-600">
            {changeLog.length === 0 ? (
              <p className="italic">Nenhuma mudança ainda...</p>
            ) : (
              changeLog.map((entry) => (
                <div key={entry} className="mb-1">
                  {entry}
                </div>
              ))
            )}
          </div>
          {changeLog.length > 0 && (
            <button
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              onClick={() => setChangeLog([])}
            >
              Limpar log
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
