import type { Story } from '@ladle/react';
import Select, {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
} from './Select';

const sizes = ['small', 'medium', 'large'] as const;
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
        Variações possíveis do componente <code>Select</code>:
      </p>

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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Com valor padrão */}
      <h3 className="font-bold text-2xl text-text-900">Com valor padrão</h3>
      <div className="flex flex-row gap-4 flex-wrap">
        <Select defaultValue="item2">
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
        <Select>
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

      {/* Com separador */}
      <h3 className="font-bold text-2xl text-text-900">Com separador</h3>
      <div className="flex flex-row gap-4 flex-wrap">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select with separator" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem value="group1-item1">Group 1 - Item 1</SelectItem>
            <SelectItem value="group1-item2">Group 1 - Item 2</SelectItem>
            <SelectSeparator />
            <SelectItem value="group2-item1">Group 2 - Item 1</SelectItem>
            <SelectItem value="group2-item2">Group 2 - Item 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Stories individuais para referência rápida
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
      <SelectItem value="item1">Item 1</SelectItem>
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

export const WithSeparator: Story = () => (
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Select with separator" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="group1-item1">Group 1 - Item 1</SelectItem>
      <SelectItem value="group1-item2">Group 1 - Item 2</SelectItem>
      <SelectSeparator />
      <SelectItem value="group2-item1">Group 2 - Item 1</SelectItem>
      <SelectItem value="group2-item2">Group 2 - Item 2</SelectItem>
    </SelectContent>
  </Select>
);
