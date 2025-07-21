import type { Story } from '@ladle/react';
import { CardAccordation } from './Accordation';

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
            <CardAccordation title="Informações Básicas">
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
            <CardAccordation title="Detalhes do Produto">
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
            title="Seção Importante (Expandida)"
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
            <CardAccordation title="Tarefas Pendentes">
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
            <CardAccordation title="Configurações Avançadas">
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
          <CardAccordation title="Relatório de Vendas">
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
            <CardAccordation title="Como posso alterar minha senha?">
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

            <CardAccordation title="Como cancelar minha assinatura?">
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

            <CardAccordation title="Posso usar em projetos comerciais?">
              <p className="text-text-700">
                Sim! Nossos componentes são licenciados sob MIT License,
                permitindo uso comercial. Você pode usar, modificar e distribuir
                sem restrições.
              </p>
            </CardAccordation>

            <CardAccordation title="Como obter suporte técnico?">
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
            title="Accordion com Callback"
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
      </div>
    </div>
  );
};
