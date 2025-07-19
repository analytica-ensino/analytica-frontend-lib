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
            <h3 className="text-xl font-semibold text-text-800">Layout Padrão</h3>
            <AlternativesList
              name="interactive-default"
              defaultValue="int-def-2"
              onValueChange={(value) => console.log('Padrão selecionado:', value)}
              alternatives={[
                { 
                  value: "int-def-1", 
                  label: "Primeira alternativa"
                },
                { 
                  value: "int-def-2", 
                  label: "Segunda alternativa"
                },
                { 
                  value: "int-def-3", 
                  label: "Terceira alternativa"
                },
                { 
                  value: "int-def-4", 
                  label: "Quarta alternativa"
                }
              ]}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">Layout Compacto</h3>
            <AlternativesList
              name="interactive-compact"
              layout="compact"
              onValueChange={(value) => console.log('Compacto selecionado:', value)}
              alternatives={[
                { 
                  value: "int-comp-1", 
                  label: "Opção A"
                },
                { 
                  value: "int-comp-2", 
                  label: "Opção B"
                },
                { 
                  value: "int-comp-3", 
                  label: "Opção C"
                },
                { 
                  value: "int-comp-4", 
                  label: "Opção D",
                  disabled: true
                }
              ]}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">Layout Detalhado</h3>
          <AlternativesList
            name="interactive-detailed"
            layout="detailed"
            defaultValue="int-det-1"
            onValueChange={(value) => console.log('Detalhado selecionado:', value)}
            alternatives={[
              { 
                value: "int-det-1", 
                label: "Análise Completa - Primeira Opção",
                description: "Esta é uma descrição detalhada da primeira opção, explicando os conceitos e implicações da escolha."
              },
              { 
                value: "int-det-2", 
                label: "Análise Completa - Segunda Opção",
                description: "Descrição da segunda alternativa com informações complementares sobre o tema abordado."
              },
              { 
                value: "int-det-3", 
                label: "Análise Completa - Terceira Opção",
                description: "Uma alternativa neutra com explicações sobre sua relevância no contexto da questão."
              },
              { 
                value: "int-det-4", 
                label: "Análise Completa - Quarta Opção",
                description: "Esta opção está desabilitada para demonstração do estado inativo.",
                disabled: true
              }
            ]}
          />
        </div>

        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2 mt-12">
          Modo Readonly - Visualização de Respostas
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">Usuário Acertou</h3>
            <AlternativesList
              mode="readonly"
              selectedValue="readonly-correct"
              alternatives={[
                { 
                  value: "readonly-wrong1", 
                  label: "Opção A - Não selecionada"
                },
                { 
                  value: "readonly-correct", 
                  label: "Opção B - Usuário acertou!",
                  status: "correct"
                },
                { 
                  value: "readonly-wrong2", 
                  label: "Opção C - Não selecionada"
                },
                { 
                  value: "readonly-wrong3", 
                  label: "Opção D - Não selecionada"
                }
              ]}
            />
            <p className="text-sm text-text-600">
              Radio selecionado + badge "Resposta correta"
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">Usuário Errou</h3>
            <AlternativesList
              mode="readonly"
              selectedValue="readonly-user-wrong"
              alternatives={[
                { 
                  value: "readonly-correct2", 
                  label: "Opção A - Esta era a correta",
                  status: "correct"
                },
                { 
                  value: "readonly-wrong4", 
                  label: "Opção B - Não selecionada"
                },
                { 
                  value: "readonly-user-wrong", 
                  label: "Opção C - Escolha do usuário"
                },
                { 
                  value: "readonly-wrong5", 
                  label: "Opção D - Não selecionada"
                }
              ]}
            />
            <p className="text-sm text-text-600">
              Opção A: badge "Resposta correta" (radio não selecionado)<br/>
              Opção C: radio selecionado + badge "Resposta incorreta"
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">Readonly - Layout Detalhado (Usuário Errou)</h3>
          <AlternativesList
            mode="readonly"
            selectedValue="detailed-user-wrong"
            layout="detailed"
            alternatives={[
              { 
                value: "detailed-correct", 
                label: "Análise Detalhada - Opção A",
                description: "Esta era a resposta correta. Mostra o badge de resposta correta mas o radio não está selecionado.",
                status: "correct"
              },
              { 
                value: "detailed-neutral1", 
                label: "Análise Detalhada - Opção B",
                description: "Opção neutra que não foi selecionada pelo usuário."
              },
              { 
                value: "detailed-user-wrong", 
                label: "Análise Detalhada - Opção C",
                description: "Esta foi a escolha do usuário, mas estava incorreta. Radio selecionado + badge de resposta incorreta."
              },
              { 
                value: "detailed-neutral2", 
                label: "Análise Detalhada - Opção D",
                description: "Outra opção neutra não selecionada."
              }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">Readonly Compacto - Usuário Acertou</h3>
            <AlternativesList
              mode="readonly"
              layout="compact"
              selectedValue="compact-correct"
              alternatives={[
                { 
                  value: "compact-wrong1", 
                  label: "Opção A"
                },
                { 
                  value: "compact-correct", 
                  label: "Opção B - Correta",
                  status: "correct"
                },
                { 
                  value: "compact-wrong2", 
                  label: "Opção C"
                },
                { 
                  value: "compact-wrong3", 
                  label: "Opção D"
                }
              ]}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">Readonly Compacto - Usuário Errou</h3>
            <AlternativesList
              mode="readonly"
              layout="compact"
              selectedValue="compact-user-wrong"
              alternatives={[
                { 
                  value: "compact-correct2", 
                  label: "Opção A - Correta",
                  status: "correct"
                },
                { 
                  value: "compact-neutral", 
                  label: "Opção B"
                },
                { 
                  value: "compact-user-wrong", 
                  label: "Opção C - Escolhida"
                },
                { 
                  value: "compact-neutral2", 
                  label: "Opção D"
                }
              ]}
            />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2 mt-12">
          Casos de Uso Específicos
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">Com Componente Controlado</h3>
            <AlternativesList
              name="controlled-example"
              value="controlled-2"
              onValueChange={(value) => console.log('Controlado mudou para:', value)}
              alternatives={[
                { 
                  value: "controlled-1", 
                  label: "Alternativa controlada A"
                },
                { 
                  value: "controlled-2", 
                  label: "Alternativa controlada B (selecionada)"
                },
                { 
                  value: "controlled-3", 
                  label: "Alternativa controlada C"
                }
              ]}
            />
            <p className="text-sm text-text-600">
              Exemplo de componente controlado com prop `value`
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">Todas Desabilitadas</h3>
                         <AlternativesList
               name="disabled-example"
               disabled={true}
               defaultValue="disabled-1"
               alternatives={[
                 { 
                   value: "disabled-1", 
                   label: "Alternativa desabilitada A"
                 },
                 { 
                   value: "disabled-2", 
                   label: "Alternativa desabilitada B"
                 },
                 { 
                   value: "disabled-3", 
                   label: "Alternativa desabilitada C"
                 }
               ]}
             />
            <p className="text-sm text-text-600">
              Exemplo com todo o grupo desabilitado
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">Demonstração Completa - Layout Detalhado</h3>
                     <AlternativesList
             name="mixed-status"
             layout="detailed"
             onValueChange={(value) => console.log('Seleção:', value)}
             alternatives={[
               { 
                 value: "mixed-1", 
                 label: "Primeira Alternativa",
                 description: "Esta é a primeira alternativa disponível para seleção."
               },
               { 
                 value: "mixed-2", 
                 label: "Segunda Alternativa",
                 description: "Esta é a segunda alternativa com descrição detalhada."
               },
               { 
                 value: "mixed-3", 
                 label: "Terceira Alternativa",
                 description: "Esta alternativa demonstra o comportamento padrão do componente."
               },
               { 
                 value: "mixed-4", 
                 label: "Alternativa Desabilitada",
                 description: "Esta alternativa está desabilitada e não pode ser selecionada.",
                 disabled: true
               }
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
          <h3 className="text-xl font-semibold text-text-800">Cenário: Acerto Total</h3>
          <AlternativesList
            mode="readonly"
            selectedValue="acerto-total"
            alternatives={[
              { 
                value: "acerto-total", 
                label: "Resposta correta selecionada",
                status: "correct"
              },
              { 
                value: "acerto-outras1", 
                label: "Outras opções"
              },
              { 
                value: "acerto-outras2", 
                label: "Mais opções"
              }
            ]}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">Cenário: Erro Total</h3>
          <AlternativesList
            mode="readonly"
            selectedValue="erro-escolha"
            alternatives={[
              { 
                value: "erro-correta", 
                label: "Esta era a correta",
                status: "correct"
              },
              { 
                value: "erro-escolha", 
                label: "Usuário escolheu esta (errada)"
              },
              { 
                value: "erro-outras", 
                label: "Outras opções"
              }
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
       value: "layout-1", 
       label: "Primeira alternativa",
       description: "Descrição da primeira opção"
     },
     { 
       value: "layout-2", 
       label: "Segunda alternativa",
       description: "Descrição da segunda opção"
     },
     { 
       value: "layout-3", 
       label: "Terceira alternativa",
       description: "Descrição da terceira opção"
     }
   ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-900 mb-2">
          Layouts Disponíveis
        </h1>
        <p className="text-text-600">
          Comparação entre os diferentes layouts
        </p>
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
