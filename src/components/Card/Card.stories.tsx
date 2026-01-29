import type { Story } from '@ladle/react';
import { useState } from 'react';
import { Book, Key, Star } from 'phosphor-react';
import {
  CardActivitiesResults,
  CardAudio,
  CardForum,
  CardPerformance,
  CardProgress,
  CardQuestions,
  CardResults,
  CardSettings,
  CardSimulado,
  CardStatus,
  CardSupport,
  CardTopic,
  CardTest,
  CardSimulationHistory,
} from './Card';
import Badge from '../Badge/Badge';

export const AllCardComponentsShowcase: Story = () => {
  const baseProps = {
    icon: <Star size={16} weight="fill" />,
    title: 'Título',
    subTitle: 'Subtítulo',
    header: 'Header Example',
    description: 'Texto Descrição.',
  };

  const actions: Array<'success' | 'warning' | 'error' | 'info'> = [
    'success',
    'warning',
    'error',
    'info',
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Card Components Library
        </h1>
        <p className="text-text-600 text-lg">
          Biblioteca completa de componentes Card para a plataforma Analytica
        </p>
      </div>
      {/* ===== CARDS COM PROGRESS BAR ===== */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-900 mb-2">
            Cards com Progress Bar
          </h2>
          <p className="text-text-600">
            Componentes que utilizam ProgressBar com variantes blue e green
          </p>
        </div>

        {/* CardProgress */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardProgress
          </h3>

          {/* Exemplo com texto longo para mostrar truncate */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              Exemplo com Texto Longo (Truncate)
            </h4>
            <CardProgress
              className="max-w-xs"
              header="Este é um título muito longo que deve ser truncado quando não cabe no container disponível"
              initialDate="12 Fev 2025"
              endDate="20 Mar 2025"
              progress={65}
              color="#FFB366"
              icon={<Book />}
              progressVariant="blue"
              showDates={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Variante Blue */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                Variante Blue (Padrão)
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Com Datas
                  </h5>
                  <CardProgress
                    className="max-w-full"
                    header="Progresso Horizontal"
                    initialDate="12 Fev 2025"
                    endDate="20 Mar 2025"
                    progress={20}
                    color="subject-16"
                    icon={<Book />}
                    progressVariant="blue"
                    showDates={true}
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Sem Datas
                  </h5>
                  <CardProgress
                    className="max-w-full"
                    header="Progresso Horizontal"
                    progress={20}
                    color="#B7DFFF"
                    icon={<Book />}
                    progressVariant="blue"
                    showDates={false}
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Vertical
                  </h5>
                  <CardProgress
                    className="max-w-full"
                    direction="vertical"
                    header="Progresso Vertical"
                    progress={20}
                    color="#B7DFFF"
                    icon={<Book />}
                    subhead="0 de 3"
                    progressVariant="blue"
                  />
                </div>
              </div>
            </div>

            {/* Variante Green */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                Variante Green
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Com Datas
                  </h5>
                  <CardProgress
                    className="max-w-full"
                    header="Progresso Horizontal"
                    initialDate="12 Fev 2025"
                    endDate="20 Mar 2025"
                    progress={20}
                    color="#B7DFFF"
                    icon={<Book />}
                    progressVariant="green"
                    showDates={true}
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Sem Datas
                  </h5>
                  <CardProgress
                    className="max-w-full"
                    header="Progresso Horizontal"
                    progress={20}
                    color="#B7DFFF"
                    icon={<Book />}
                    progressVariant="green"
                    showDates={false}
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Vertical
                  </h5>
                  <CardProgress
                    className="max-w-full"
                    direction="vertical"
                    header="Progresso Vertical"
                    progress={20}
                    color="#B7DFFF"
                    icon={<Book />}
                    subhead="0 de 3"
                    progressVariant="green"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CardTopic */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardTopic
          </h3>

          {/* Exemplo com texto longo para mostrar truncate */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              Exemplo com Texto Longo (Truncate)
            </h4>
            <CardTopic
              className="max-w-xs"
              header="Este é um título de tópico muito longo que deve ser truncado adequadamente"
              subHead={[
                'Módulo com nome muito longo',
                'Unidade com descrição extensa',
              ]}
              progress={45}
              showPercentage={true}
              progressVariant="blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Variante Blue */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                Variante Blue (Padrão)
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Sem Porcentagem
                  </h5>
                  <CardTopic
                    className="max-w-full"
                    header="Tópico Simples"
                    progress={20}
                    progressVariant="blue"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Com SubHead
                  </h5>
                  <CardTopic
                    subHead={['Módulo 1', 'Unidade 2']}
                    className="max-w-full"
                    header="Tópico com SubHead"
                    progress={20}
                    progressVariant="blue"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Com Porcentagem
                  </h5>
                  <CardTopic
                    className="max-w-full"
                    header="Tópico com %"
                    progress={20}
                    showPercentage
                    progressVariant="blue"
                  />
                </div>
              </div>
            </div>

            {/* Variante Green */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                Variante Green
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Sem Porcentagem
                  </h5>
                  <CardTopic
                    className="max-w-full"
                    header="Tópico Simples"
                    progress={20}
                    progressVariant="green"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Com SubHead
                  </h5>
                  <CardTopic
                    subHead={['Módulo 1', 'Unidade 2']}
                    className="max-w-full"
                    header="Tópico com SubHead"
                    progress={20}
                    progressVariant="green"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Com Porcentagem
                  </h5>
                  <CardTopic
                    className="max-w-full"
                    header="Tópico com %"
                    progress={20}
                    showPercentage
                    progressVariant="green"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CardPerformance */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardPerformance
          </h3>

          {/* Exemplo com texto longo para mostrar truncate */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              Exemplo com Texto Longo (Truncate)
            </h4>
            <CardPerformance
              className="max-w-sm"
              header="Este é um título de desempenho muito longo que demonstra o comportamento de truncate"
              description="Esta é uma descrição muito longa que também deve ser truncada quando não cabe no espaço disponível do card"
              actionVariant="button"
              progress={80}
              progressVariant="green"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Variante Blue */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                Variante Blue (Padrão)
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Sem Progresso + Caret
                  </h5>
                  <CardPerformance
                    className="max-w-full"
                    header="Desempenho Inicial"
                    actionVariant="caret"
                    progressVariant="blue"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Com Progresso + Botão
                  </h5>
                  <CardPerformance
                    className="max-w-full"
                    header="Desempenho com Progresso"
                    actionVariant="button"
                    progress={30}
                    progressVariant="blue"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Com Progresso + Caret
                  </h5>
                  <CardPerformance
                    className="max-w-full"
                    header="Desempenho Completo"
                    actionVariant="caret"
                    progress={30}
                    progressVariant="blue"
                  />
                </div>
              </div>
            </div>

            {/* Variante Green */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                Variante Green
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Sem Progresso + Caret
                  </h5>
                  <CardPerformance
                    className="max-w-full"
                    header="Desempenho Inicial"
                    actionVariant="caret"
                    progressVariant="green"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Com Progresso + Botão
                  </h5>
                  <CardPerformance
                    className="max-w-full"
                    header="Desempenho com Progresso"
                    actionVariant="button"
                    progress={30}
                    progressVariant="green"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-text-700 mb-2">
                    Com Progresso + Caret
                  </h5>
                  <CardPerformance
                    className="max-w-full"
                    header="Desempenho Completo"
                    actionVariant="caret"
                    progress={30}
                    progressVariant="green"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CARDS DE RESULTADOS E STATUS ===== */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-900 mb-2">
            Cards de Resultados e Status
          </h2>
          <p className="text-text-600">
            Componentes para exibir resultados, status e informações
          </p>
        </div>

        {/* CardActivitiesResults */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardActivitiesResults
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {actions.map((action) => (
              <div key={action} className="flex flex-col items-center gap-3">
                <CardActivitiesResults
                  className="w-full max-w-[140px]"
                  {...baseProps}
                  action={action}
                />
                <span className="text-xs font-medium text-text-600 bg-background-50 px-2 py-1 rounded">
                  {action}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-semibold text-text-900 mb-4">
              Versão Compacta (sem extended)
            </h4>
            <p className="text-sm text-text-600 mb-4">
              Sem a prop <code>extended</code>, o card exibe apenas a seção
              colorida com ícone, título e subtítulo — sem borda, fundo branco
              ou seção inferior.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {actions.map((action) => (
                <div
                  key={`${action}-compact`}
                  className="flex flex-col items-center gap-3"
                >
                  <CardActivitiesResults
                    className="w-full max-w-[262px]"
                    {...baseProps}
                    action={action}
                  />
                  <span className="text-xs font-medium text-text-600 bg-background-50 px-2 py-1 rounded">
                    {action} (compact)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-semibold text-text-900 mb-4">
              Versão Estendida
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {actions.map((action) => (
                <div
                  key={`${action}-extended`}
                  className="flex flex-col items-center gap-3"
                >
                  <CardActivitiesResults
                    className="w-full max-w-[262px]"
                    {...baseProps}
                    action={action}
                    extended
                  />
                  <span className="text-xs font-medium text-text-600 bg-background-50 px-2 py-1 rounded">
                    {action} (extended)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CardQuestions */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardQuestions
          </h3>

          {/* Exemplo com texto longo para mostrar truncate */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              Exemplo com Texto Longo (Truncate)
            </h4>
            <div className="max-w-md">
              <CardQuestions
                header="Esta é uma questão com um título muito longo que demonstra como o texto é truncado adequadamente"
                state="done"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Estado: Não Realizado
              </h4>
              <CardQuestions
                className="max-w-full"
                header="Questão de Matemática"
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Estado: Realizado
              </h4>
              <CardQuestions
                className="max-w-full"
                header="Questão de Português"
                state="done"
              />
            </div>
          </div>
        </div>

        {/* CardResults */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardResults
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Layout Vertical (Padrão)
              </h4>
              <CardResults
                className="max-w-full"
                header="Resultado do Teste"
                correct_answers={10}
                incorrect_answers={5}
                icon={'Book'}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Layout Horizontal
              </h4>
              <CardResults
                className="max-w-full"
                header="Resultado do Teste"
                correct_answers={10}
                incorrect_answers={5}
                icon={'Book'}
                direction="row"
              />
            </div>
          </div>
        </div>

        {/* CardStatus */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardStatus
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Status: Correta
              </h4>
              <CardStatus
                className="max-w-full"
                header="Questão 1"
                status="correct"
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Status: Incorreta
              </h4>
              <CardStatus
                className="max-w-full"
                header="Questão 2"
                status="incorrect"
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Sem Status
              </h4>
              <CardStatus
                className="max-w-full"
                header="Questão 3 este é um título muito longo que deve ser truncado adequadamente"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CARDS DE NAVEGAÇÃO E CONFIGURAÇÃO ===== */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-900 mb-2">
            Cards de Navegação e Configuração
          </h2>
          <p className="text-text-600">
            Componentes para navegação, configurações e suporte
          </p>
        </div>

        {/* CardSettings */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardSettings
          </h3>

          <div className="max-w-md">
            <CardSettings
              className="max-w-full"
              header="Configurações da Conta"
              icon={<Book />}
            />
          </div>
        </div>

        {/* CardSupport */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardSupport
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Layout Vertical (Padrão)
              </h4>
              <CardSupport className="max-w-full" header="Suporte Técnico">
                <Badge variant="solid" action="success">
                  Aberto
                </Badge>
                <Badge variant="solid" action="muted" iconLeft={<Key />}>
                  Chave
                </Badge>
              </CardSupport>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Layout Horizontal
              </h4>
              <CardSupport
                className="max-w-full"
                header="Suporte Técnico"
                direction="row"
              >
                <Badge variant="solid" action="success">
                  Aberto
                </Badge>
                <Badge variant="solid" action="muted" iconLeft={<Key />}>
                  Chave
                </Badge>
              </CardSupport>
            </div>
          </div>
        </div>

        {/* CardForum */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardForum
          </h3>

          {/* Exemplo com texto longo para mostrar truncate */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              Exemplo com Texto Longo (Truncate)
            </h4>
            <div className="max-w-md">
              <CardForum
                title="Este é um título de post no fórum muito longo que deve ser truncado adequadamente quando não cabe"
                content="Este é um conteúdo muito longo do post no fórum que demonstra como o text-clamp funciona junto com o truncate para limitar o texto a duas linhas e adicionar reticências quando necessário, garantindo uma boa experiência visual."
                comments={15}
                date="25 Maio 2025"
                hour="09:35"
              />
            </div>
          </div>

          <div className="max-w-lg">
            <CardForum
              className="max-w-full"
              title="Dúvida sobre Matemática"
              content="Olá, estudante! Este é um espaço onde você poderá debater, trocar conhecimento e conversar com seus colegas de turma. Basta criar um post para iniciar!"
              comments={5}
              date="25 Maio 2025"
              hour="09:35"
            />
          </div>
        </div>
      </section>

      {/* ===== CARDS DE SIMULADOS ===== */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-900 mb-2">
            Cards de Simulados
          </h2>
          <p className="text-text-600">
            Componentes para exibir simulados com diferentes estilos
          </p>
        </div>

        {/* CardSimulado */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardSimulado
          </h3>

          {/* Exemplo com texto longo para mostrar truncate */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              Exemplo com Texto Longo (Truncate)
            </h4>
            <div className="max-w-md">
              <CardSimulado
                title="Este é um título de simulado muito longo que deve ser truncado quando não cabe no espaço disponível"
                duration="2h30min"
                info="Informação adicional muito longa que também será truncada adequadamente"
                backgroundColor="enem"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variações de cores */}
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Todas as Variações de Cores
              </h4>
              <div className="space-y-4">
                <CardSimulado
                  title="Simulado ENEM"
                  duration="3h00min"
                  info="180 questões"
                  backgroundColor="enem"
                />
                <CardSimulado
                  title="Simulado Prova"
                  duration="2h30min"
                  info="90 questões"
                  backgroundColor="prova"
                />
                <CardSimulado
                  title="Simulado Simuladão"
                  duration="1h30min"
                  info="Quantidade de questões flexível"
                  backgroundColor="simuladao"
                />
                <CardSimulado
                  title="Simulado Vestibular"
                  duration="4h00min"
                  info="Analytica, Uel, UEM, UEPG, UFPR, Unicentro"
                  backgroundColor="vestibular"
                />
              </div>
            </div>

            {/* Sem duração */}
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Sem Duração
              </h4>
              <div className="space-y-4">
                <CardSimulado
                  title="Simulado ENEM Rápido"
                  info="30 questões rápidas"
                  backgroundColor="enem"
                />
                <CardSimulado
                  title="Simulado Prova Personalizado"
                  info="Quantidade variável"
                  backgroundColor="prova"
                />
                <CardSimulado
                  title="Simulado Simuladão Treino"
                  info="Quantidade de questões flexível"
                  backgroundColor="simuladao"
                />
                <CardSimulado
                  title="Simulado Vestibular Livre"
                  info="Analytica, Uel, UEM, UEPG, UFPR, Unicentro"
                  backgroundColor="vestibular"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CARDS MULTIMÍDIA ===== */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-900 mb-2">
            Cards Multimídia
          </h2>
          <p className="text-text-600">
            Componentes para áudio e conteúdo multimídia
          </p>
        </div>

        {/* CardAudio */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardAudio
          </h3>

          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Sem arquivo de áudio
              </h4>
              <div className="max-w-lg">
                <CardAudio className="max-w-full" />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Com arquivo de áudio
              </h4>
              <div className="max-w-lg">
                <CardAudio
                  className="max-w-full"
                  src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
                  title="Áudio de exemplo"
                />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Com loop
              </h4>
              <div className="max-w-lg">
                <CardAudio
                  className="max-w-full"
                  src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
                  loop
                  title="Áudio com loop"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CARDS DE TESTE ===== */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-900 mb-2">
            Cards de Teste
          </h2>
          <p className="text-text-600">
            Componentes para exibir informações de testes e exames
          </p>
        </div>

        {/* CardTest */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-text-900 border-b border-border-100 pb-2">
            CardTest
          </h3>

          {/* Exemplo com texto longo para mostrar truncate */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-text-900 flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              Exemplo com Texto Longo (Truncate)
            </h4>
            <div className="max-w-md">
              <CardTest
                title="Este é um título de teste muito longo que deve ser truncado quando não cabe no espaço disponível do card"
                duration="0h00"
                additionalInfo="Informação adicional muito longa que também será truncada adequadamente"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card com duração */}
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Com Duração
              </h4>
              <CardTest
                title="Linguagens e Códigos, Ciências Humanas e Redação"
                duration="0h00"
                questionsCount={90}
              />
            </div>

            {/* Card sem duração */}
            <div>
              <h4 className="text-lg font-semibold text-text-900 mb-4">
                Sem Duração
              </h4>
              <CardTest
                title="Ciências da Natureza e Matemática"
                questionsCount={90}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-text-900">
              Diferentes Larguras
            </h4>

            <div className="space-y-4">
              <div className="max-w-sm">
                <CardTest
                  title="Teste Pequeno"
                  duration="1h30"
                  questionsCount={20}
                />
              </div>

              <div className="max-w-lg">
                <CardTest
                  title="Teste Médio com mais informações"
                  duration="2h45"
                  questionsCount={60}
                />
              </div>

              <div className="max-w-4xl">
                <CardTest
                  title="Teste Grande - Linguagens e Códigos, Ciências Humanas e Redação"
                  duration="3h00"
                  questionsCount={180}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const CardSimuladoInteractive: Story = () => {
  const handleClick = (title: string) => {
    console.log(`Simulado clicado: ${title}`);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-900 mb-4">
          Card Simulado - Interativo
        </h2>
        <p className="text-text-600 text-lg">
          Clique nos cards para ver a interação no console
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <CardSimulado
          title="Simulado ENEM 2025 - Completo"
          duration="5h00min"
          info="180 questões + redação"
          backgroundColor="enem"
          onClick={() => handleClick('Simulado ENEM 2025 - Completo')}
        />

        <CardSimulado
          title="Simulado Prova Matemática"
          duration="1h30min"
          info="45 questões de matemática"
          backgroundColor="prova"
          onClick={() => handleClick('Simulado Prova Matemática')}
        />

        <CardSimulado
          title="Simulado Simuladão Ciências da Natureza"
          duration="2h00min"
          info="60 questões de física, química e biologia"
          backgroundColor="simuladao"
          onClick={() => handleClick('Simulado Simuladão Ciências da Natureza')}
        />

        <CardSimulado
          title="Simulado Vestibular Linguagens"
          info="45 questões sem limite de tempo"
          backgroundColor="vestibular"
          onClick={() => handleClick('Simulado Vestibular Linguagens')}
        />
      </div>

      <div className="max-w-2xl mx-auto bg-background-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-text-900 mb-2">
          Recursos do CardSimulado
        </h3>
        <ul className="space-y-2 text-text-700">
          <li>
            • Suporta 4 tipos de simulados diferentes (ENEM, Prova, Simuladão,
            Vestibular)
          </li>
          <li>• Campo de duração opcional com ícone de relógio</li>
          <li>• Textos longos são truncados automaticamente</li>
          <li>• Hover effect com sombra suave</li>
          <li>• Ícone de seta indicando ação de navegação</li>
          <li>• Totalmente acessível com suporte a teclado</li>
        </ul>
      </div>
    </div>
  );
};

export const CardAudioInteractive: Story = () => {
  const handlePlay = () => {
    console.log('Áudio iniciado');
  };

  const handlePause = () => {
    console.log('Áudio pausado');
  };

  const handleEnded = () => {
    console.log('Áudio finalizado');
  };

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    console.log(`Tempo atual: ${currentTime}s, Duração total: ${duration}s`);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-900 mb-4">
          Card Audio - Interativo
        </h2>
        <p className="text-text-600 text-lg">
          Teste os callbacks do componente CardAudio
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="bg-background-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-text-900 mb-2">
            Áudio com callbacks
          </h3>
          <p className="text-sm text-text-600 mb-4">
            Abra o console do navegador para ver os logs dos eventos
          </p>
          <CardAudio
            src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
            title="Áudio interativo"
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onAudioTimeUpdate={handleTimeUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export const CardTestInteractive: Story = () => {
  const [selectedCards, setSelectedCards] = useState({
    linguagens: false,
    ciencias: false,
    matematica: false,
  });

  const handleCardSelect = (cardId: string, selected: boolean) => {
    setSelectedCards((prev) => ({
      ...prev,
      [cardId]: selected,
    }));
    console.log(
      `CardTest ${cardId} ${selected ? 'selecionado' : 'desselecionado'}`
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-900 mb-4">
          CardTest - Interativo
        </h2>
        <p className="text-text-600 text-lg">
          Cards com funcionalidade de seleção e outline visual
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <CardTest
          title="Linguagens e Códigos, Ciências Humanas e Redação"
          duration="0h00"
          questionsCount={90}
          selected={selectedCards.linguagens}
          onSelect={(selected) => handleCardSelect('linguagens', selected)}
          className="hover:shadow-lg transition-shadow"
        />

        <CardTest
          title="Ciências da Natureza e Matemática"
          duration="0h00"
          questionsCount={90}
          selected={selectedCards.ciencias}
          onSelect={(selected) => handleCardSelect('ciencias', selected)}
          className="hover:shadow-lg transition-shadow"
        />

        <CardTest
          title="Matemática e suas Tecnologias"
          questionsCount={45}
          selected={selectedCards.matematica}
          onSelect={(selected) => handleCardSelect('matematica', selected)}
          className="hover:shadow-lg transition-shadow"
        />
      </div>

      <div className="max-w-2xl mx-auto bg-background-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-text-900 mb-2">
          Estado atual da seleção
        </h3>
        <p className="text-text-700 mb-4">
          Cards selecionados:{' '}
          {Object.entries(selectedCards)
            .filter(([, selected]) => selected)
            .map(([cardId]) => cardId)
            .join(', ') || 'Nenhum'}
        </p>

        <h3 className="text-xl font-semibold text-text-900 mb-2">
          Recursos do CardTest
        </h3>
        <ul className="space-y-2 text-text-700">
          <li>• Campo de duração opcional com ícone de relógio</li>
          <li>• Textos longos são truncados automaticamente</li>
          <li>• Layout responsivo e flexível</li>
          <li>• Sombra suave conforme especificação</li>
          <li>• Seleção visual com ring azul (outline)</li>
          <li>• Suporte completo a teclado (Enter e Space)</li>
          <li>• Estado focus visível para acessibilidade</li>
          <li>• Callback onSelect para controle do estado</li>
          <li>• Role de button e aria-pressed para screen readers</li>
        </ul>
      </div>
    </div>
  );
};

export const CardSimulationHistoryInteractive: Story = () => {
  const mockData = [
    {
      date: '12 Fev',
      simulations: [
        {
          id: '1',
          title: 'Simulado Enem #42',
          type: 'enem' as const,
          info: '45 de 90 corretas',
        },
        {
          id: '2',
          title: 'Prova no sábado',
          type: 'prova' as const,
          info: '08 de 10 corretas',
        },
      ],
    },
    {
      date: '10 Fev',
      simulations: [
        {
          id: '3',
          title: 'Atividade extra',
          type: 'simulado' as const,
          info: '45 de 90 corretas',
        },
        {
          id: '4',
          title: 'Teste',
          type: 'vestibular' as const,
          info: '08 de 10 corretas',
        },
      ],
    },
    {
      date: '20 Jan',
      simulations: [
        {
          id: '5',
          title: 'Teste Enem',
          type: 'enem' as const,
          info: '70 de 90 corretas',
        },
        {
          id: '6',
          title: 'Um nome para teste muito grande que deveria ser truncado',
          type: 'enem' as const,
          info: '70 de 90 corretas',
        },
        {
          id: '7',
          title: 'Teste',
          type: 'vestibular' as const,
          info: '08 de 10 corretas',
        },
      ],
    },
  ];

  const handleSimulationClick = (simulation: {
    id: string;
    title: string;
    type: 'enem' | 'prova' | 'simulado' | 'vestibular';
    info: string;
  }) => {
    console.log('Simulação clicada:', simulation);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-900 mb-4">
          Card Simulation History - Histórico de Simulados
        </h2>
        <p className="text-text-600 text-lg">
          Componente para exibir histórico de simulados agrupados por data
        </p>
      </div>

      <div className="flex justify-center">
        <CardSimulationHistory
          data={mockData}
          onSimulationClick={handleSimulationClick}
          className="mx-auto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-background-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-text-900 mb-4">
            Estado Vazio
          </h3>

          <div className="space-y-4">
            <CardSimulationHistory
              data={[]}
              className="scale-75 transform-gpu"
            />
          </div>
        </div>

        <div className="bg-background-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-text-900 mb-4">
            Tipos de Simulado
          </h3>

          <div className="space-y-4">
            <CardSimulationHistory
              data={[
                {
                  date: '01 Jan',
                  simulations: [
                    {
                      id: 'demo-1',
                      title: 'Simulado ENEM',
                      type: 'enem' as const,
                      info: '45 de 90 corretas',
                    },
                    {
                      id: 'demo-2',
                      title: 'Prova Mensal',
                      type: 'prova' as const,
                      info: '08 de 10 corretas',
                    },
                    {
                      id: 'demo-3',
                      title: 'Simulado Geral',
                      type: 'simulado' as const,
                      info: '30 de 40 corretas',
                    },
                    {
                      id: 'demo-4',
                      title: 'Vestibular FUVEST',
                      type: 'vestibular' as const,
                      info: '15 de 20 corretas',
                    },
                  ],
                },
              ]}
              className="scale-75 transform-gpu"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-background-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-text-900 mb-2">
          Recursos do CardSimulationHistory
        </h3>
        <ul className="space-y-2 text-text-700">
          <li>• Agrupamento automático de simulações por data</li>
          <li>• 4 tipos de simulados com cores e badges específicas</li>
          <li>• Badges com outline seguindo design system</li>
          <li>• Hover effects e transições suaves</li>
          <li>• Textos longos truncados automaticamente</li>
          <li>• Layout responsivo com max-width configurável</li>
          <li>• Callback para clique em simulação</li>
          <li>• Footer arredondado quando há dados</li>
          <li>• Suporte completo a acessibilidade</li>
          <li>• Ícones de navegação com CaretRight</li>
        </ul>
      </div>
    </div>
  );
};
