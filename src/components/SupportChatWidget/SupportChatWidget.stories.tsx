import type { Story } from '@ladle/react';
import { useMemo, useState, type ReactNode } from 'react';
import { SupportChatWidget } from './SupportChatWidget';
import { createMockSupportChatAdapter } from './mockSupportChatAdapter';
import { SupportType } from '../../types/support';
import Text from '../Text/Text';

const Page = ({ children }: { children: ReactNode }) => (
  <div className="min-h-[600px] p-6">
    <Text size="lg" weight="semibold">
      Página de teste do widget de suporte
    </Text>
    <Text size="sm" className="text-text-500 mt-2">
      Dados mockados: o suporte responde sozinho depois de 1,5 s.
    </Text>
    {children}
  </div>
);

export const Visitante: Story = () => {
  const adapter = useMemo(() => createMockSupportChatAdapter(), []);
  const [log, setLog] = useState<string[]>([]);
  const push = (entry: string) => setLog((list) => [...list, entry]);

  return (
    <Page>
      <ul className="mt-4 text-sm text-text-700">
        {log.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>
      <SupportChatWidget
        adapter={adapter}
        channel="login"
        onOpen={() => push('onOpen')}
        onSend={(message) => push(`onSend: ${message.content}`)}
        onClose={() => push('onClose')}
      />
    </Page>
  );
};

export const UsuarioLogado: Story = () => {
  const adapter = useMemo(() => createMockSupportChatAdapter(), []);
  return (
    <Page>
      <SupportChatWidget
        adapter={adapter}
        channel="backoffice"
        institutionId="inst-1"
        user={{ name: 'Maria Silva', email: 'maria@escola.com' }}
      />
    </Page>
  );
};

export const TemaCustomizado: Story = () => {
  const adapter = useMemo(() => createMockSupportChatAdapter(), []);
  return (
    <Page>
      <SupportChatWidget
        adapter={adapter}
        channel="app"
        theme={{
          primaryColor: '#0f766e',
          position: 'bottom-left',
          title: 'Fale com a gente',
        }}
      />
    </Page>
  );
};

export const OcultoComZendesk: Story = () => {
  const adapter = useMemo(() => createMockSupportChatAdapter(), []);
  return (
    <Page>
      <Text size="sm" className="mt-4">
        Com supportType = ZENDESK (ou enabled = false) o widget não é
        renderizado.
      </Text>
      <SupportChatWidget
        adapter={adapter}
        channel="app"
        flags={{ supportType: SupportType.ZENDESK }}
      />
    </Page>
  );
};
