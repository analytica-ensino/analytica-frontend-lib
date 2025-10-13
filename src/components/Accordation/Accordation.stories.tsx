import type { Story } from '@ladle/react';
import { CardAccordation } from './Accordation';
import { AccordionGroup } from './AccordionGroup';
import Text from '../Text/Text';
import { useState } from 'react';

export const AllCardAccordationShowcase: Story = () => {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Card Accordation Component Library
        </h1>
        <p className="text-text-600 text-lg">
          Componente de accordion/expansível para organizar conteúdo
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2">
          Exemplos Básicos
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Accordion Simples
            </h3>
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Informações Básicas
                </Text>
              }
            >
              <div className="space-y-3">
                <p className="text-text-700">
                  Este é um exemplo básico de accordion. O conteúdo pode ser
                  qualquer elemento React.
                </p>
                <p className="text-text-600 text-sm">
                  Clique no cabeçalho para expandir ou colapsar o conteúdo.
                </p>
              </div>
            </CardAccordation>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Com Conteúdo Rico
            </h3>
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Detalhes do Produto
                </Text>
              }
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-text-900 mb-2">
                    Especificações:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-text-700">
                    <li>Dimensões: 10cm x 15cm x 3cm</li>
                    <li>Peso: 250g</li>
                    <li>Material: Alumínio anodizado</li>
                    <li>Cor: Cinza espacial</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-text-900 mb-2">
                    Recursos:
                  </h4>
                  <p className="text-text-700">
                    Design ergonômico, resistente à água, compatível com todos
                    os dispositivos.
                  </p>
                </div>
              </div>
            </CardAccordation>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Accordion Expandido por Padrão
          </h3>
          <CardAccordation
            trigger={
              <Text size="sm" weight="bold">
                Seção Importante (Expandida)
              </Text>
            }
            defaultExpanded={true}
          >
            <div className="space-y-3">
              <p className="text-text-700">
                Este accordion inicia expandido por padrão usando a prop{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  defaultExpanded=true
                </code>
                .
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800">
                  <strong>Dica:</strong> Use esta opção para seções importantes
                  que devem estar visíveis imediatamente.
                </p>
              </div>
            </div>
          </CardAccordation>
        </div>

        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2 mt-12">
          Conteúdo Variado
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Com Lista de Tarefas
            </h3>
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Tarefas Pendentes
                </Text>
              }
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-text-700">Revisar documentação</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-text-700 line-through">
                    Criar componente accordion
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-text-700">
                    Escrever testes unitários
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-text-700">Atualizar stories</span>
                </div>
              </div>
            </CardAccordation>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Com Formulário
            </h3>
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Configurações Avançadas
                </Text>
              }
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-700 mb-1">
                    Nome do usuário
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-border-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Digite seu nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-border-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Digite seu e-mail"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-text-700">
                    Receber notificações por e-mail
                  </span>
                </div>
              </div>
            </CardAccordation>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">Com Tabela</h3>
          <CardAccordation
            trigger={
              <Text size="sm" weight="bold">
                Relatório de Vendas
              </Text>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">
                      Produto
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left">
                      Quantidade
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left">
                      Valor
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      Produto A
                    </td>
                    <td className="border border-gray-200 px-4 py-2">150</td>
                    <td className="border border-gray-200 px-4 py-2">
                      R$ 1.500,00
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Concluído
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      Produto B
                    </td>
                    <td className="border border-gray-200 px-4 py-2">89</td>
                    <td className="border border-gray-200 px-4 py-2">
                      R$ 890,00
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        Pendente
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      Produto C
                    </td>
                    <td className="border border-gray-200 px-4 py-2">234</td>
                    <td className="border border-gray-200 px-4 py-2">
                      R$ 2.340,00
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Concluído
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardAccordation>
        </div>

        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2 mt-12">
          Múltiplos Accordions
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            FAQ - Perguntas Frequentes
          </h3>

          <div className="space-y-3">
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Como posso alterar minha senha?
                </Text>
              }
            >
              <div className="space-y-2">
                <p className="text-text-700">
                  Para alterar sua senha, siga estes passos:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-text-700 ml-4">
                  <li>Acesse as configurações da sua conta</li>
                  <li>Clique em "Segurança"</li>
                  <li>Selecione "Alterar senha"</li>
                  <li>Digite sua senha atual e a nova senha</li>
                  <li>Confirme a alteração</li>
                </ol>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Como cancelar minha assinatura?
                </Text>
              }
            >
              <div className="space-y-2">
                <p className="text-text-700">
                  Você pode cancelar sua assinatura a qualquer momento:
                </p>
                <ul className="list-disc list-inside space-y-1 text-text-700 ml-4">
                  <li>Vá para "Minha conta" e depois "Assinaturas"</li>
                  <li>Clique no botão "Cancelar assinatura"</li>
                  <li>Confirme o cancelamento</li>
                  <li>Você manterá acesso até o final do período pago</li>
                </ul>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Posso usar em projetos comerciais?
                </Text>
              }
            >
              <p className="text-text-700">
                Sim! Nossos componentes são licenciados sob MIT License,
                permitindo uso comercial. Você pode usar, modificar e distribuir
                sem restrições.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Como obter suporte técnico?
                </Text>
              }
            >
              <div className="space-y-3">
                <p className="text-text-700">
                  Oferecemos várias opções de suporte:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-900">E-mail</h4>
                    <p className="text-blue-700 text-sm">suporte@exemplo.com</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-green-900">Chat</h4>
                    <p className="text-green-700 text-sm">Disponível 24/7</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-purple-900">Telefone</h4>
                    <p className="text-purple-700 text-sm">(11) 1234-5678</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-orange-900">
                      Documentação
                    </h4>
                    <p className="text-orange-700 text-sm">docs.exemplo.com</p>
                  </div>
                </div>
              </div>
            </CardAccordation>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2 mt-12">
          Callbacks e Controle
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Com Callback de Expansão
          </h3>
          <CardAccordation
            trigger={
              <Text size="sm" weight="bold">
                Accordion com Callback
              </Text>
            }
            onToggleExpanded={(isExpanded) => {
              console.log(
                'Accordion foi',
                isExpanded ? 'expandido' : 'recolhido'
              );
            }}
          >
            <div className="space-y-3">
              <p className="text-text-700">
                Este accordion executa um callback toda vez que é expandido ou
                recolhido.
              </p>
              <p className="text-text-600 text-sm">
                Abra o console do navegador para ver as mensagens de log.
              </p>
              <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-400">
                <code className="text-sm">
                  onToggleExpanded=(isExpanded) =&gt; console.log(isExpanded)
                </code>
              </div>
            </div>
          </CardAccordation>
        </div>

        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2 mt-12">
          Estado Desabilitado
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Accordion Desabilitado
          </h3>
          <p className="text-text-600">
            Use a prop{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">disabled=true</code>{' '}
            para desabilitar a interação com o accordion. Útil quando o conteúdo
            não está disponível ou depende de alguma condição.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-text-800">
                Desabilitado Fechado
              </h4>
              <CardAccordation
                trigger={
                  <Text size="sm" weight="bold">
                    🔒 Conteúdo Bloqueado
                  </Text>
                }
                disabled={true}
              >
                <p className="text-text-700">
                  Este conteúdo não está disponível. Você precisa de permissões
                  especiais para acessá-lo.
                </p>
              </CardAccordation>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-text-800">
                Desabilitado Expandido
              </h4>
              <CardAccordation
                trigger={
                  <Text size="sm" weight="bold">
                    ⚠️ Informação Importante (Bloqueada)
                  </Text>
                }
                defaultExpanded={true}
                disabled={true}
              >
                <p className="text-text-700">
                  Este accordion está expandido mas desabilitado. O usuário pode
                  ver o conteúdo mas não pode fechá-lo.
                </p>
              </CardAccordation>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Casos de Uso do Estado Desabilitado
          </h3>
          <div className="space-y-3">
            <CardAccordation
              trigger={
                <div className="flex items-center gap-2">
                  <Text size="sm" weight="bold">
                    📦 Produto Indisponível
                  </Text>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Fora de Estoque
                  </span>
                </div>
              }
              disabled={true}
            >
              <p className="text-text-700">
                Este produto está temporariamente indisponível.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <div className="flex items-center gap-2">
                  <Text size="sm" weight="bold">
                    🎯 Recurso Premium
                  </Text>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Premium
                  </span>
                </div>
              }
              disabled={true}
            >
              <p className="text-text-700">
                Este recurso está disponível apenas para usuários premium. Faça
                upgrade para desbloquear.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <div className="flex items-center gap-2">
                  <Text size="sm" weight="bold">
                    ⏳ Em Manutenção
                  </Text>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Manutenção
                  </span>
                </div>
              }
              disabled={true}
            >
              <p className="text-text-700">
                Esta seção está temporariamente em manutenção. Voltaremos em
                breve!
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <div className="flex items-center gap-2">
                  <Text size="sm" weight="bold">
                    ✅ Tarefa Concluída
                  </Text>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Completo
                  </span>
                </div>
              }
              defaultExpanded={true}
              disabled={true}
            >
              <div className="space-y-2">
                <p className="text-text-700">
                  Esta tarefa foi concluída e não pode ser modificada.
                </p>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-800 text-sm font-semibold">
                    ✓ Finalizado em: 10/10/2025
                  </p>
                  <p className="text-green-700 text-sm">
                    Responsável: João Silva
                  </p>
                </div>
              </div>
            </CardAccordation>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AccordionGroupShowcase: Story = () => {
  const [singleValue, setSingleValue] = useState<string>('item-1');
  const [multipleValue, setMultipleValue] = useState<string[]>(['item-1']);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Accordion Group Component
        </h1>
        <p className="text-text-600 text-lg">
          Grupos de accordions com controle de expansão coordenado
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2">
          Modo Single (Apenas um aberto por vez)
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Básico - Apenas um accordion aberto
          </h3>
          <p className="text-text-600">
            No modo "single", apenas um item pode estar expandido por vez.
            Quando você abre um item, o anterior fecha automaticamente.
          </p>
          <AccordionGroup type="single" className="space-y-3">
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Pergunta 1: O que é React?
                </Text>
              }
              value="item-1"
            >
              <p className="text-text-700">
                React é uma biblioteca JavaScript para construir interfaces de
                usuário. Foi criada pelo Facebook e é mantida por uma comunidade
                de desenvolvedores.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Pergunta 2: O que são componentes?
                </Text>
              }
              value="item-2"
            >
              <p className="text-text-700">
                Componentes são blocos de construção reutilizáveis que permitem
                dividir a UI em partes independentes e reutilizáveis. Cada
                componente pode ter seu próprio estado e lógica.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Pergunta 3: O que é JSX?
                </Text>
              }
              value="item-3"
            >
              <p className="text-text-700">
                JSX é uma extensão de sintaxe para JavaScript que se parece com
                HTML. Ele permite escrever a estrutura da UI de forma mais
                intuitiva dentro do código JavaScript.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Pergunta 4: O que são hooks?
                </Text>
              }
              value="item-4"
            >
              <p className="text-text-700">
                Hooks são funções especiais que permitem usar recursos do React
                como estado e ciclo de vida em componentes funcionais. Os mais
                comuns são useState e useEffect.
              </p>
            </CardAccordation>
          </AccordionGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Com valor padrão expandido
          </h3>
          <p className="text-text-600">
            Use a prop{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">defaultValue</code>{' '}
            para definir qual item inicia expandido.
          </p>
          <AccordionGroup
            type="single"
            defaultValue="faq-2"
            className="space-y-3"
          >
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Como faço para instalar?
                </Text>
              }
              value="faq-1"
            >
              <div className="space-y-2">
                <p className="text-text-700">
                  Para instalar o componente, execute:
                </p>
                <code className="block bg-gray-900 text-gray-100 p-3 rounded">
                  npm install @analytica/frontend-lib
                </code>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Como uso o componente? (Expandido por padrão)
                </Text>
              }
              value="faq-2"
            >
              <div className="space-y-2">
                <p className="text-text-700">Importe e use em seu código:</p>
                <code className="block bg-gray-900 text-gray-100 p-3 rounded whitespace-pre">
                  {`import { AccordionGroup, CardAccordation } from '@analytica/frontend-lib';

<AccordionGroup type="single">
  <CardAccordation trigger="Item" value="1">
    Content
  </CardAccordation>
</AccordionGroup>`}
                </code>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Quais são as props disponíveis?
                </Text>
              }
              value="faq-3"
            >
              <div className="space-y-2">
                <p className="text-text-700 font-semibold">
                  Props do AccordionGroup:
                </p>
                <ul className="list-disc list-inside space-y-1 text-text-700 ml-4">
                  <li>type: 'single' | 'multiple'</li>
                  <li>defaultValue: string | string[]</li>
                  <li>value: string | string[] (controlled)</li>
                  <li>onValueChange: (value) =&gt; void</li>
                  <li>collapsible: boolean</li>
                </ul>
              </div>
            </CardAccordation>
          </AccordionGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Modo Controlado (Controlled)
          </h3>
          <p className="text-text-600">
            Controle o estado externamente usando as props{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">value</code> e{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">onValueChange</code>
            .
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <p className="text-blue-800">
              <strong>Item expandido atual:</strong> {singleValue || 'Nenhum'}
            </p>
          </div>
          <AccordionGroup
            type="single"
            value={singleValue}
            onValueChange={(value) => {
              setSingleValue(value as string);
              console.log('Valor alterado para:', value);
            }}
            className="space-y-3"
          >
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Seção 1: Introdução
                </Text>
              }
              value="item-1"
            >
              <p className="text-text-700">
                Esta é a seção de introdução. O estado é controlado externamente
                e você pode ver o valor atual no box azul acima.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Seção 2: Desenvolvimento
                </Text>
              }
              value="item-2"
            >
              <p className="text-text-700">
                Esta é a seção de desenvolvimento. Observe que ao abrir este
                item, o anterior fecha automaticamente.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Seção 3: Conclusão
                </Text>
              }
              value="item-3"
            >
              <p className="text-text-700">
                Esta é a seção de conclusão. O controle externo permite
                integração com outros estados da aplicação.
              </p>
            </CardAccordation>
          </AccordionGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Não colapsável (collapsible=false)
          </h3>
          <p className="text-text-600">
            Quando{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">
              collapsible=false
            </code>
            , sempre deve haver um item expandido. Você não pode fechar o item
            atual, apenas trocar para outro.
          </p>
          <AccordionGroup
            type="single"
            defaultValue="tab-1"
            collapsible={false}
            className="space-y-3"
          >
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Tab 1: Perfil
                </Text>
              }
              value="tab-1"
            >
              <div className="space-y-2">
                <h4 className="font-semibold text-text-900">
                  Informações do Perfil
                </h4>
                <p className="text-text-700">
                  Nome: João Silva
                  <br />
                  Email: joao@exemplo.com
                  <br />
                  Função: Desenvolvedor
                </p>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Tab 2: Configurações
                </Text>
              }
              value="tab-2"
            >
              <div className="space-y-2">
                <h4 className="font-semibold text-text-900">Configurações</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-text-700">
                      Notificações por email
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span className="text-text-700">Modo escuro</span>
                  </label>
                </div>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Tab 3: Privacidade
                </Text>
              }
              value="tab-3"
            >
              <div className="space-y-2">
                <h4 className="font-semibold text-text-900">Privacidade</h4>
                <p className="text-text-700">
                  Controle quem pode ver seu perfil e suas atividades.
                </p>
              </div>
            </CardAccordation>
          </AccordionGroup>
        </div>

        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2 mt-12">
          Modo Multiple (Múltiplos abertos)
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Básico - Múltiplos itens podem estar abertos
          </h3>
          <p className="text-text-600">
            No modo "multiple", vários itens podem estar expandidos ao mesmo
            tempo.
          </p>
          <AccordionGroup type="multiple" className="space-y-3">
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  📱 Frontend Development
                </Text>
              }
              value="frontend"
            >
              <div className="space-y-2">
                <p className="text-text-700">
                  Desenvolvimento de interfaces de usuário com React, Vue,
                  Angular.
                </p>
                <ul className="list-disc list-inside text-text-700 ml-4">
                  <li>HTML5 & CSS3</li>
                  <li>JavaScript/TypeScript</li>
                  <li>React & Next.js</li>
                  <li>Tailwind CSS</li>
                </ul>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  ⚙️ Backend Development
                </Text>
              }
              value="backend"
            >
              <div className="space-y-2">
                <p className="text-text-700">
                  Desenvolvimento de APIs e serviços.
                </p>
                <ul className="list-disc list-inside text-text-700 ml-4">
                  <li>Node.js & Express</li>
                  <li>Python & Django</li>
                  <li>Java & Spring Boot</li>
                  <li>PostgreSQL & MongoDB</li>
                </ul>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  ☁️ DevOps & Cloud
                </Text>
              }
              value="devops"
            >
              <div className="space-y-2">
                <p className="text-text-700">
                  Infraestrutura, deployment e automação.
                </p>
                <ul className="list-disc list-inside text-text-700 ml-4">
                  <li>Docker & Kubernetes</li>
                  <li>AWS, Azure, GCP</li>
                  <li>CI/CD Pipelines</li>
                  <li>Terraform</li>
                </ul>
              </div>
            </CardAccordation>
          </AccordionGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Com valores padrão múltiplos
          </h3>
          <p className="text-text-600">
            Use um array no{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">defaultValue</code>{' '}
            para definir múltiplos itens expandidos inicialmente.
          </p>
          <AccordionGroup
            type="multiple"
            defaultValue={['step-1', 'step-2']}
            className="space-y-3"
          >
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  ✅ Passo 1: Criar conta (Expandido)
                </Text>
              }
              value="step-1"
            >
              <div className="space-y-2">
                <p className="text-text-700">
                  Complete o formulário de registro com seus dados pessoais.
                </p>
                <div className="bg-green-50 border-l-4 border-green-400 p-3">
                  <p className="text-green-800 text-sm">
                    ✓ Este passo está expandido por padrão
                  </p>
                </div>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  ✅ Passo 2: Verificar email (Expandido)
                </Text>
              }
              value="step-2"
            >
              <div className="space-y-2">
                <p className="text-text-700">
                  Verifique sua caixa de entrada e clique no link de
                  confirmação.
                </p>
                <div className="bg-green-50 border-l-4 border-green-400 p-3">
                  <p className="text-green-800 text-sm">
                    ✓ Este passo também está expandido por padrão
                  </p>
                </div>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Passo 3: Configurar perfil
                </Text>
              }
              value="step-3"
            >
              <p className="text-text-700">
                Adicione uma foto e complete as informações do seu perfil.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Passo 4: Começar a usar
                </Text>
              }
              value="step-4"
            >
              <p className="text-text-700">
                Explore as funcionalidades e comece a usar a plataforma!
              </p>
            </CardAccordation>
          </AccordionGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Modo Controlado Múltiplo
          </h3>
          <p className="text-text-600">
            Controle múltiplos valores externamente.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <p className="text-blue-800">
              <strong>Itens expandidos:</strong>{' '}
              {multipleValue.length > 0 ? multipleValue.join(', ') : 'Nenhum'}
            </p>
            <p className="text-blue-700 text-sm mt-1">
              Total: {multipleValue.length} item(s)
            </p>
          </div>
          <AccordionGroup
            type="multiple"
            value={multipleValue}
            onValueChange={(value) => {
              setMultipleValue(value as string[]);
              console.log('Valores alterados para:', value);
            }}
            className="space-y-3"
          >
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Item A
                </Text>
              }
              value="item-1"
            >
              <p className="text-text-700">
                Conteúdo do Item A. Você pode ter este e outros itens abertos ao
                mesmo tempo.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Item B
                </Text>
              }
              value="item-2"
            >
              <p className="text-text-700">
                Conteúdo do Item B. Observe o contador acima atualizando
                conforme você abre/fecha itens.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Item C
                </Text>
              }
              value="item-3"
            >
              <p className="text-text-700">
                Conteúdo do Item C. O estado é controlado externamente
                permitindo sincronização complexa.
              </p>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Item D
                </Text>
              }
              value="item-4"
            >
              <p className="text-text-700">
                Conteúdo do Item D. Todos os itens podem estar abertos ou
                fechados simultaneamente.
              </p>
            </CardAccordation>
          </AccordionGroup>
        </div>

        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2 mt-12">
          Casos de Uso Práticos
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            FAQ - Perguntas Frequentes (Single Mode)
          </h3>
          <AccordionGroup type="single" className="space-y-3">
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Qual é a política de devolução?
                </Text>
              }
              value="faq-return"
            >
              <div className="space-y-2">
                <p className="text-text-700">
                  Aceitamos devoluções em até 30 dias após a compra, desde que o
                  produto esteja em perfeito estado e na embalagem original.
                </p>
                <p className="text-text-600 text-sm">
                  Para iniciar uma devolução, entre em contato com nosso
                  suporte.
                </p>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Quais formas de pagamento são aceitas?
                </Text>
              }
              value="faq-payment"
            >
              <div className="space-y-2">
                <p className="text-text-700">Aceitamos:</p>
                <ul className="list-disc list-inside text-text-700 ml-4">
                  <li>
                    Cartão de crédito (Visa, Mastercard, American Express)
                  </li>
                  <li>Cartão de débito</li>
                  <li>PIX</li>
                  <li>Boleto bancário</li>
                </ul>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Quanto tempo leva para entregar?
                </Text>
              }
              value="faq-shipping"
            >
              <div className="space-y-2">
                <p className="text-text-700">
                  O prazo de entrega varia conforme sua região:
                </p>
                <ul className="list-disc list-inside text-text-700 ml-4">
                  <li>Capitais: 3-5 dias úteis</li>
                  <li>Região metropolitana: 5-7 dias úteis</li>
                  <li>Interior: 7-15 dias úteis</li>
                </ul>
              </div>
            </CardAccordation>
          </AccordionGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Filtros de Pesquisa (Multiple Mode)
          </h3>
          <AccordionGroup
            type="multiple"
            defaultValue={['filter-category']}
            className="space-y-3"
          >
            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Categoria
                </Text>
              }
              value="filter-category"
            >
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-text-700">Eletrônicos</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-text-700">Roupas</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-text-700">Livros</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-text-700">Casa & Jardim</span>
                </label>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Faixa de Preço
                </Text>
              }
              value="filter-price"
            >
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="price" />
                  <span className="text-text-700">Até R$ 50</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="price" />
                  <span className="text-text-700">R$ 50 - R$ 100</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="price" />
                  <span className="text-text-700">R$ 100 - R$ 500</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="price" />
                  <span className="text-text-700">Acima de R$ 500</span>
                </label>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Avaliação
                </Text>
              }
              value="filter-rating"
            >
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-text-700">⭐⭐⭐⭐⭐ 5 estrelas</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-text-700">⭐⭐⭐⭐ 4+ estrelas</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-text-700">⭐⭐⭐ 3+ estrelas</span>
                </label>
              </div>
            </CardAccordation>

            <CardAccordation
              trigger={
                <Text size="sm" weight="bold">
                  Marca
                </Text>
              }
              value="filter-brand"
            >
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-text-700">Samsung</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-text-700">Apple</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-text-700">Sony</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-text-700">LG</span>
                </label>
              </div>
            </CardAccordation>
          </AccordionGroup>
        </div>

        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2 mt-12">
          Estrutura Aninhada com Divs
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Agrupamento com Divs e Seções
          </h3>
          <p className="text-text-600">
            Você pode adicionar divs, headers e outros elementos entre o{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">
              AccordionGroup
            </code>{' '}
            e os{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">
              CardAccordation
            </code>
            . O componente injeta as props automaticamente apenas nos accordions
            corretos.
          </p>

          <AccordionGroup type="single" className="space-y-6">
            {/* Seção 1 com header próprio */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">
                📚 Seção de Documentação
              </h4>
              <div className="space-y-2">
                <CardAccordation
                  trigger={
                    <Text size="sm" weight="bold">
                      Guia de Início Rápido
                    </Text>
                  }
                  value="docs-quickstart"
                >
                  <p className="text-text-700">
                    Um guia rápido para começar a usar nossa plataforma em
                    minutos. Inclui instalação, configuração básica e primeiro
                    projeto.
                  </p>
                </CardAccordation>

                <CardAccordation
                  trigger={
                    <Text size="sm" weight="bold">
                      API Reference
                    </Text>
                  }
                  value="docs-api"
                >
                  <p className="text-text-700">
                    Documentação completa da API com todos os endpoints,
                    parâmetros e exemplos de uso.
                  </p>
                </CardAccordation>
              </div>
            </div>

            {/* Seção 2 com header diferente */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="text-lg font-semibold text-green-900 mb-3">
                🎓 Seção de Tutoriais
              </h4>
              <div className="space-y-2">
                <CardAccordation
                  trigger={
                    <Text size="sm" weight="bold">
                      Tutorial para Iniciantes
                    </Text>
                  }
                  value="tutorial-beginner"
                >
                  <p className="text-text-700">
                    Passo a passo detalhado para quem está começando. Sem
                    conhecimento prévio necessário.
                  </p>
                </CardAccordation>

                <CardAccordation
                  trigger={
                    <Text size="sm" weight="bold">
                      Tutorial Avançado
                    </Text>
                  }
                  value="tutorial-advanced"
                >
                  <p className="text-text-700">
                    Técnicas avançadas e melhores práticas para usuários
                    experientes.
                  </p>
                </CardAccordation>
              </div>
            </div>

            {/* Seção 3 */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="text-lg font-semibold text-purple-900 mb-3">
                💡 Seção de Exemplos
              </h4>
              <div className="space-y-2">
                <CardAccordation
                  trigger={
                    <Text size="sm" weight="bold">
                      Exemplos Práticos
                    </Text>
                  }
                  value="examples-practical"
                >
                  <p className="text-text-700">
                    Projetos completos e prontos para usar como base para seus
                    próprios desenvolvimentos.
                  </p>
                </CardAccordation>
              </div>
            </div>
          </AccordionGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Cards Organizados por Categoria
          </h3>
          <AccordionGroup
            type="multiple"
            defaultValue={['category-tech']}
            className="space-y-4"
          >
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💻</span>
                <h4 className="text-lg font-semibold text-blue-900">
                  Tecnologia
                </h4>
              </div>
              <div className="space-y-2">
                <CardAccordation
                  trigger={<Text size="sm">Inteligência Artificial</Text>}
                  value="category-tech"
                >
                  <p className="text-text-700">
                    Descubra as últimas novidades em IA e machine learning.
                  </p>
                </CardAccordation>
                <CardAccordation
                  trigger={<Text size="sm">Desenvolvimento Web</Text>}
                  value="web-dev"
                >
                  <p className="text-text-700">
                    Frameworks modernos e tendências de desenvolvimento.
                  </p>
                </CardAccordation>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎨</span>
                <h4 className="text-lg font-semibold text-green-900">Design</h4>
              </div>
              <div className="space-y-2">
                <CardAccordation
                  trigger={<Text size="sm">UI/UX Design</Text>}
                  value="uiux"
                >
                  <p className="text-text-700">
                    Princípios de design de interface e experiência do usuário.
                  </p>
                </CardAccordation>
                <CardAccordation
                  trigger={<Text size="sm">Design Systems</Text>}
                  value="design-systems"
                >
                  <p className="text-text-700">
                    Criação e manutenção de sistemas de design escaláveis.
                  </p>
                </CardAccordation>
              </div>
            </div>
          </AccordionGroup>
        </div>
      </div>
    </div>
  );
};
