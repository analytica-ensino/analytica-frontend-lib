import type { Story } from '@ladle/react';
import { useState } from 'react';
import SupportChatComposer from './SupportChatComposer';
import { SUPPORT_CHAT_REPLY_MODE } from '../../types/supportChat';
import Text from '../Text/Text';

/**
 * Composer with every action; the callbacks are listed below it
 */
export const Default: Story = () => {
  const [log, setLog] = useState<string[]>([]);
  const push = (entry: string) => setLog((list) => [...list, entry]);

  return (
    <div className="flex w-[640px] flex-col gap-4 p-4">
      <SupportChatComposer
        onSend={({ text, mode }) => push(`onSend (${mode}): ${text}`)}
        onModeChange={(mode) => push(`onModeChange: ${mode}`)}
        onAttachImages={(files) =>
          push(`onAttachImages: ${files.map((file) => file.name).join(', ')}`)
        }
      />
      {log.map((entry, index) => (
        <Text key={index} size="sm" color="text-text-700">
          {entry}
        </Text>
      ))}
    </div>
  );
};

/**
 * Starting on the internal note mode
 */
export const InternalNote: Story = () => (
  <div className="w-[640px] p-4">
    <SupportChatComposer
      defaultMode={SUPPORT_CHAT_REPLY_MODE.INTERNAL_NOTE}
      onSend={() => undefined}
      onAttachImages={() => undefined}
    />
  </div>
);

/**
 * Without the image action
 */
export const WithoutActions: Story = () => (
  <div className="w-[640px] p-4">
    <SupportChatComposer onSend={() => undefined} />
  </div>
);

/**
 * Disabled (e.g. while a reply is being sent)
 */
export const Disabled: Story = () => (
  <div className="w-[640px] p-4">
    <SupportChatComposer
      disabled
      onSend={() => undefined}
      onAttachImages={() => undefined}
    />
  </div>
);
