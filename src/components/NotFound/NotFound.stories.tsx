import type { Story } from '@ladle/react';
import NotFound, { NotFoundProps } from './NotFound';

/**
 * Default 404 page
 */
export const Default: Story<NotFoundProps> = () => (
  <NotFound onButtonClick={() => console.log('Navigate to dashboard')} />
);

/**
 * 404 page with custom content
 */
export const Custom404: Story<NotFoundProps> = () => (
  <NotFound
    title="Página não existe"
    description="A página que você procura não foi encontrada em nossos servidores."
    buttonText="Ir para início"
    onButtonClick={() => console.log('Navigate to home')}
  />
);

/**
 * 500 Internal Server Error page
 */
export const ServerError: Story<NotFoundProps> = () => (
  <NotFound
    errorType="500"
    buttonText="Tentar novamente"
    onButtonClick={() => console.log('Retry action')}
  />
);

/**
 * Custom error with 403 Forbidden
 */
export const ForbiddenError: Story<NotFoundProps> = () => (
  <NotFound
    errorType="custom"
    customErrorCode="403"
    title="Acesso negado"
    description="Você não tem permissão para acessar esta página."
    buttonText="Voltar ao painel"
    onButtonClick={() => console.log('Navigate to dashboard')}
  />
);

/**
 * Without button (no navigation)
 */
export const WithoutButton: Story<NotFoundProps> = () => (
  <NotFound
    title="Maintenance Mode"
    description="O sistema está temporariamente em manutenção. Tente novamente mais tarde."
  />
);

/**
 * Custom styling example
 */
export const CustomStyling: Story<NotFoundProps> = () => (
  <NotFound
    title="Oops!"
    description="Algo não saiu como esperado."
    buttonText="Recarregar página"
    onButtonClick={() => window.location.reload()}
    className="bg-gradient-to-br from-primary-50 to-primary-100"
  />
);

/**
 * With very long content to test text wrapping
 */
export const LongContent: Story<NotFoundProps> = () => (
  <NotFound
    errorType="custom"
    customErrorCode="LONG"
    title="Este é um título muito longo para testar como o componente se comporta com textos extensos"
    description="Esta é uma descrição muito longa que serve para testar como o componente NotFound se comporta quando recebe textos extensos que podem quebrar o layout ou causar problemas de responsividade em diferentes tamanhos de tela."
    buttonText="Botão com texto muito longo"
    onButtonClick={() => console.log('Long button clicked')}
  />
);
