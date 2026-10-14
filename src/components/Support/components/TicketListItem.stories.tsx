import type { Story } from '@ladle/react';
import { DeviceMobileIcon } from '@phosphor-icons/react/dist/csr/DeviceMobile';
import {
  TicketListItem,
  TicketListItemSize,
  TicketListItemTone,
} from './TicketListItem';

const BASE_PROPS = {
  name: 'Ana Clara Mendes',
  lastMessageAt: new Date(Date.now() - 6 * 60 * 1000),
  profileLabel: 'ESTUDANTE',
  organization: 'CE Santos Dumont',
  message: 'IA: Entendi. Vou transferir você para um atendente.',
  attendanceLabel: 'HUMANO',
  channelIcon: <DeviceMobileIcon size={16} />,
  ticketCode: '#4826',
  unread: true,
};

const TONES: { tone: TicketListItemTone; hint: string }[] = [
  { tone: 'default', hint: 'padrão — fundo transparente' },
  { tone: 'info', hint: 'selecionado — #EEF5FC com barra #1C61B2' },
  { tone: 'danger', hint: 'destaque — #FFF7F7, sem barra' },
];

/**
 * Showcase principal: os três fundos do frame "Lista de tickets – item" do
 * Figma ("Componentes – Suporte"). Passe o mouse em qualquer um para ver o
 * hover sobrepor o tone.
 */
export const AllTicketListItems: Story = () => (
  <div className="flex max-w-xl flex-col gap-8">
    <div>
      <h2 className="text-3xl font-bold text-text-900">TicketListItem</h2>
      <p className="text-text-700">
        Linha da lista de tickets do SAC. O hover vira azul em qualquer{' '}
        <code>tone</code>.
      </p>
    </div>

    <section className="flex flex-col gap-4 rounded-xl border border-border-200 p-2">
      {TONES.map(({ tone, hint }) => (
        <div key={tone} className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-text-900">{tone}</h3>
          <p className="text-xs text-text-700">{hint}</p>
          <TicketListItem {...BASE_PROPS} tone={tone} />
        </div>
      ))}
    </section>
  </div>
);

const SIZES: { size: TicketListItemSize; hint: string }[] = [
  { size: 'sm', hint: 'compacto — avatar 32, p-3' },
  { size: 'md', hint: 'padrão do Figma — avatar 40, p-4' },
  { size: 'lg', hint: 'confortável — avatar 48, p-5' },
];

/**
 * `size` escala espaçamento, avatar, tipografia, badges e ícone juntos. Para
 * responsividade, o app escolhe o tamanho por breakpoint — por exemplo com o
 * hook `useMobile` da lib.
 */
export const Sizes: Story = () => (
  <div className="flex max-w-xl flex-col gap-6">
    {SIZES.map(({ size, hint }) => (
      <div key={size} className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-text-900">{size}</h3>
        <p className="text-xs text-text-700">{hint}</p>
        <div className="rounded-xl border border-border-200">
          <TicketListItem {...BASE_PROPS} size={size} />
        </div>
      </div>
    ))}
  </div>
);

/** Com todas as props opcionais ausentes — o item degrada sem buraco. */
export const MinimalTicketListItem: Story = () => (
  <div className="max-w-xl">
    <TicketListItem name="Ana Clara Mendes" lastMessageAt={new Date()} />
  </div>
);

/** Com foto, em vez das iniciais. */
export const WithPicture: Story = () => (
  <div className="max-w-xl">
    <TicketListItem
      {...BASE_PROPS}
      avatarSrc="https://i.pravatar.cc/80?img=47"
    />
  </div>
);
