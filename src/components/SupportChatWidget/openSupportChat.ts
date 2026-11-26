/**
 * Window event that opens the support chat widget and focuses its message
 * box. Lets a button outside the widget (e.g. "Falar com suporte" on the login
 * page) open the chat without holding a ref to it.
 */
export const OPEN_SUPPORT_CHAT_EVENT = 'analytica:open-support-chat';

/**
 * Open the support chat widget on the page and focus its message box.
 * Does nothing when no widget is mounted (e.g. the SUPPORT flag is off).
 *
 * @example
 * <Button onClick={openSupportChat}>Falar com suporte</Button>
 */
export const openSupportChat = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_SUPPORT_CHAT_EVENT));
};
