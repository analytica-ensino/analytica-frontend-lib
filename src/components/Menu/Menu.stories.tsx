import type { Story } from '@ladle/react';
import Menu, { MenuItem } from './Menu';
import { Headphones, House, ChartLine, ChalkboardTeacher, File } from 'phosphor-react';

export const AllMenus: Story = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Menu:</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Menu defaultValue='home'>
          <MenuItem value='home'>
            <House />
            Painel
          </MenuItem>

          <MenuItem value='simulated'>
            <File />
            Simulados
          </MenuItem>

          <MenuItem value='lecture'>
            <ChalkboardTeacher  />
            Aulas
          </MenuItem>

          <MenuItem value='performance'>
            <ChartLine />
            Desempenho
          </MenuItem>

          <MenuItem value='suport'>
            <Headphones  />
            Suporte
          </MenuItem>
        </Menu>
      </div>

    </div>
  );
};