import type { Story } from '@ladle/react';
import { useState, useCallback } from 'react';
import { LessonFilters } from './LessonFilters';
import type { KnowledgeArea, KnowledgeItem } from '../../types/activityFilters';
import type { LessonFiltersData } from '../../types/lessonFilters';

// Mock apiClient used in stories to simulate API responses
const mockApiClient = {
  get: async (url: string) => {
    if (url === '/knowledge/subjects') {
      return { data: { data: mockKnowledgeAreas } };
    }
    return { data: { data: [] } };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: async (url: string, body: any) => {
    if (url === '/knowledge/topics') {
      const subjectIds: string[] = body.subjectIds || [];
      const filteredTopics = mockTopics.filter(() =>
        subjectIds.length > 0 ? true : true
      );
      return { data: { data: filteredTopics } };
    }

    if (url === '/knowledge/subtopics') {
      const topicIds: string[] = body.topicIds || [];
      const filteredSubtopics = mockSubtopics.filter(() =>
        topicIds.length > 0 ? true : true
      );
      return { data: { data: filteredSubtopics } };
    }

    if (url === '/knowledge/contents') {
      const subtopicIds: string[] = body.subtopicIds || [];
      const filteredContents = mockContents.filter(() =>
        subtopicIds.length > 0 ? true : true
      );
      return { data: { data: filteredContents } };
    }

    return { data: { data: [] } };
  },
};

const mockKnowledgeAreas: KnowledgeArea[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    color: '#0066b8',
    icon: 'MathOperations',
  },
  {
    id: 'portugues',
    name: 'Português',
    color: '#00a651',
    icon: 'ChatPT',
  },
  {
    id: 'fisica',
    name: 'Física',
    color: '#8b4513',
    icon: 'Atom',
  },
  {
    id: 'quimica',
    name: 'Química',
    color: '#ff6600',
    icon: 'Flask',
  },
  {
    id: 'biologia',
    name: 'Biologia',
    color: '#00a651',
    icon: 'Microscope',
  },
  {
    id: 'historia',
    name: 'História',
    color: '#8b4513',
    icon: 'Scroll',
  },
];

const mockTopics: KnowledgeItem[] = [
  { id: 'tema-1', name: 'Álgebra' },
  { id: 'tema-2', name: 'Geometria' },
  { id: 'tema-3', name: 'Trigonometria' },
];

const mockSubtopics: KnowledgeItem[] = [
  { id: 'subtema-1', name: 'Equações do 1º grau', topicId: 'tema-1' },
  { id: 'subtema-2', name: 'Equações do 2º grau', topicId: 'tema-1' },
  { id: 'subtema-3', name: 'Triângulos', topicId: 'tema-2' },
  { id: 'subtema-4', name: 'Círculos', topicId: 'tema-2' },
];

const mockContents: KnowledgeItem[] = [
  {
    id: 'assunto-1',
    name: 'Resolução de equações lineares',
    subtopicId: 'subtema-1',
  },
  {
    id: 'assunto-2',
    name: 'Sistemas de equações',
    subtopicId: 'subtema-1',
  },
  {
    id: 'assunto-3',
    name: 'Fórmula de Bhaskara',
    subtopicId: 'subtema-2',
  },
];

/**
 * Showcase principal: LessonFilters com dados padrão
 */
export const AllLessonFilters: Story = () => {
  const [filters, setFilters] = useState<LessonFiltersData>({
    subjectIds: [],
    topicIds: [],
    subtopicIds: [],
    contentIds: [],
  });

  const handleFiltersChange = useCallback((newFilters: LessonFiltersData) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = () => {
    setFilters({
      subjectIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    });
    console.log('Filtros limpos');
  };

  const handleApplyFilters = () => {
    console.log('Aplicando filtros:', filters);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Lesson Filters</h2>
      <p className="text-text-700">
        Componente simplificado de filtros para aulas com suporte a matérias e
        estrutura de conhecimento hierárquica (tema, subtema e assunto)
      </p>

      <div className="flex flex-row gap-8">
        <LessonFilters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiClient={mockApiClient as any}
          onFiltersChange={handleFiltersChange}
          variant="default"
          onClearFilters={handleClearFilters}
          onApplyFilters={handleApplyFilters}
        />

        <div className="flex-1 p-4 bg-background-50 rounded-lg">
          <h3 className="font-bold text-xl text-text-900 mb-4">
            Filtros Selecionados
          </h3>
          <pre className="text-sm text-text-700 overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

/**
 * Showcase: LessonFilters com variante popover
 */
export const LessonFiltersPopover: Story = () => {
  const [filters, setFilters] = useState<LessonFiltersData>({
    subjectIds: [],
    topicIds: [],
    subtopicIds: [],
    contentIds: [],
  });

  const handleFiltersChange = useCallback((newFilters: LessonFiltersData) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = () => {
    setFilters({
      subjectIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    });
    console.log('Filtros limpos');
  };

  const handleApplyFilters = () => {
    console.log('Aplicando filtros:', filters);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Lesson Filters (Popover Variant)
      </h2>
      <p className="text-text-700">
        Variante popover do componente de filtros para aulas
      </p>

      <div className="flex flex-row gap-8">
        <LessonFilters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiClient={mockApiClient as any}
          onFiltersChange={handleFiltersChange}
          variant="popover"
          onClearFilters={handleClearFilters}
          onApplyFilters={handleApplyFilters}
        />

        <div className="flex-1 p-4 bg-background-50 rounded-lg">
          <h3 className="font-bold text-xl text-text-900 mb-4">
            Filtros Selecionados
          </h3>
          <pre className="text-sm text-text-700 overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

/**
 * Showcase: LessonFilters com filtros iniciais
 */
export const LessonFiltersWithInitialFilters: Story = () => {
  const [filters, setFilters] = useState<LessonFiltersData>({
    subjectIds: ['matematica'],
    topicIds: ['tema-1'],
    subtopicIds: ['subtema-1'],
    contentIds: ['assunto-1'],
  });

  const handleFiltersChange = useCallback((newFilters: LessonFiltersData) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = () => {
    setFilters({
      subjectIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    });
    console.log('Filtros limpos');
  };

  const handleApplyFilters = () => {
    console.log('Aplicando filtros:', filters);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Lesson Filters (Com Filtros Iniciais)
      </h2>
      <p className="text-text-700">
        Componente de filtros para aulas com valores iniciais pré-selecionados
      </p>

      <div className="flex flex-row gap-8">
        <LessonFilters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiClient={mockApiClient as any}
          onFiltersChange={handleFiltersChange}
          variant="default"
          initialFilters={filters}
          onClearFilters={handleClearFilters}
          onApplyFilters={handleApplyFilters}
        />

        <div className="flex-1 p-4 bg-background-50 rounded-lg">
          <h3 className="font-bold text-xl text-text-900 mb-4">
            Filtros Selecionados
          </h3>
          <pre className="text-sm text-text-700 overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

/**
 * Showcase: LessonFilters sem botões de ação
 */
export const LessonFiltersWithoutActions: Story = () => {
  const [filters, setFilters] = useState<LessonFiltersData>({
    subjectIds: [],
    topicIds: [],
    subtopicIds: [],
    contentIds: [],
  });

  const handleFiltersChange = useCallback((newFilters: LessonFiltersData) => {
    setFilters(newFilters);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Lesson Filters (Sem Botões de Ação)
      </h2>
      <p className="text-text-700">
        Componente de filtros para aulas sem botões de limpar e filtrar
      </p>

      <div className="flex flex-row gap-8">
        <LessonFilters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiClient={mockApiClient as any}
          onFiltersChange={handleFiltersChange}
          variant="default"
        />

        <div className="flex-1 p-4 bg-background-50 rounded-lg">
          <h3 className="font-bold text-xl text-text-900 mb-4">
            Filtros Selecionados
          </h3>
          <pre className="text-sm text-text-700 overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
