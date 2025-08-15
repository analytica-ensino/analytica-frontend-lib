import type { Story } from '@ladle/react';
import Menu, {
  MenuContent,
  MenuItem,
  MenuItemIcon,
  MenuOverflow,
  Breadcrumb,
} from './Menu';
import {
  Headphones,
  House,
  ChartLine,
  ChalkboardTeacher,
  File,
} from 'phosphor-react';
import { useState } from 'react';

export const AllMenus: Story = () => {
  const [value, setValue] = useState('home');

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-bold text-3xl text-text-900">
        Menu: Valor selecionado - {value}
      </h2>
      <div className="flex flex-col gap-8">
        <p>Selecionado: {value}</p>
        <Menu defaultValue="home">
          <MenuContent className="max-w-[1000px]">
            <MenuItem value="home">
              <House />
              Painel
            </MenuItem>

            <MenuItem value="simulated">
              <File />
              Simulados
            </MenuItem>

            <MenuItem value="lecture">
              <ChalkboardTeacher />
              Aulas
            </MenuItem>

            <MenuItem value="performance">
              <ChartLine />
              Desempenho
            </MenuItem>

            <MenuItem value="suport">
              <Headphones />
              Suporte
            </MenuItem>
          </MenuContent>
        </Menu>

        <Menu
          defaultValue="home"
          variant="breadcrumb"
          className="max-w-[500px]"
          value={value}
          onValueChange={setValue}
        >
          <MenuContent variant="breadcrumb">
            <MenuItem variant="breadcrumb" value="home" separator>
              Painel
            </MenuItem>

            <MenuItem variant="breadcrumb" value="simulated" separator>
              Simulados
            </MenuItem>

            <MenuItem variant="breadcrumb" value="lecture" separator>
              Aulas
            </MenuItem>

            <MenuItem variant="breadcrumb" value="performance" separator>
              Desempenho
            </MenuItem>

            <MenuItem variant="breadcrumb" value="suport" separator>
              Suporte
            </MenuItem>
          </MenuContent>
        </Menu>

        <h3 className="font-bold text-xl text-text-900 mt-4">
          Breadcrumb Component (Simplified API)
        </h3>
        <Breadcrumb
          parentPageName="Home"
          currentPage="Dashboard"
          onBackClick={() => setValue('home')}
          className="max-w-[500px]"
        />

        <MenuOverflow className="max-w-[500px]" defaultValue="home">
          <MenuItem variant="menu2" value="home">
            <MenuItemIcon className="bg-amber-500" icon={<House />} />
            Painel
          </MenuItem>

          <MenuItem variant="menu2" value="simulated">
            <MenuItemIcon className="bg-exam-2" icon={<File />} />
            Simulados
          </MenuItem>

          <MenuItem variant="menu2" value="lecture">
            <MenuItemIcon
              className="bg-success-500"
              icon={<ChalkboardTeacher />}
            />
            Aulas
          </MenuItem>

          <MenuItem variant="menu2" value="performance">
            <MenuItemIcon className="bg-yellow-500" icon={<ChartLine />} />
            Desempenho
          </MenuItem>

          <MenuItem variant="menu2" value="suport">
            <MenuItemIcon className="bg-blue-500" icon={<Headphones />} />
            Suporte
          </MenuItem>
        </MenuOverflow>
      </div>
    </div>
  );
};
