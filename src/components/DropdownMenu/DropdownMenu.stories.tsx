import type { Story } from '@ladle/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from './DropdownMenu';
import { Plus, Check } from 'phosphor-react';

const sizes = ['small', 'medium'] as const;

export const AllDropdownMenus: Story = () => (
  <div className='flex flex-col gap-8'>
    <h2 className="font-bold text-3xl text-text-900">DropdownMenu</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>DropdownMenu</code>:
    </p>

    {/* Menu básico */}
    <h3 className="font-bold text-2xl text-text-900">Menu Básico</h3>
    <div className="flex flex-row gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem>
            <MenuLabel>Item 1</MenuLabel>
          </MenuItem>
          <MenuItem>
            <MenuLabel>Item 2</MenuLabel>
          </MenuItem>
          <MenuItem>
            <MenuLabel>Item 3</MenuLabel>
          </MenuItem>
        </MenuContent>
      </DropdownMenu>
    </div>

    {/* Tamanhos */}
    <h3 className="font-bold text-2xl text-text-900">Tamanhos</h3>
    <div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <div key={size}>
          <div className="font-medium text-text-900 mb-2">{size}</div>
          <DropdownMenu>
            <DropdownMenuTrigger>Menu {size}</DropdownMenuTrigger>
            <MenuContent>
              <MenuItem size={size}>
                <MenuLabel>Item 1 ({size})</MenuLabel>
              </MenuItem>
              <MenuItem size={size}>
                <MenuLabel>Item 2 ({size})</MenuLabel>
              </MenuItem>
              <MenuItem size={size}>
                <MenuLabel>Item 3 ({size})</MenuLabel>
              </MenuItem>
            </MenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>

    {/* Com ícones */}
    <h3 className="font-bold text-2xl text-text-900">Com Ícones</h3>
    <div className="flex flex-row gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger>Menu with Icons</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem iconLeft={<Plus />}>
            <MenuLabel>New Item</MenuLabel>
          </MenuItem>
          <MenuItem iconLeft={<Check />}>
            <MenuLabel>Completed</MenuLabel>
          </MenuItem>
          <MenuItem iconRight={<Plus />}>
            <MenuLabel>Add More</MenuLabel>
          </MenuItem>
        </MenuContent>
      </DropdownMenu>
    </div>

    {/* Com labels e separadores */}
    <h3 className="font-bold text-2xl text-text-900">
      Com Labels e Separadores
    </h3>
    <div className="flex flex-row gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger>Advanced Menu</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem>
            <MenuLabel>Edit</MenuLabel>
          </MenuItem>
          <MenuItem>
            <MenuLabel>Delete</MenuLabel>
          </MenuItem>
          <MenuSeparator />
          <MenuItem>
            <MenuLabel>Preferences</MenuLabel>
          </MenuItem>
          <MenuItem>
            <MenuLabel>Account</MenuLabel>
          </MenuItem>
        </MenuContent>
      </DropdownMenu>
    </div>

    {/* Desabilitado */}
    <h3 className="font-bold text-2xl text-text-900">Itens Desabilitados</h3>
    <div className="flex flex-row gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger>Disabled Items</DropdownMenuTrigger>
        <MenuContent side="top">
          <MenuItem>
            <MenuLabel>Enabled Item</MenuLabel>
          </MenuItem>
          <MenuItem disabled>
            <MenuLabel>Disabled Item</MenuLabel>
          </MenuItem>
          <MenuItem disabled iconLeft={<Check />}>
            <MenuLabel>Disabled with Icon</MenuLabel>
          </MenuItem>
        </MenuContent>
      </DropdownMenu>
    </div>
  </div>
);

// Stories individuais para referência rápida
export const Basic: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
    <MenuContent>
      <MenuItem>
        <MenuLabel>Item 1</MenuLabel>
      </MenuItem>
      <MenuItem>
        <MenuLabel>Item 2</MenuLabel>
      </MenuItem>
      <MenuItem>
        <MenuLabel>Item 3</MenuLabel>
      </MenuItem>
    </MenuContent>
  </DropdownMenu>
);

export const WithIcons: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>Menu with Icons</DropdownMenuTrigger>
    <MenuContent>
      <MenuItem iconLeft={<Plus />}>
        <MenuLabel>New Item</MenuLabel>
      </MenuItem>
      <MenuItem iconLeft={<Check />}>
        <MenuLabel>Completed</MenuLabel>
      </MenuItem>
      <MenuItem iconRight={<Plus />}>
        <MenuLabel>Add More</MenuLabel>
      </MenuItem>
    </MenuContent>
  </DropdownMenu>
);

export const WithLabels: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>Menu with Labels</DropdownMenuTrigger>
    <MenuContent>
      <MenuItem>
        <MenuLabel>Edit</MenuLabel>
      </MenuItem>
      <MenuItem>
        <MenuLabel>Delete</MenuLabel>
      </MenuItem>
      <MenuSeparator />
      <MenuItem>
        <MenuLabel>Preferences</MenuLabel>
      </MenuItem>
      <MenuItem>
        <MenuLabel>Account</MenuLabel>
      </MenuItem>
    </MenuContent>
  </DropdownMenu>
);

export const DisabledItems: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>Disabled Items</DropdownMenuTrigger>
    <MenuContent>
      <MenuItem>
        <MenuLabel>Enabled Item</MenuLabel>
      </MenuItem>
      <MenuItem disabled>
        <MenuLabel>Disabled Item</MenuLabel>
      </MenuItem>
      <MenuItem disabled iconLeft={<Check />}>
        <MenuLabel>Disabled with Icon</MenuLabel>
      </MenuItem>
    </MenuContent>
  </DropdownMenu>
);

export const DifferentSizes: Story = () => (
  <div className="flex flex-col gap-4">
    <DropdownMenu>
      <DropdownMenuTrigger>Small Menu</DropdownMenuTrigger>
      <MenuContent>
        <MenuItem size="small">
          <MenuLabel>Small Item 1</MenuLabel>
        </MenuItem>
        <MenuItem size="small">
          <MenuLabel>Small Item 2</MenuLabel>
        </MenuItem>
        <MenuItem size="small">
          <MenuLabel>Small Item 3</MenuLabel>
        </MenuItem>
      </MenuContent>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenuTrigger>Medium Menu</DropdownMenuTrigger>
      <MenuContent>
        <MenuItem size="medium">
          <MenuLabel>Medium Item 1</MenuLabel>
        </MenuItem>
        <MenuItem size="medium">
          <MenuLabel>Medium Item 2</MenuLabel>
        </MenuItem>
        <MenuItem size="medium">
          <MenuLabel>Medium Item 3</MenuLabel>
        </MenuItem>
      </MenuContent>
    </DropdownMenu>
  </div>
);
