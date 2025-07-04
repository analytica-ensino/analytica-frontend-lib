import type { Story } from '@ladle/react';
import DropdownMenu, {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  MenuLabel,
  DropdownMenuSeparator,
  ProfileMenuTrigger,
  ProfileMenuFooter,
  ProfileMenuHeader,
  ProfileMenuSection,
} from './DropdownMenu';
import { Plus, Check, CaretRight, User } from 'phosphor-react';

const sizes = ['small', 'medium'] as const;

export const AllDropdownComponents: Story = () => {
  return (
    <div className="flex flex-col gap-12 p-6">
      {/* Seção do DropdownMenu genérico */}
      <section className="flex flex-col gap-8">
        <h2 className="font-bold text-3xl text-text-900">DropdownMenu</h2>
        <p className="text-text-700">
          Variações possíveis do componente <code>DropdownMenu</code>:
        </p>

        {/* Menu básico */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-2xl text-text-900">Menu Básico</h3>
          <div className="flex flex-row gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <MenuLabel>Item 1</MenuLabel>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MenuLabel>Item 2</MenuLabel>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MenuLabel>Item 3</MenuLabel>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tamanhos */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-2xl text-text-900">Tamanhos</h3>
          <div className="flex flex-col gap-4">
            {sizes.map((size) => (
              <div key={size}>
                <div className="font-medium text-text-900 mb-2">{size}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger>Menu {size}</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem size={size}>
                      <MenuLabel>Item 1 ({size})</MenuLabel>
                    </DropdownMenuItem>
                    <DropdownMenuItem size={size}>
                      <MenuLabel>Item 2 ({size})</MenuLabel>
                    </DropdownMenuItem>
                    <DropdownMenuItem size={size}>
                      <MenuLabel>Item 3 ({size})</MenuLabel>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>

        {/* Com ícones */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-2xl text-text-900">Com Ícones</h3>
          <div className="flex flex-row gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger>Menu with Icons</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem iconLeft={<Plus />}>
                  <MenuLabel>New Item</MenuLabel>
                </DropdownMenuItem>
                <DropdownMenuItem iconLeft={<Check />}>
                  <MenuLabel>Completed</MenuLabel>
                </DropdownMenuItem>
                <DropdownMenuItem iconRight={<Plus />}>
                  <MenuLabel>Add More</MenuLabel>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Com labels e separadores */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-2xl text-text-900">
            Com Labels e Separadores
          </h3>
          <div className="flex flex-row gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger>Advanced Menu</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <MenuLabel>Edit</MenuLabel>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MenuLabel>Delete</MenuLabel>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <MenuLabel>Preferences</MenuLabel>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MenuLabel>Account</MenuLabel>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Desabilitado */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-2xl text-text-900">
            Itens Desabilitados
          </h3>
          <div className="flex flex-row gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger>Disabled Items</DropdownMenuTrigger>
              <DropdownMenuContent side="top">
                <DropdownMenuItem>
                  <MenuLabel>Enabled Item</MenuLabel>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <MenuLabel>Disabled Item</MenuLabel>
                </DropdownMenuItem>
                <DropdownMenuItem disabled iconLeft={<Check />}>
                  <MenuLabel>Disabled with Icon</MenuLabel>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Seção do ProfileMenu */}
      <section className="flex flex-col gap-8 mt-12">
        <h2 className="font-bold text-3xl text-text-900">Profile Menu</h2>
        <p className="text-text-700">
          Variações possíveis do componente <code>DropdownProfileMenu</code>:
        </p>

        {/* Profile Menu básico */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-2xl text-text-900">
            Profile Menu Completo
          </h3>
          <div className="flex flex-row gap-4">
            <DropdownMenu>
              <ProfileMenuTrigger />
              <DropdownMenuContent
                className="min-w-[320px]"
                side="top"
                variant="profile"
              >
                <ProfileMenuHeader name="Ana Paula" email="ana@gmail.com" />

                <ProfileMenuSection>
                  <DropdownMenuItem
                    variant="profile"
                    iconLeft={<User />}
                    iconRight={<CaretRight />}
                  >
                    Meus dados
                  </DropdownMenuItem>
                </ProfileMenuSection>

                <ProfileMenuFooter onClick={() => console.log('Sair')} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Profile Menu com itens desabilitados */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-2xl text-text-900">
            Com Itens Desabilitados
          </h3>
          <div className="flex flex-row gap-4">
            <DropdownMenu>
              <ProfileMenuTrigger />
              <DropdownMenuContent
                className="min-w-[320px]"
                side="top"
                variant="profile"
              >
                <ProfileMenuHeader name="João Silva" email="joao@empresa.com" />

                <ProfileMenuSection>
                  <DropdownMenuItem
                    variant="profile"
                    iconLeft={<User />}
                    iconRight={<CaretRight />}
                    disabled
                  >
                    Meus dados (desabilitado)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="profile"
                    iconLeft={<User />}
                    iconRight={<CaretRight />}
                  >
                    Configurações
                  </DropdownMenuItem>
                </ProfileMenuSection>

                <ProfileMenuFooter />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>
    </div>
  );
};

// Stories individuais para DropdownMenu genérico
export const BasicMenu: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        <MenuLabel>Item 1</MenuLabel>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <MenuLabel>Item 2</MenuLabel>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <MenuLabel>Item 3</MenuLabel>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const MenuWithIcons: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>Menu with Icons</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem iconLeft={<Plus />}>
        <MenuLabel>New Item</MenuLabel>
      </DropdownMenuItem>
      <DropdownMenuItem iconLeft={<Check />}>
        <MenuLabel>Completed</MenuLabel>
      </DropdownMenuItem>
      <DropdownMenuItem iconRight={<Plus />}>
        <MenuLabel>Add More</MenuLabel>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const MenuWithLabels: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>Menu with Labels</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        <MenuLabel>Edit</MenuLabel>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <MenuLabel>Delete</MenuLabel>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <MenuLabel>Preferences</MenuLabel>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <MenuLabel>Account</MenuLabel>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const DisabledMenuItems: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>Disabled Items</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        <MenuLabel>Enabled Item</MenuLabel>
      </DropdownMenuItem>
      <DropdownMenuItem disabled>
        <MenuLabel>Disabled Item</MenuLabel>
      </DropdownMenuItem>
      <DropdownMenuItem disabled iconLeft={<Check />}>
        <MenuLabel>Disabled with Icon</MenuLabel>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const MenuSizes: Story = () => (
  <div className="flex flex-col gap-4">
    <DropdownMenu>
      <DropdownMenuTrigger>Small Menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem size="small">
          <MenuLabel>Small Item 1</MenuLabel>
        </DropdownMenuItem>
        <DropdownMenuItem size="small">
          <MenuLabel>Small Item 2</MenuLabel>
        </DropdownMenuItem>
        <DropdownMenuItem size="small">
          <MenuLabel>Small Item 3</MenuLabel>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenuTrigger>Medium Menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem size="medium">
          <MenuLabel>Medium Item 1</MenuLabel>
        </DropdownMenuItem>
        <DropdownMenuItem size="medium">
          <MenuLabel>Medium Item 2</MenuLabel>
        </DropdownMenuItem>
        <DropdownMenuItem size="medium">
          <MenuLabel>Medium Item 3</MenuLabel>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

// Stories individuais para ProfileMenu
export const BasicProfileMenu: Story = () => (
  <DropdownMenu>
    <ProfileMenuTrigger />
    <DropdownMenuContent className="min-w-[320px]" variant="profile">
      <ProfileMenuHeader name="Ana Paula" email="ana@gmail.com" />
      <ProfileMenuSection>
        <DropdownMenuItem
          variant="profile"
          iconLeft={<User />}
          iconRight={<CaretRight />}
        >
          Meus dados
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="profile"
          iconLeft={<User />}
          iconRight={<CaretRight />}
        >
          Configurações
        </DropdownMenuItem>
      </ProfileMenuSection>
      <ProfileMenuFooter />
    </DropdownMenuContent>
  </DropdownMenu>
);

export const ProfileMenuWithDisabledItems: Story = () => (
  <DropdownMenu>
    <ProfileMenuTrigger />
    <DropdownMenuContent className="min-w-[320px]" variant="profile">
      <ProfileMenuHeader name="João Silva" email="joao@empresa.com" />
      <ProfileMenuSection>
        <DropdownMenuItem
          variant="profile"
          iconLeft={<User />}
          iconRight={<CaretRight />}
          disabled
        >
          Meus dados (desabilitado)
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="profile"
          iconLeft={<User />}
          iconRight={<CaretRight />}
        >
          Configurações
        </DropdownMenuItem>
      </ProfileMenuSection>
      <ProfileMenuFooter />
    </DropdownMenuContent>
  </DropdownMenu>
);
