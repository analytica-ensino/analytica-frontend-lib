import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { SidebarSimpleIcon } from '@phosphor-icons/react/dist/csr/SidebarSimple';
import type { ReactNode } from 'react';
import IconButton from '../IconButton/IconButton';
import Menu, { MenuContent, MenuItem } from '../Menu/Menu';
import Text from '../Text/Text';
import { EBOOK_MATERIAL_TYPE, type EbookMaterialType } from './types';

export interface EbookReaderHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Material on screen, for the tabs */
  material: EbookMaterialType;
  /** Teacher and manager switch between the student book and the guide; without it there are no tabs */
  onMaterialChange?: (material: EbookMaterialType) => void;
  /** Id of the "Ficha do material" panel the toggle controls */
  detailsId: string;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  /** Extra actions in the header row, after the title and before the tabs */
  headerActions?: ReactNode;
}

/**
 * Top of the reader: back, title, the material tabs (teacher and manager)
 * and the button that opens and closes the "Ficha do material".
 */
export const EbookReaderHeader = ({
  title,
  subtitle,
  onBack,
  material,
  onMaterialChange,
  detailsId,
  detailsOpen,
  onToggleDetails,
  headerActions,
}: Readonly<EbookReaderHeaderProps>) => (
  <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border-100 bg-background px-4 py-3 md:px-6">
    {onBack && (
      <IconButton
        icon={<CaretLeftIcon size={20} />}
        aria-label="Voltar"
        onClick={onBack}
      />
    )}
    <div className="min-w-0 flex-1">
      <Text as="h1" size="xl" weight="bold" className="truncate text-text-950">
        {title}
      </Text>
      {subtitle && (
        <Text size="sm" className="truncate text-text-600">
          {subtitle}
        </Text>
      )}
    </div>
    {headerActions && (
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {headerActions}
      </div>
    )}
    {onMaterialChange && (
      // The tabs keep their own width beside the title; on a phone, where
      // they would squeeze it out, they move to a row of their own.
      <div className="order-last w-full shrink-0 sm:order-none sm:w-auto">
        <Menu
          value={material}
          defaultValue={material}
          variant="menu2"
          semantics="tabs"
          onValueChange={(value) =>
            onMaterialChange(value as EbookMaterialType)
          }
        >
          <MenuContent variant="menu2" aria-label="Material">
            <MenuItem
              value={EBOOK_MATERIAL_TYPE.STUDENT}
              variant="menu-overflow"
              className="!text-sm"
            >
              Livro do estudante
            </MenuItem>
            <MenuItem
              value={EBOOK_MATERIAL_TYPE.TEACHER}
              variant="menu-overflow"
              className="!text-sm"
            >
              Guia do professor
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    )}
    <IconButton
      icon={<SidebarSimpleIcon size={20} />}
      aria-label={
        detailsOpen ? 'Fechar a ficha do material' : 'Abrir a ficha do material'
      }
      aria-expanded={detailsOpen}
      aria-controls={detailsId}
      active={detailsOpen}
      onClick={onToggleDetails}
    />
  </header>
);
