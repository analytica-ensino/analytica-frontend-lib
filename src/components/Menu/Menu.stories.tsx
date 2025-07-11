import type { Story } from '@ladle/react';
import Menu, {
  MenuContent,
  MenuItem,
  MenuItemIcon,
  MenuOverflow,
  MenuSeparator,
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
      <h2 className="font-bold text-3xl text-text-900">Menu:</h2>
      <div className="flex flex-col gap-8">
        <p>Selecionado: {value}</p>
        <Menu defaultValue="home" value={value} onValueChange={setValue}>
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
        >
          <MenuContent>
            <MenuItem variant="breadcrumb" value="home">
              Painel
            </MenuItem>

            <MenuSeparator />

            <MenuItem variant="breadcrumb" value="simulated">
              Simulados
            </MenuItem>

            <MenuSeparator />

            <MenuItem variant="breadcrumb" value="lecture">
              Aulas
            </MenuItem>

            <MenuSeparator />

            <MenuItem variant="breadcrumb" value="performance">
              Desempenho
            </MenuItem>

            <MenuSeparator />

            <MenuItem variant="breadcrumb" value="suport">
              Suporte
            </MenuItem>
          </MenuContent>
        </Menu>

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
