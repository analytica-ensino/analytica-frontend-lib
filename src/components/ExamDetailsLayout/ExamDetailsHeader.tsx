import { Menu, MenuContent, MenuItem } from '../Menu/Menu';
import Text from '../Text/Text';
import Button from '../Button/Button';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple';
export interface ExamDetailsHeaderProps {
  examTitle: string;
  examDate: string;
  school: string;
  classroomName: string;
  createdAt: string;
  onBack: () => void;
  onDownloadExam: () => void;
  /** Custom label for the back breadcrumb item */
  backLabel?: string;
  /** Custom label for the download button */
  downloadLabel?: string;
}

/**
 * Header component for exam details page
 * Includes breadcrumb navigation, title, subtitle, and download button
 */
export const ExamDetailsHeader = ({
  examTitle,
  examDate,
  school,
  classroomName,
  createdAt,
  onBack,
  onDownloadExam,
  backLabel = 'Provas',
  downloadLabel = 'Baixar prova',
}: ExamDetailsHeaderProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <Menu
        value="current-page"
        defaultValue="current-page"
        variant="breadcrumb"
        className="px-0!"
      >
        <MenuContent variant="breadcrumb">
          <MenuItem
            variant="breadcrumb"
            value="provas"
            onClick={onBack}
            separator
          >
            {backLabel}
          </MenuItem>
          <MenuItem variant="breadcrumb" value="current-page">
            {examTitle}
          </MenuItem>
        </MenuContent>
      </Menu>

      {/* Title + Download Button */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <Text as="h1" size="xl" weight="bold">
            {examTitle}
          </Text>
          <Text size="sm" color="secondary">
            Data da prova {examDate} • {school} • {classroomName} • Criada em{' '}
            {createdAt}
          </Text>
        </div>
        <Button
          action="primary"
          onClick={onDownloadExam}
          iconLeft={<DownloadSimpleIcon size={18} />}
        >
          {downloadLabel}
        </Button>
      </div>
    </div>
  );
};

export default ExamDetailsHeader;
