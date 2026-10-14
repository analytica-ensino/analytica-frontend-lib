import { useState } from 'react';
import type { Story } from '@ladle/react';
import Button from '../Button/Button';
import SupportConcludeModal from './SupportConcludeModal';
import type { SupportApiClient } from '../../types/support';

/** Fake client that resolves after a short delay */
const successClient: Pick<SupportApiClient, 'patch'> = {
  patch: <T,>(_url: string, data?: unknown) =>
    new Promise<{ data: T }>((resolve) => {
      setTimeout(() => resolve({ data: data as T }), 600);
    }),
};

/** Fake client that fails with the backend validation message */
const errorClient: Pick<SupportApiClient, 'patch'> = {
  patch: <T,>() =>
    new Promise<{ data: T }>((_resolve, reject) => {
      setTimeout(
        () =>
          reject({
            response: {
              data: {
                message:
                  'Não é possível resolver o ticket sem identificar o tipo de problema',
              },
            },
          }),
        600
      );
    }),
};

/**
 * Story wrapper with a button that opens the modal
 */
function ModalDemo({
  apiClient,
}: Readonly<{ apiClient: Pick<SupportApiClient, 'patch'> }>) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="p-4">
      <Button size="small" onClick={() => setIsOpen(true)}>
        Concluir
      </Button>
      <SupportConcludeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ticketId="019a0000-0000-7000-8000-000000004808"
        ticketLabel="4808"
        apiClient={apiClient}
      />
    </div>
  );
}

/**
 * Successful conclusion
 */
export const Default: Story = () => <ModalDemo apiClient={successClient} />;

/**
 * Backend error kept inside the modal
 */
export const WithError: Story = () => <ModalDemo apiClient={errorClient} />;
