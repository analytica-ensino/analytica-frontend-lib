import type { Story } from '@ladle/react';
import { BreadcrumbMenu } from './BreadcrumbMenu';
import { BrowserRouter } from 'react-router-dom';
import { useState } from 'react';
import { useBreadcrumbBuilder } from './useBreadcrumbBuilder';

/**
 * Wrapper to provide Router context for BreadcrumbMenu
 */
const BreadcrumbWrapper = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

/**
 * Mock data simulating a performance navigation system
 */
const mockSubjects = [
  { subjectId: '123', subjectName: 'Matemática' },
  { subjectId: '456', subjectName: 'Física' },
  { subjectId: '789', subjectName: 'Química' },
];

const mockTopics = {
  '123': [
    { topicId: '1', topicName: 'Álgebra Linear' },
    { topicId: '2', topicName: 'Geometria Analítica' },
    { topicId: '3', topicName: 'Cálculo Diferencial' },
  ],
  '456': [
    { topicId: '4', topicName: 'Mecânica Clássica' },
    { topicId: '5', topicName: 'Eletromagnetismo' },
  ],
  '789': [
    { topicId: '6', topicName: 'Química Orgânica' },
    { topicId: '7', topicName: 'Química Inorgânica' },
  ],
};

const mockSubtopics = {
  '1': [
    { subtopicId: '10', subtopicName: 'Matrizes e Determinantes' },
    { subtopicId: '11', subtopicName: 'Sistemas Lineares' },
    { subtopicId: '12', subtopicName: 'Espaços Vetoriais' },
  ],
  '2': [
    { subtopicId: '20', subtopicName: 'Coordenadas Cartesianas' },
    { subtopicId: '21', subtopicName: 'Vetores no Plano' },
  ],
  '3': [
    { subtopicId: '30', subtopicName: 'Limites' },
    { subtopicId: '31', subtopicName: 'Derivadas' },
    { subtopicId: '32', subtopicName: 'Integrais' },
  ],
  '4': [
    { subtopicId: '40', subtopicName: 'Cinemática' },
    { subtopicId: '41', subtopicName: 'Dinâmica' },
  ],
  '5': [
    { subtopicId: '50', subtopicName: 'Campo Elétrico' },
    { subtopicId: '51', subtopicName: 'Campo Magnético' },
  ],
  '6': [
    { subtopicId: '60', subtopicName: 'Hidrocarbonetos' },
    { subtopicId: '61', subtopicName: 'Funções Orgânicas' },
  ],
  '7': [
    { subtopicId: '70', subtopicName: 'Ligações Químicas' },
    { subtopicId: '71', subtopicName: 'Compostos Inorgânicos' },
  ],
};

/**
 * Functional Breadcrumb Navigation Demo
 *
 * This story demonstrates how the BreadcrumbMenu works in a real application
 * with hierarchical navigation through subjects, topics, and subtopics.
 */
export const FunctionalDemo: Story = () => {
  // Current navigation state
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [topicId, setTopicId] = useState<string | undefined>(undefined);
  const [subtopicId, setSubtopicId] = useState<string | undefined>(undefined);

  // Get current data based on selected IDs
  const subjectData = subjectId
    ? mockSubjects.find((s) => s.subjectId === subjectId) || null
    : null;
  const topicData = topicId
    ? (mockTopics[subjectId as keyof typeof mockTopics] || []).find(
        (t) => t.topicId === topicId
      ) || null
    : null;
  const subtopicData = subtopicId
    ? (mockSubtopics[topicId as keyof typeof mockSubtopics] || []).find(
        (st) => st.subtopicId === subtopicId
      ) || null
    : null;

  // Build breadcrumbs hierarchically (same logic as real usage)
  const { breadcrumbs, sliceBreadcrumbs } = useBreadcrumbBuilder({
    namespace: 'performance-demo',
    root: { id: 'performance', name: 'Desempenho', url: '/desempenho' },
    levels: [
      {
        data: subjectData,
        urlId: subjectId,
        getId: (data) => data.subjectId,
        getName: (data) => data.subjectName,
        getUrl: (data) => `/desempenho/lista-temas/${data.subjectId}`,
      },
      {
        data: topicData,
        urlId: topicId,
        getId: (data) => data.topicId,
        getName: (data) => data.topicName,
        getUrl: (data, [subjectId]) =>
          `/desempenho/lista-temas/${subjectId}/subtemas/${data.topicId}`,
      },
      {
        data: subtopicData,
        urlId: subtopicId,
        getId: (data) => data.subtopicId,
        getName: (data) => data.subtopicName,
        getUrl: (data, [subjectId, topicId]) =>
          `/desempenho/lista-temas/${subjectId}/subtemas/${topicId}/aulas/${data.subtopicId}`,
      },
    ],
  });

  // Handle breadcrumb click - navigate back to that level
  const handleBreadcrumbClick = (_: unknown, index: number) => {
    sliceBreadcrumbs(index);

    // Reset state based on which level was clicked
    if (index === 0) {
      // Clicked root - reset everything
      setSubjectId(undefined);
      setTopicId(undefined);
      setSubtopicId(undefined);
    } else if (index === 1) {
      // Clicked subject - keep subject, reset topic and subtopic
      setTopicId(undefined);
      setSubtopicId(undefined);
    } else if (index === 2) {
      // Clicked topic - keep subject and topic, reset subtopic
      setSubtopicId(undefined);
    }
  };

  // Get available options for current level
  const availableTopics = subjectId
    ? mockTopics[subjectId as keyof typeof mockTopics] || []
    : [];
  const availableSubtopics = topicId
    ? mockSubtopics[topicId as keyof typeof mockSubtopics] || []
    : [];

  return (
    <BreadcrumbWrapper>
      <div className="flex flex-col gap-8 p-6 max-w-[1000px] mx-auto">
        <div>
          <h2 className="font-bold text-3xl text-text-900 mb-2">
            Functional BreadcrumbMenu Demo
          </h2>
          <p className="text-text-700 mb-4">
            This demonstrates how the BreadcrumbMenu works in a real application
            with hierarchical navigation. Click breadcrumbs to navigate back, or
            use the buttons below to explore deeper levels.
          </p>
        </div>

        {/* Breadcrumb Menu */}
        <div className="border border-text-300 rounded-lg p-4 bg-background-50">
          <BreadcrumbMenu
            breadcrumbs={breadcrumbs}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
        </div>

        {/* Current Navigation State */}
        <div className="p-4 bg-info-100 text-info-900 rounded-lg">
          <h3 className="font-semibold mb-2">Current Navigation State:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Subject:</strong>{' '}
              {subjectData?.subjectName || 'Not selected'}
            </li>
            <li>
              <strong>Topic:</strong> {topicData?.topicName || 'Not selected'}
            </li>
            <li>
              <strong>Subtopic:</strong>{' '}
              {subtopicData?.subtopicName || 'Not selected'}
            </li>
          </ul>
        </div>

        {/* Navigation Controls */}
        <div className="space-y-6">
          {/* Select Subject */}
          {!subjectId && (
            <div>
              <h3 className="font-semibold text-lg text-text-900 mb-3">
                Select a Subject:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {mockSubjects.map((subject) => (
                  <button
                    key={subject.subjectId}
                    onClick={() => {
                      setSubjectId(subject.subjectId);
                      setTopicId(undefined);
                      setSubtopicId(undefined);
                    }}
                    className="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                  >
                    {subject.subjectName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Select Topic */}
          {subjectId && !topicId && availableTopics.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg text-text-900 mb-3">
                Select a Topic in {subjectData?.subjectName}:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {availableTopics.map((topic) => (
                  <button
                    key={topic.topicId}
                    onClick={() => {
                      setTopicId(topic.topicId);
                      setSubtopicId(undefined);
                    }}
                    className="px-4 py-3 bg-success-500 hover:bg-success-600 text-white rounded-lg font-medium transition-colors"
                  >
                    {topic.topicName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Select Subtopic */}
          {topicId && !subtopicId && availableSubtopics.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg text-text-900 mb-3">
                Select a Subtopic in {topicData?.topicName}:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableSubtopics.map((subtopic) => (
                  <button
                    key={subtopic.subtopicId}
                    onClick={() => {
                      setSubtopicId(subtopic.subtopicId);
                    }}
                    className="px-4 py-3 bg-warning-500 hover:bg-warning-600 text-white rounded-lg font-medium transition-colors"
                  >
                    {subtopic.subtopicName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Final Content */}
          {subtopicId && (
            <div className="p-6 border-2 border-success-500 bg-success-50 rounded-lg">
              <h3 className="font-bold text-xl text-success-900 mb-2">
                🎯 Content for: {subtopicData?.subtopicName}
              </h3>
              <p className="text-success-800 mb-4">
                This is where the actual content would be displayed. You&apos;ve
                successfully navigated to the deepest level!
              </p>
              <p className="text-success-700 text-sm">
                <strong>Try this:</strong> Click on any breadcrumb above to
                navigate back to that level. The navigation state will update
                automatically.
              </p>
            </div>
          )}

          {/* Reset Button */}
          {(subjectId || topicId || subtopicId) && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => {
                  setSubjectId(undefined);
                  setTopicId(undefined);
                  setSubtopicId(undefined);
                }}
                className="px-6 py-3 bg-text-700 hover:bg-text-800 text-white rounded-lg font-medium transition-colors"
              >
                🔄 Reset Navigation
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <h4 className="font-semibold text-primary-900 mb-2">
            💡 How to Use This Demo:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-primary-800 text-sm">
            <li>Click on a Subject button to start navigating</li>
            <li>Select a Topic within that subject</li>
            <li>Choose a Subtopic to reach the final content</li>
            <li>Click any breadcrumb to navigate back to that level</li>
            <li>Watch how the breadcrumb trail updates automatically</li>
            <li>Use the Reset button to start over</li>
          </ol>
        </div>
      </div>
    </BreadcrumbWrapper>
  );
};
