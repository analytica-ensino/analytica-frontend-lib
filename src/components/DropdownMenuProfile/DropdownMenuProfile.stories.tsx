import { Story } from '@ladle/react';
import DropdownProfileMenu, {
  ProfileMenuTrigger,
  ProfileMenuContent,
  ProfileMenuFooter,
  ProfileMenuHeader,
  ProfileMenuSection,
  ProfileMenuItem,
} from './DropdownMenuProfile';
import { CaretRight, User } from 'phosphor-react';

export const AllDropdownMenus: Story = () => (
  <div className="flex flex-col gap-8">
    <h2 className="font-bold text-3xl text-text-900">Dropdown Profile Menu</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>Dropdown Profile Menu</code>:
    </p>

    {/* Profile Menu básico */}
    <h3 className="font-bold text-2xl text-text-900">Profile Menu Básico</h3>
    <div className="flex flex-row gap-4">
      <DropdownProfileMenu>
        <ProfileMenuTrigger onClick={() => console.log('passou')}>
          Open Menu
        </ProfileMenuTrigger>
        <ProfileMenuContent>
          <ProfileMenuHeader email="ana@gmail.com" name="Ana Paula" />
          <ProfileMenuSection>
            <ProfileMenuItem iconLeft={<User />} iconRight={<CaretRight />}>
              Dados pessoais
            </ProfileMenuItem>
          </ProfileMenuSection>
          <ProfileMenuFooter />
        </ProfileMenuContent>
      </DropdownProfileMenu>
    </div>
  </div>
);
