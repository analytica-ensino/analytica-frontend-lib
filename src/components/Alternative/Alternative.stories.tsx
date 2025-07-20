import type { Story } from '@ladle/react';
import { AlternativesList } from './Alternative';

export const AllAlternativesShowcase: Story = () => {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Alternatives Component Library
        </h1>
        <p className="text-text-600 text-lg">
          Componente de lista de alternativas para questões e formulários
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2">
          Modo Interativo
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Layout Padrão
            </h3>
            <AlternativesList
              name="interactive-default"
              defaultValue="int-def-2"
              onValueChange={(value) =>
                console.log('Padrão selecionado:', value)
              }
              alternatives={[
                {
                  value: 'int-def-1',
                  label:
                    'Esta é uma primeira alternativa extremamente longa que demonstra como o componente se comporta quando temos textos muito extensos que podem quebrar em múltiplas linhas, testando a responsividade e layout do design system',
                },
                {
                  value: 'int-def-2',
                  label:
                    'A segunda alternativa também conta com um texto bastante extenso para verificarmos se o alinhamento, espaçamento e quebra de linha funcionam adequadamente em diferentes tamanhos de tela e contextos de uso do nosso sistema de design',
                },
                {
                  value: 'int-def-3',
                  label:
                    'Terceira alternativa igualmente longa que serve para testarmos cenários onde o usuário precisa ler muito conteúdo antes de tomar uma decisão, verificando se a experiência do usuário permanece fluida e intuitiva mesmo com textos extensos',
                },
                {
                  value: 'int-def-4',
                  label:
                    'Por fim, a quarta alternativa também apresenta um texto substancialmente longo para garantir que nosso componente mantenha consistência visual e funcional independentemente da quantidade de conteúdo apresentado ao usuário final',
                },
              ]}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Layout Compacto
            </h3>
            <AlternativesList
              name="interactive-compact"
              layout="compact"
              onValueChange={(value) =>
                console.log('Compacto selecionado:', value)
              }
              alternatives={[
                {
                  value: 'int-comp-1',
                  label:
                    'Opção A com texto muito longo para testar o comportamento do layout compacto quando temos conteúdo extenso que precisa ser exibido de forma condensada mas ainda legível',
                },
                {
                  value: 'int-comp-2',
                  label:
                    'Opção B igualmente extensa para verificar como múltiplas alternativas com textos longos se comportam no layout compacto, mantendo a usabilidade e clareza visual',
                },
                {
                  value: 'int-comp-3',
                  label:
                    'Opção C com descrição detalhada e extensa que testa os limites do layout compacto em termos de quantidade de texto e quebra de linha automática',
                },
                {
                  value: 'int-comp-4',
                  label:
                    'Opção D desabilitada mas com texto longo para verificar como estados desabilitados se comportam com conteúdo extenso no layout compacto',
                  disabled: true,
                },
              ]}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Layout Detalhado
          </h3>
          <AlternativesList
            name="interactive-detailed"
            layout="detailed"
            defaultValue="int-det-1"
            onValueChange={(value) =>
              console.log('Detalhado selecionado:', value)
            }
            alternatives={[
              {
                value: 'int-det-1',
                label:
                  'Análise Completa e Extremamente Detalhada - Primeira Opção com Título Extenso que Demonstra Como Textos Longos São Tratados no Layout Detalhado',
                description:
                  'Esta é uma descrição incrivelmente detalhada e extensa da primeira opção que vai muito além do usual. Aqui explicamos não apenas os conceitos básicos, mas também as implicações profundas da escolha, as consequências a longo prazo, os benefícios e desvantagens, considerações técnicas específicas, aspectos metodológicos relevantes, e como esta opção se relaciona com outras alternativas disponíveis. O objetivo é testar como o componente lida com descrições muito longas que podem ocupar várias linhas e requerer scrolling ou quebra inteligente de texto.',
              },
              {
                value: 'int-det-2',
                label:
                  'Análise Completa e Minuciosa - Segunda Opção com Denominação Extensa para Verificação de Comportamento Visual e Funcional em Cenários Complexos',
                description:
                  'Descrição extraordinariamente abrangente da segunda alternativa que inclui informações complementares sobre múltiplos aspectos do tema abordado. Esta descrição cobre não apenas os fundamentos teóricos, mas também aplicações práticas, casos de uso específicos, limitações conhecidas, vantagens competitivas, requisitos técnicos detalhados, considerações de implementação, impacto nos usuários finais, métricas de sucesso esperadas, e uma análise comparativa com outras metodologias disponíveis no mercado atual.',
              },
              {
                value: 'int-det-3',
                label:
                  'Análise Completa e Exaustiva - Terceira Opção com Nomenclatura Elaborada que Testa os Limites de Apresentação de Conteúdo no Sistema de Design',
                description:
                  'Uma alternativa neutra apresentada com explicações extremamente detalhadas sobre sua relevância multifacetada no contexto da questão proposta. Esta descrição aborda diversos ângulos de análise incluindo aspectos históricos, evolução metodológica, tendências atuais de mercado, pesquisas acadêmicas relevantes, estudos de caso práticos, feedback de usuários experientes, recomendações de especialistas da área, considerações regulatórias aplicáveis, e projeções futuras baseadas em dados empíricos coletados ao longo de extensos períodos de observação e experimentação controlada.',
              },
              {
                value: 'int-det-4',
                label:
                  'Análise Completa mas Temporariamente Indisponível - Quarta Opção com Título Extenso para Demonstração de Estados Desabilitados em Contextos Complexos',
                description:
                  'Esta opção apresenta uma descrição completa e detalhada mesmo estando temporariamente desabilitada para fins de demonstração. O texto extenso serve para verificar como o componente trata visualmente conteúdo longo quando a interação está bloqueada. Inclui informações sobre os motivos da indisponibilidade, cronograma previsto para reativação, critérios necessários para habilitação, processos de validação envolvidos, e instruções alternativas para usuários que precisam de funcionalidade similar através de outros caminhos disponíveis na plataforma.',
                disabled: true,
              },
            ]}
          />
        </div>

        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2 mt-12">
          Modo Readonly - Visualização de Respostas
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Usuário Acertou
            </h3>
            <AlternativesList
              mode="readonly"
              selectedValue="readonly-correct"
              alternatives={[
                {
                  value: 'readonly-wrong1',
                  label:
                    'Opção A - Alternativa não selecionada pelo usuário que contém texto longo para testar como o modo readonly apresenta opções não escolhidas com conteúdo extenso',
                },
                {
                  value: 'readonly-correct',
                  label:
                    'Opção B - Esta foi a escolha correta do usuário! Texto longo demonstrando como alternativas corretas são destacadas visualmente no modo readonly quando o usuário acerta a questão',
                  status: 'correct',
                },
                {
                  value: 'readonly-wrong2',
                  label:
                    'Opção C - Outra alternativa não selecionada com texto substancialmente longo para verificar consistência visual entre opções não escolhidas no modo de visualização',
                },
                {
                  value: 'readonly-wrong3',
                  label:
                    'Opção D - Mais uma alternativa não selecionada apresentada com texto extenso para teste completo do comportamento do componente em modo somente leitura',
                },
              ]}
            />
            <p className="text-sm text-text-600">
              Radio selecionado + badge "Resposta correta"
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Usuário Errou
            </h3>
            <AlternativesList
              mode="readonly"
              selectedValue="readonly-user-wrong"
              alternatives={[
                {
                  value: 'readonly-correct2',
                  label:
                    'Opção A - Esta era a resposta correta que o usuário deveria ter selecionado, apresentada com texto longo para demonstrar como respostas corretas não selecionadas são exibidas',
                  status: 'correct',
                },
                {
                  value: 'readonly-wrong4',
                  label:
                    'Opção B - Alternativa neutra não selecionada pelo usuário, com texto extenso para manter consistência visual com outras opções no modo readonly',
                },
                {
                  value: 'readonly-user-wrong',
                  label:
                    'Opção C - Esta foi a escolha incorreta do usuário, apresentada com texto longo para demonstrar como erros são sinalizados visualmente no sistema',
                },
                {
                  value: 'readonly-wrong5',
                  label:
                    'Opção D - Mais uma alternativa não selecionada com texto substancial para completar o cenário de teste do modo readonly com erro do usuário',
                },
              ]}
            />
            <p className="text-sm text-text-600">
              Opção A: badge "Resposta correta" (radio não selecionado)
              <br />
              Opção C: radio selecionado + badge "Resposta incorreta"
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Readonly - Layout Detalhado (Usuário Errou)
          </h3>
          <AlternativesList
            mode="readonly"
            selectedValue="detailed-user-wrong"
            layout="detailed"
            alternatives={[
              {
                value: 'detailed-correct',
                label:
                  'Análise Detalhada e Aprofundada - Opção A Correta Não Selecionada com Título Extenso para Teste de Layout Readonly Detalhado',
                description:
                  'Esta era a resposta absolutamente correta que o usuário deveria ter identificado e selecionado. A descrição extensa serve para demonstrar como o componente apresenta visualmente informações completas sobre a alternativa correta mesmo quando não foi escolhida pelo usuário. Inclui explicações detalhadas sobre por que esta opção é a mais adequada, fundamentação teórica sólida, evidências empíricas de suporte, casos de sucesso documentados, e orientações para futuras situações similares. O badge de resposta correta aparece mas o radio não está selecionado, criando uma clara distinção visual entre o que era correto e o que foi escolhido.',
                status: 'correct',
              },
              {
                value: 'detailed-neutral1',
                label:
                  'Análise Detalhada e Abrangente - Opção B Neutra com Denominação Extensa para Verificação de Comportamento em Modo Readonly Detalhado',
                description:
                  'Opção neutra que não foi selecionada pelo usuário, apresentada com descrição extremamente detalhada para testar como alternativas não escolhidas e sem status específico são renderizadas no modo readonly detalhado. Esta descrição inclui informações contextuais relevantes, considerações metodológicas aplicáveis, limitações conhecidas da abordagem, cenários onde poderia ser aplicável, e comparações com outras alternativas disponíveis. O objetivo é verificar se a apresentação visual mantém clareza e hierarquia apropriada mesmo com muito conteúdo textual.',
              },
              {
                value: 'detailed-user-wrong',
                label:
                  'Análise Detalhada e Específica - Opção C Escolhida Incorretamente pelo Usuário com Título Longo para Demonstração de Estado de Erro',
                description:
                  'Esta foi a escolha específica do usuário, mas infelizmente estava incorreta. A descrição extensa demonstra como o componente trata visualmente alternativas selecionadas erroneamente no modo readonly detalhado. O texto inclui informações sobre por que esta opção pode parecer atrativa à primeira vista, armadilhas comuns que levam a esta escolha, diferenças sutis em relação à resposta correta, e orientações educativas para evitar erros similares no futuro. O radio aparece selecionado e o badge de resposta incorreta é exibido, criando feedback visual claro sobre o erro cometido.',
              },
              {
                value: 'detailed-neutral2',
                label:
                  'Análise Detalhada e Complementar - Opção D Adicional com Nomenclatura Elaborada para Completar Cenário de Teste Readonly Detalhado',
                description:
                  'Outra opção neutra não selecionada pelo usuário, apresentada com descrição minuciosa para completar o cenário de teste do modo readonly detalhado. Esta descrição aborda aspectos complementares do tema, metodologias alternativas de abordagem, considerações específicas para diferentes contextos de aplicação, e informações adicionais que enriquecem o entendimento geral do assunto. Serve para verificar se o componente mantém consistência visual e funcional mesmo quando apresenta múltiplas alternativas com conteúdo textual extenso.',
              },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Readonly Compacto - Usuário Acertou
            </h3>
            <AlternativesList
              mode="readonly"
              layout="compact"
              selectedValue="compact-correct"
              alternatives={[
                {
                  value: 'compact-wrong1',
                  label:
                    'Opção A com texto longo para verificar como o layout compacto readonly trata alternativas não selecionadas quando há muito conteúdo textual',
                },
                {
                  value: 'compact-correct',
                  label:
                    'Opção B - Resposta correta selecionada pelo usuário com texto extenso demonstrando sucesso no layout compacto readonly',
                  status: 'correct',
                },
                {
                  value: 'compact-wrong2',
                  label:
                    'Opção C apresentada com texto substancialmente longo para testar consistência visual no modo readonly compacto',
                },
                {
                  value: 'compact-wrong3',
                  label:
                    'Opção D com descrição extensa para completar o teste de comportamento do layout compacto em modo somente leitura',
                },
              ]}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Readonly Compacto - Usuário Errou
            </h3>
            <AlternativesList
              mode="readonly"
              layout="compact"
              selectedValue="compact-user-wrong"
              alternatives={[
                {
                  value: 'compact-correct2',
                  label:
                    'Opção A - Esta era a resposta correta não selecionada, apresentada com texto longo no layout compacto readonly',
                  status: 'correct',
                },
                {
                  value: 'compact-neutral',
                  label:
                    'Opção B neutra com texto extenso para verificar como alternativas sem status são exibidas no modo compacto readonly',
                },
                {
                  value: 'compact-user-wrong',
                  label:
                    'Opção C - Escolha incorreta do usuário com texto longo demonstrando feedback de erro no layout compacto',
                },
                {
                  value: 'compact-neutral2',
                  label:
                    'Opção D adicional com descrição extensa para completar cenário de teste do layout compacto readonly',
                },
              ]}
            />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2 mt-12">
          Casos de Uso Específicos
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Com Componente Controlado
            </h3>
            <AlternativesList
              name="controlled-example"
              value="controlled-2"
              onValueChange={(value) =>
                console.log('Controlado mudou para:', value)
              }
              alternatives={[
                {
                  value: 'controlled-1',
                  label:
                    'Alternativa controlada A com texto extremamente longo para demonstrar como componentes controlados se comportam com conteúdo textual extenso',
                },
                {
                  value: 'controlled-2',
                  label:
                    'Alternativa controlada B (atualmente selecionada) apresentada com descrição detalhada e extensa para verificar comportamento de seleção controlada',
                },
                {
                  value: 'controlled-3',
                  label:
                    'Alternativa controlada C com texto substancial para completar teste de componente controlado com conteúdo longo',
                },
              ]}
            />
            <p className="text-sm text-text-600">
              Exemplo de componente controlado com prop `value`
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Todas Desabilitadas
            </h3>
            <AlternativesList
              name="disabled-example"
              disabled={true}
              defaultValue="disabled-1"
              alternatives={[
                {
                  value: 'disabled-1',
                  label:
                    'Alternativa desabilitada A com texto muito longo para verificar como estados desabilitados são apresentados quando há conteúdo textual extenso',
                },
                {
                  value: 'disabled-2',
                  label:
                    'Alternativa desabilitada B apresentada com descrição detalhada para testar comportamento visual de grupos totalmente desabilitados',
                },
                {
                  value: 'disabled-3',
                  label:
                    'Alternativa desabilitada C com texto substancialmente longo para completar cenário de teste de estado desabilitado global',
                },
              ]}
            />
            <p className="text-sm text-text-600">
              Exemplo com todo o grupo desabilitado
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Demonstração Completa - Layout Detalhado
          </h3>
          <AlternativesList
            name="mixed-status"
            layout="detailed"
            onValueChange={(value) => console.log('Seleção:', value)}
            alternatives={[
              {
                value: 'mixed-1',
                label:
                  'Primeira Alternativa com Denominação Extensa e Detalhada para Demonstração Completa de Funcionalidades do Componente',
                description:
                  'Esta é a primeira alternativa disponível para seleção, apresentada com uma descrição incrivelmente detalhada e abrangente que serve para testar como o componente lida com grandes volumes de texto descritivo. A descrição inclui múltiplos aspectos relevantes, considerações técnicas específicas, implicações de uso, benefícios esperados, limitações conhecidas, e orientações detalhadas para implementação adequada. O objetivo é verificar se a interface permanece limpa e usável mesmo com conteúdo textual muito extenso.',
              },
              {
                value: 'mixed-2',
                label:
                  'Segunda Alternativa Apresentada com Título Longo e Específico para Teste Abrangente de Comportamento Visual e Funcional',
                description:
                  'Esta é a segunda alternativa disponível que conta com uma descrição minuciosa e extremamente detalhada para verificar como múltiplas opções com conteúdo extenso são apresentadas visualmente. A descrição cobre diversos tópicos relacionados incluindo fundamentos teóricos, aplicações práticas, estudos de caso relevantes, melhores práticas recomendadas, métricas de sucesso, considerações de performance, e análise comparativa com outras abordagens disponíveis no mercado atual.',
              },
              {
                value: 'mixed-3',
                label:
                  'Terceira Alternativa com Nomenclatura Elaborada e Extensa que Demonstra Comportamento Padrão em Cenários Complexos',
                description:
                  'Esta alternativa foi especificamente criada para demonstrar o comportamento padrão do componente quando apresentado com conteúdo textual substancial. A descrição inclui informações abrangentes sobre metodologias aplicáveis, processos de validação, critérios de avaliação, requisitos técnicos, considerações de usabilidade, feedback de usuários, resultados de testes, e recomendações baseadas em pesquisa empírica. Serve como referência para verificar se o design permanece consistente e funcional independentemente da quantidade de conteúdo.',
              },
              {
                value: 'mixed-4',
                label:
                  'Alternativa Temporariamente Desabilitada com Título Extenso para Verificação de Estados Especiais em Contextos Complexos',
                description:
                  'Esta alternativa está temporariamente desabilitada e não pode ser selecionada no momento, mas apresenta uma descrição completa e detalhada para demonstrar como o componente trata visualmente opções indisponíveis com conteúdo extenso. A descrição inclui informações sobre os critérios para reativação, processos necessários para habilitação, cronograma previsto, alternativas disponíveis, e instruções detalhadas para usuários que precisam de funcionalidade similar através de outros caminhos da plataforma.',
                disabled: true,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// Story para casos específicos de readonly
export const ReadonlyExamples: Story = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-900 mb-2">
          Exemplos Readonly
        </h1>
        <p className="text-text-600">
          Demonstrações específicas do modo readonly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Cenário: Acerto Total
          </h3>
          <AlternativesList
            mode="readonly"
            selectedValue="acerto-total"
            alternatives={[
              {
                value: 'acerto-total',
                label:
                  'Resposta correta selecionada pelo usuário com texto muito longo demonstrando sucesso completo na identificação da alternativa adequada',
                status: 'correct',
              },
              {
                value: 'acerto-outras1',
                label:
                  'Outras opções disponíveis não selecionadas apresentadas com texto extenso para manter consistência visual no cenário de acerto',
              },
              {
                value: 'acerto-outras2',
                label:
                  'Mais opções complementares com descrição detalhada para completar o cenário de teste de acerto total do usuário',
              },
            ]}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Cenário: Erro Total
          </h3>
          <AlternativesList
            mode="readonly"
            selectedValue="erro-escolha"
            alternatives={[
              {
                value: 'erro-correta',
                label:
                  'Esta era a alternativa correta que o usuário deveria ter identificado, apresentada com texto longo para demonstrar feedback educativo',
                status: 'correct',
              },
              {
                value: 'erro-escolha',
                label:
                  'Usuário escolheu esta alternativa incorreta com texto extenso demonstrando como erros são sinalizados visualmente no sistema',
              },
              {
                value: 'erro-outras',
                label:
                  'Outras opções disponíveis não selecionadas apresentadas com texto detalhado para completar cenário de erro do usuário',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// Story para layouts
export const LayoutExamples: Story = () => {
  const sampleAlternatives = [
    {
      value: 'layout-1',
      label:
        'Primeira alternativa com título extremamente longo e detalhado para teste abrangente de comportamento em diferentes layouts',
      description:
        'Descrição incrivelmente detalhada e extensa da primeira opção que inclui múltiplos aspectos relevantes, considerações técnicas específicas, implicações de implementação, benefícios esperados, limitações conhecidas, melhores práticas recomendadas, estudos de caso práticos, feedback de usuários experientes, análise comparativa com outras soluções, e orientações completas para uso adequado em diferentes contextos e cenários de aplicação.',
    },
    {
      value: 'layout-2',
      label:
        'Segunda alternativa apresentada com nomenclatura elaborada e extensa para verificação de consistência visual entre layouts',
      description:
        'Descrição minuciosa e abrangente da segunda opção que cobre diversos tópicos relacionados incluindo fundamentos teóricos sólidos, aplicações práticas demonstradas, metodologias validadas, processos de implementação detalhados, critérios de avaliação específicos, métricas de sucesso mensuráveis, considerações de performance técnica, requisitos de infraestrutura, e análise detalhada de viabilidade em diferentes ambientes operacionais.',
    },
    {
      value: 'layout-3',
      label:
        'Terceira alternativa com título substancialmente longo para demonstração completa de capacidades de layout do componente',
      description:
        'Descrição extraordinariamente completa da terceira opção que aborda múltiplas dimensões do problema incluindo aspectos históricos relevantes, evolução das práticas, tendências atuais de mercado, pesquisas acadêmicas recentes, evidências empíricas coletadas, estudos longitudinais realizados, feedback qualitativo de stakeholders, análise quantitativa de resultados, projeções futuras baseadas em dados, e recomendações estratégicas para implementação efetiva.',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-900 mb-2">
          Layouts Disponíveis
        </h1>
        <p className="text-text-600">Comparação entre os diferentes layouts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">Default</h3>
          <AlternativesList
            name="layout-default"
            layout="default"
            alternatives={sampleAlternatives}
            onValueChange={(value) => console.log('Default:', value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">Compact</h3>
          <AlternativesList
            name="layout-compact"
            layout="compact"
            alternatives={sampleAlternatives}
            onValueChange={(value) => console.log('Compact:', value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">Detailed</h3>
          <AlternativesList
            name="layout-detailed"
            layout="detailed"
            alternatives={sampleAlternatives}
            onValueChange={(value) => console.log('Detailed:', value)}
          />
        </div>
      </div>
    </div>
  );
};
