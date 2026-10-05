import { ReactNode, useRef } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { useModalFocus } from './useModalFocus';

/**
 * Diálogo mínimo com a MESMA montagem dos modais da lib: o título com
 * `tabIndex={-1}` no topo e o "Fechar" por último. É essa ordem que o hook
 * pressupõe — o foco inicial pousa no título e o X só aparece no fim do ciclo
 * de Tab.
 */
const Dialogo = ({
  isOpen,
  titulo = 'Título',
  /** Simula um consumidor antigo, que chama o hook sem o ref do título. */
  comRefDoTitulo = true,
  comFechar = true,
  children,
}: {
  isOpen: boolean;
  titulo?: string;
  comRefDoTitulo?: boolean;
  comFechar?: boolean;
  children?: ReactNode;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useModalFocus(isOpen, dialogRef, comRefDoTitulo ? titleRef : undefined);

  if (!isOpen) return null;

  return (
    <dialog ref={dialogRef} tabIndex={-1} open aria-label="Diálogo">
      {titulo && (
        <h2 ref={titleRef} tabIndex={-1}>
          {titulo}
        </h2>
      )}
      {children}
      {comFechar && (
        <button type="button" aria-label="Fechar modal">
          X
        </button>
      )}
    </dialog>
  );
};

const abrir = (props: Partial<Parameters<typeof Dialogo>[0]> = {}) =>
  render(<Dialogo isOpen {...props} />);

describe('useModalFocus', () => {
  describe('Foco inicial', () => {
    it('pousa no título, e não no diálogo', () => {
      abrir();

      expect(screen.getByRole('heading', { name: 'Título' })).toHaveFocus();
      expect(screen.getByRole('dialog')).not.toHaveFocus();
    });

    it('pousa no título, e não no botão de fechar', () => {
      abrir();

      expect(screen.getByLabelText('Fechar modal')).not.toHaveFocus();
    });

    it('cai no diálogo quando o título não está montado', () => {
      abrir({ titulo: '' });

      expect(screen.getByRole('dialog')).toHaveFocus();
    });

    it('cai no diálogo quando o chamador não passa o ref do título', () => {
      // Retrocompatibilidade: `AccessibilityPanel` e `ChatbotPanel` seguem
      // chamando o hook com dois argumentos.
      abrir({ comRefDoTitulo: false });

      expect(screen.getByRole('dialog')).toHaveFocus();
    });

    it('não move o foco enquanto o diálogo está fechado', () => {
      const gatilho = document.createElement('button');
      document.body.appendChild(gatilho);
      gatilho.focus();

      render(<Dialogo isOpen={false} />);

      expect(gatilho).toHaveFocus();
      gatilho.remove();
    });

    it('devolve o foco a quem abriu ao fechar', () => {
      const gatilho = document.createElement('button');
      document.body.appendChild(gatilho);
      gatilho.focus();

      const { rerender } = render(<Dialogo isOpen />);
      expect(screen.getByRole('heading', { name: 'Título' })).toHaveFocus();

      rerender(<Dialogo isOpen={false} />);

      expect(gatilho).toHaveFocus();
      gatilho.remove();
    });
  });

  describe('Ciclo de Tab', () => {
    it('não intercepta o Tab a partir do título', () => {
      // O título tem `tabindex="-1"` e fica fora do ciclo: quem leva o foco pro
      // próximo focusável do DOM é o navegador. Interceptar aqui seria pular o
      // conteúdo. (No jsdom o Tab nativo não move o foco; o que se verifica é
      // que o evento NÃO foi cancelado.)
      abrir({ children: <button type="button">Confirmar</button> });

      const naoCancelado = fireEvent.keyDown(document, { key: 'Tab' });

      expect(naoCancelado).toBe(true);
    });

    it('fecha o anel no Shift+Tab a partir do título', () => {
      abrir({ children: <button type="button">Confirmar</button> });

      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

      // O último focusável é o "Fechar modal", que agora é o último do DOM.
      expect(screen.getByLabelText('Fechar modal')).toHaveFocus();
    });

    it('do último focusável o Tab volta pro primeiro, sem passar pelo título', () => {
      abrir({ children: <button type="button">Confirmar</button> });

      screen.getByLabelText('Fechar modal').focus();
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveFocus();
      expect(screen.getByRole('heading', { name: 'Título' })).not.toHaveFocus();
    });

    it('do primeiro focusável o Shift+Tab volta pro último', () => {
      abrir({ children: <button type="button">Confirmar</button> });

      screen.getByRole('button', { name: 'Confirmar' }).focus();
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

      expect(screen.getByLabelText('Fechar modal')).toHaveFocus();
    });

    it('devolve o foco ao título quando não há nada focusável dentro', () => {
      abrir({ comFechar: false });

      screen.getByRole('dialog').focus();
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(screen.getByRole('heading', { name: 'Título' })).toHaveFocus();
    });

    it('sem título e sem focusáveis, o Tab mantém o foco no diálogo', () => {
      abrir({ titulo: '', comFechar: false });

      fireEvent.keyDown(document, { key: 'Tab' });

      expect(screen.getByRole('dialog')).toHaveFocus();
    });
  });

  describe('Fundo inerte', () => {
    it('marca os irmãos enquanto aberto e os devolve ao fechar', () => {
      const fundo = document.createElement('div');
      fundo.innerHTML = '<button type="button">Atrás</button>';
      document.body.appendChild(fundo);

      const { rerender } = render(<Dialogo isOpen />);
      expect(fundo).toHaveAttribute('inert');
      expect(fundo).toHaveAttribute('aria-hidden', 'true');

      rerender(<Dialogo isOpen={false} />);
      expect(fundo).not.toHaveAttribute('inert');
      expect(fundo).not.toHaveAttribute('aria-hidden');

      fundo.remove();
    });
  });
});
