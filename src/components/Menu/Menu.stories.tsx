import type { Story } from '@ladle/react';
import Menu, {
  MenuContent,
  MenuItem,
  MenuItemIcon,
  MenuOverflow,
} from './Menu';
import {
  Headphones,
  House,
  ChartLine,
  ChalkboardTeacher,
  File,
} from 'phosphor-react';
import { useState } from 'react';

export const Menu2SingleVsMultiple: Story = () => {
  const [singleValue, setSingleValue] = useState('single');
  const [multiValue, setMultiValue] = useState('home');

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-bold text-3xl text-text-900">
        Menu2: Responsivo - Um vs Múltiplos Itens
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Item Único (w-fit):</p>
          <Menu
            variant="menu2"
            defaultValue="single"
            value={singleValue}
            onValueChange={setSingleValue}
          >
            <MenuContent variant="menu2">
              <MenuItem variant="menu2" value="single">
                <MenuItemIcon className="bg-amber-500" icon={<House />} />
                Único Item
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-semibold">Múltiplos Itens (w-full):</p>
          <MenuOverflow
            className="max-w-[600px]"
            defaultValue="home"
            value={multiValue}
            onValueChange={setMultiValue}
          >
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
          </MenuOverflow>
        </div>
      </div>
    </div>
  );
};

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
