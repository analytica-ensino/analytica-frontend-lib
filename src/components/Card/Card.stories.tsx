import type { Story } from '@ladle/react';
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
  CardStatus,
  CardSupport,
  CardTopic,
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
                icon={<Book />}
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
                icon={<Book />}
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
              <CardStatus className="max-w-full" header="Questão 3" />
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
