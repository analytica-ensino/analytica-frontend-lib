import { renderHook, act, waitFor } from '@testing-library/react';
import { createUseActivityFiltersData } from './useActivityFiltersData';
import type { BaseApiClient } from '../types/api';
import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';

describe('useActivityFiltersData', () => {
  const mockApiClient: BaseApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const useActivityFiltersData = createUseActivityFiltersData(mockApiClient);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state with empty data', () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      expect(result.current).toMatchObject({
        banks: [],
        bankYears: [],
        loadingBanks: false,
        banksError: null,
        knowledgeAreas: [],
        loadingSubjects: false,
        subjectsError: null,
        knowledgeStructure: {
          topics: [],
          subtopics: [],
          contents: [],
          loading: false,
          error: null,
        },
        knowledgeCategories: [],
        questionTypes: [],
        loadingQuestionTypes: false,
        questionTypesError: null,
        enableSummary: false,
        selectedKnowledgeSummary: {
          topics: [],
          subtopics: [],
          contents: [],
        },
      });

      expect(result.current.loadBanks).toBeInstanceOf(Function);
      expect(result.current.loadKnowledgeAreas).toBeInstanceOf(Function);
      expect(result.current.loadQuestionTypes).toBeInstanceOf(Function);
      expect(result.current.loadTopics).toBeInstanceOf(Function);
      expect(result.current.loadSubtopics).toBeInstanceOf(Function);
      expect(result.current.loadContents).toBeInstanceOf(Function);
      expect(result.current.handleCategoriesChange).toBeInstanceOf(Function);
    });
  });

  describe('loadBanks', () => {
    it('should load vestibular banks successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [
            {
              questionBankName: 'ENEM',
              questionBankYearId: 'year-1',
              year: '2023',
              questionsCount: 50,
            },
            {
              questionBankName: 'ENEM',
              questionBankYearId: 'year-2',
              year: '2022',
              questionsCount: 45,
            },
            {
              questionBankName: 'FUVEST',
              questionBankYearId: 'year-3',
              year: '2023',
              questionsCount: 30,
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadBanks();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/questions/exam-institutions'
      );
      expect(result.current.banks).toHaveLength(2);
      expect(result.current.banks).toEqual([
        {
          id: 'ENEM',
          name: 'ENEM',
          examInstitution: 'ENEM',
        },
        {
          id: 'FUVEST',
          name: 'FUVEST',
          examInstitution: 'FUVEST',
        },
      ]);
      expect(result.current.bankYears).toHaveLength(3);
      expect(result.current.bankYears).toEqual([
        {
          id: 'year-1-ENEM',
          name: '2023',
          bankId: 'ENEM',
        },
        {
          id: 'year-2-ENEM',
          name: '2022',
          bankId: 'ENEM',
        },
        {
          id: 'year-3-FUVEST',
          name: '2023',
          bankId: 'FUVEST',
        },
      ]);
      expect(result.current.loadingBanks).toBe(false);
      expect(result.current.banksError).toBeNull();
    });

    it('should set loading state while fetching banks', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (mockApiClient.get as jest.Mock).mockReturnValueOnce(promise);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      act(() => {
        result.current.loadBanks();
      });

      await waitFor(() => {
        expect(result.current.loadingBanks).toBe(true);
      });

      await act(async () => {
        resolvePromise!({
          data: { message: 'Success', data: [] },
        });
        await promise;
      });

      expect(result.current.loadingBanks).toBe(false);
    });

    it('should handle error when loading banks fails', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadBanks();
      });

      expect(result.current.loadingBanks).toBe(false);
      expect(result.current.banksError).toBe(
        'Erro ao carregar bancas de vestibular'
      );
      expect(result.current.banks).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading vestibular banks:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should skip banks without questionBankName', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [
            {
              questionBankName: '',
              questionBankYearId: 'year-1',
              year: '2023',
              questionsCount: 50,
            },
            {
              questionBankName: 'ENEM',
              questionBankYearId: 'year-2',
              year: '2023',
              questionsCount: 45,
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadBanks();
      });

      expect(result.current.banks).toHaveLength(1);
      expect(result.current.banks[0].name).toBe('ENEM');
      expect(result.current.bankYears).toHaveLength(1);
    });
  });

  describe('loadKnowledgeAreas', () => {
    it('should load knowledge areas successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [
            { id: 'subject-1', name: 'Matemática' },
            { id: 'subject-2', name: 'Física' },
            { id: 'subject-3', name: 'Química' },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadKnowledgeAreas();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/knowledge/subjects');
      expect(result.current.knowledgeAreas).toHaveLength(3);
      expect(result.current.knowledgeAreas).toEqual([
        { id: 'subject-1', name: 'Matemática' },
        { id: 'subject-2', name: 'Física' },
        { id: 'subject-3', name: 'Química' },
      ]);
      expect(result.current.loadingSubjects).toBe(false);
      expect(result.current.subjectsError).toBeNull();
    });

    it('should set loading state while fetching knowledge areas', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (mockApiClient.get as jest.Mock).mockReturnValueOnce(promise);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      act(() => {
        result.current.loadKnowledgeAreas();
      });

      await waitFor(() => {
        expect(result.current.loadingSubjects).toBe(true);
      });

      await act(async () => {
        resolvePromise!({
          data: { message: 'Success', data: [] },
        });
        await promise;
      });

      expect(result.current.loadingSubjects).toBe(false);
    });

    it('should handle error when loading knowledge areas fails', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadKnowledgeAreas();
      });

      expect(result.current.loadingSubjects).toBe(false);
      expect(result.current.subjectsError).toBe(
        'Erro ao carregar áreas de conhecimento'
      );
      expect(result.current.knowledgeAreas).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading knowledge areas:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadQuestionTypes', () => {
    it('should load question types successfully when institutionId is provided', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: {
            questionTypes: ['ALTERNATIVA', 'DISSERTATIVA', 'MULTIPLA_ESCOLHA'],
            isFiltered: true,
          },
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: 'institution-1',
        })
      );

      await act(async () => {
        await result.current.loadQuestionTypes();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/institutions/institution-1/question-types'
      );
      expect(result.current.questionTypes).toHaveLength(3);
      expect(result.current.questionTypes).toEqual([
        QUESTION_TYPE.ALTERNATIVA,
        QUESTION_TYPE.DISSERTATIVA,
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
      ]);
      expect(result.current.loadingQuestionTypes).toBe(false);
      expect(result.current.questionTypesError).toBeNull();
    });

    it('should not load question types when institutionId is not provided', async () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadQuestionTypes();
      });

      expect(mockApiClient.get).not.toHaveBeenCalled();
      expect(result.current.questionTypes).toEqual([]);
      expect(result.current.loadingQuestionTypes).toBe(false);
      expect(result.current.questionTypesError).toBeNull();
    });

    it('should filter out invalid question types', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: {
            questionTypes: [
              'ALTERNATIVA',
              'INVALID_TYPE',
              'DISSERTATIVA',
              'UNKNOWN',
            ],
            isFiltered: true,
          },
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: 'institution-1',
        })
      );

      await act(async () => {
        await result.current.loadQuestionTypes();
      });

      expect(result.current.questionTypes).toHaveLength(2);
      expect(result.current.questionTypes).toEqual([
        QUESTION_TYPE.ALTERNATIVA,
        QUESTION_TYPE.DISSERTATIVA,
      ]);
    });

    it('should handle error when loading question types fails', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: 'institution-1',
        })
      );

      await act(async () => {
        await result.current.loadQuestionTypes();
      });

      expect(result.current.loadingQuestionTypes).toBe(false);
      expect(result.current.questionTypesError).toBe(
        'Erro ao carregar tipos de questões'
      );
      expect(result.current.questionTypes).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading question types:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle lowercase question types', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: {
            questionTypes: ['alternativa', 'dissertativa'],
            isFiltered: true,
          },
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: 'institution-1',
        })
      );

      await act(async () => {
        await result.current.loadQuestionTypes();
      });

      expect(result.current.questionTypes).toEqual([
        QUESTION_TYPE.ALTERNATIVA,
        QUESTION_TYPE.DISSERTATIVA,
      ]);
    });
  });

  describe('loadTopics', () => {
    it('should load topics successfully when subject IDs are provided', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [
            { id: 'topic-1', name: 'Álgebra' },
            { id: 'topic-2', name: 'Geometria' },
          ],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadTopics(['subject-1']);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/knowledge/topics', {
        subjectIds: ['subject-1'],
      });
      expect(result.current.knowledgeStructure.topics).toEqual([
        { id: 'topic-1', name: 'Álgebra' },
        { id: 'topic-2', name: 'Geometria' },
      ]);
      expect(result.current.knowledgeStructure.subtopics).toEqual([]);
      expect(result.current.knowledgeStructure.contents).toEqual([]);
      expect(result.current.knowledgeStructure.loading).toBe(false);
      expect(result.current.knowledgeStructure.error).toBeNull();
    });

    it('should clear knowledge structure when subject IDs are empty', async () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadTopics([]);
      });

      expect(mockApiClient.post).not.toHaveBeenCalled();
      expect(result.current.knowledgeStructure.topics).toEqual([]);
      expect(result.current.knowledgeStructure.subtopics).toEqual([]);
      expect(result.current.knowledgeStructure.contents).toEqual([]);
      expect(result.current.knowledgeCategories).toEqual([]);
    });

    it('should handle error when loading topics fails', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadTopics(['subject-1']);
      });

      expect(result.current.knowledgeStructure.loading).toBe(false);
      expect(result.current.knowledgeStructure.error).toBe(
        'Erro ao carregar temas'
      );
      expect(result.current.knowledgeStructure.topics).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao carregar temas:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadSubtopics', () => {
    it('should load subtopics successfully when topic IDs are provided', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [
            { id: 'subtopic-1', name: 'Equações' },
            { id: 'subtopic-2', name: 'Funções' },
          ],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadSubtopics(['topic-1']);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/knowledge/subtopics', {
        topicIds: ['topic-1'],
      });
      expect(result.current.knowledgeStructure.subtopics).toHaveLength(2);
      expect(result.current.knowledgeStructure.subtopics).toEqual([
        { id: 'subtopic-1', name: 'Equações', topicId: 'topic-1' },
        { id: 'subtopic-2', name: 'Funções', topicId: 'topic-1' },
      ]);
      expect(result.current.knowledgeStructure.contents).toEqual([]);
      expect(result.current.knowledgeStructure.loading).toBe(false);
    });

    it('should clear subtopics when topic IDs are empty', async () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadSubtopics([]);
      });

      expect(mockApiClient.post).not.toHaveBeenCalled();
      expect(result.current.knowledgeStructure.subtopics).toEqual([]);
      expect(result.current.knowledgeStructure.contents).toEqual([]);
    });

    it('should handle duplicate subtopics', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [
            { id: 'subtopic-1', name: 'Equações' },
            { id: 'subtopic-1', name: 'Equações' },
            { id: 'subtopic-2', name: 'Funções' },
          ],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadSubtopics(['topic-1']);
      });

      expect(result.current.knowledgeStructure.subtopics).toHaveLength(2);
    });

    it('should handle error when loading subtopics fails', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadSubtopics(['topic-1']);
      });

      expect(result.current.knowledgeStructure.loading).toBe(false);
      expect(result.current.knowledgeStructure.subtopics).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao carregar subtemas:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadContents', () => {
    it('should load contents successfully when subtopic IDs are provided', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [
            { id: 'content-1', name: 'Equações de 1º grau' },
            { id: 'content-2', name: 'Equações de 2º grau' },
          ],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadContents(['subtopic-1']);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/knowledge/contents', {
        subtopicIds: ['subtopic-1'],
      });
      expect(result.current.knowledgeStructure.contents).toHaveLength(2);
      expect(result.current.knowledgeStructure.contents).toEqual([
        {
          id: 'content-1',
          name: 'Equações de 1º grau',
          subtopicId: 'subtopic-1',
        },
        {
          id: 'content-2',
          name: 'Equações de 2º grau',
          subtopicId: 'subtopic-1',
        },
      ]);
      expect(result.current.knowledgeStructure.loading).toBe(false);
    });

    it('should clear contents when subtopic IDs are empty', async () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadContents([]);
      });

      expect(mockApiClient.post).not.toHaveBeenCalled();
      expect(result.current.knowledgeStructure.contents).toEqual([]);
    });

    it('should handle duplicate contents', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [
            { id: 'content-1', name: 'Equações de 1º grau' },
            { id: 'content-1', name: 'Equações de 1º grau' },
            { id: 'content-2', name: 'Equações de 2º grau' },
          ],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadContents(['subtopic-1']);
      });

      expect(result.current.knowledgeStructure.contents).toHaveLength(2);
    });

    it('should handle error when loading contents fails', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadContents(['subtopic-1']);
      });

      expect(result.current.knowledgeStructure.loading).toBe(false);
      expect(result.current.knowledgeStructure.contents).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao carregar conteúdos:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleCategoriesChange', () => {
    it('should call loadSubtopics when topic selection changes', async () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      const mockSubtopicsResponse = {
        data: {
          message: 'Success',
          data: [{ id: 'subtopic-1', name: 'Equações' }],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(
        mockSubtopicsResponse
      );

      // Manually set up knowledge structure to simulate loaded topics
      await act(async () => {
        await result.current.loadTopics(['subject-1']);
      });

      // Simulate topic selection through handleCategoriesChange
      const updatedCategories = [
        {
          key: 'tema',
          label: 'Tema',
          dependsOn: [],
          itens: [{ id: 'topic-1', name: 'Álgebra' }],
          selectedIds: ['topic-1'],
        },
        {
          key: 'subtema',
          label: 'Subtema',
          dependsOn: ['tema'],
          itens: [],
          filteredBy: [{ key: 'tema', internalField: 'topicId' }],
          selectedIds: [],
        },
        {
          key: 'assunto',
          label: 'Assunto',
          dependsOn: ['subtema'],
          itens: [],
          filteredBy: [{ key: 'subtema', internalField: 'subtopicId' }],
          selectedIds: [],
        },
      ];

      await act(async () => {
        result.current.handleCategoriesChange(updatedCategories);
      });

      await waitFor(
        () => {
          expect(mockApiClient.post).toHaveBeenCalledWith(
            '/knowledge/subtopics',
            {
              topicIds: ['topic-1'],
            }
          );
        },
        { timeout: 3000 }
      );
    });

    it('should call loadContents when subtopic selection changes', async () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      const mockContentsResponse = {
        data: {
          message: 'Success',
          data: [{ id: 'content-1', name: 'Equações de 1º grau' }],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(
        mockContentsResponse
      );

      const updatedCategories = [
        {
          key: 'tema',
          label: 'Tema',
          dependsOn: [],
          itens: [{ id: 'topic-1', name: 'Álgebra' }],
          selectedIds: ['topic-1'],
        },
        {
          key: 'subtema',
          label: 'Subtema',
          dependsOn: ['tema'],
          itens: [{ id: 'subtopic-1', name: 'Equações' }],
          filteredBy: [{ key: 'tema', internalField: 'topicId' }],
          selectedIds: ['subtopic-1'],
        },
        {
          key: 'assunto',
          label: 'Assunto',
          dependsOn: ['subtema'],
          itens: [],
          filteredBy: [{ key: 'subtema', internalField: 'subtopicId' }],
          selectedIds: [],
        },
      ];

      await act(async () => {
        result.current.handleCategoriesChange(updatedCategories);
      });

      await waitFor(
        () => {
          expect(mockApiClient.post).toHaveBeenCalledWith(
            '/knowledge/contents',
            {
              subtopicIds: ['subtopic-1'],
            }
          );
        },
        { timeout: 3000 }
      );
    });

    it('should clear subtopics when no topics are selected', async () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      const mockSubtopicsResponse = {
        data: {
          message: 'Success',
          data: [],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(
        mockSubtopicsResponse
      );

      const updatedCategories = [
        {
          key: 'tema',
          label: 'Tema',
          dependsOn: [],
          itens: [{ id: 'topic-1', name: 'Álgebra' }],
          selectedIds: [],
        },
        {
          key: 'subtema',
          label: 'Subtema',
          dependsOn: ['tema'],
          itens: [],
          filteredBy: [{ key: 'tema', internalField: 'topicId' }],
          selectedIds: [],
        },
        {
          key: 'assunto',
          label: 'Assunto',
          dependsOn: ['subtema'],
          itens: [],
          filteredBy: [{ key: 'subtema', internalField: 'subtopicId' }],
          selectedIds: [],
        },
      ];

      await act(async () => {
        result.current.handleCategoriesChange(updatedCategories);
      });

      await waitFor(
        () => {
          expect(mockApiClient.post).toHaveBeenCalledWith(
            '/knowledge/subtopics',
            {
              topicIds: [],
            }
          );
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Knowledge Categories Auto-update', () => {
    it('should create categories structure when topics are loaded', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [
            { id: 'topic-1', name: 'Álgebra' },
            { id: 'topic-2', name: 'Geometria' },
          ],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadTopics(['subject-1']);
      });

      // Wait for categories to be updated
      await waitFor(
        () => {
          expect(result.current.knowledgeCategories.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      expect(result.current.knowledgeCategories).toHaveLength(3);
      expect(result.current.knowledgeCategories[0].key).toBe('tema');
      expect(result.current.knowledgeCategories[0].itens).toHaveLength(2);
      expect(result.current.knowledgeCategories[1].key).toBe('subtema');
      expect(result.current.knowledgeCategories[2].key).toBe('assunto');
    });

    it('should clear categories when topics are cleared', async () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadTopics([]);
      });

      expect(result.current.knowledgeCategories).toHaveLength(0);
    });
  });

  describe('Selected Knowledge Summary', () => {
    it('should return empty summary when no selections', () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      expect(result.current.selectedKnowledgeSummary).toEqual({
        topics: [],
        subtopics: [],
        contents: [],
      });
    });

    it('should compute summary based on current categories state', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [
            { id: 'topic-1', name: 'Álgebra' },
            { id: 'topic-2', name: 'Geometria' },
          ],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadTopics(['subject-1']);
      });

      await waitFor(
        () => {
          expect(result.current.knowledgeCategories).toHaveLength(3);
        },
        { timeout: 3000 }
      );

      // Initially, summary should be empty (no selections)
      expect(result.current.selectedKnowledgeSummary).toEqual({
        topics: [],
        subtopics: [],
        contents: [],
      });
    });
  });

  describe('Enable Summary', () => {
    it('should enable summary when topics have single item', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [{ id: 'topic-1', name: 'Álgebra' }],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadTopics(['subject-1']);
      });

      await waitFor(
        () => {
          expect(result.current.enableSummary).toBe(true);
        },
        { timeout: 3000 }
      );
    });

    it('should disable summary when topics have multiple items', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [
            { id: 'topic-1', name: 'Álgebra' },
            { id: 'topic-2', name: 'Geometria' },
          ],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadTopics(['subject-1']);
      });

      await waitFor(
        () => {
          expect(result.current.knowledgeStructure.topics).toHaveLength(2);
        },
        { timeout: 3000 }
      );

      expect(result.current.enableSummary).toBe(false);
    });

    it('should disable summary when no items loaded', () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      expect(result.current.enableSummary).toBe(false);
    });
  });

  describe('Effect - selectedSubjects change', () => {
    it('should call loadTopics directly when needed', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          data: [{ id: 'topic-1', name: 'Álgebra' }],
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadTopics(['subject-1']);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/knowledge/topics', {
        subjectIds: ['subject-1'],
      });
      expect(result.current.knowledgeStructure.topics).toHaveLength(1);
    });

    it('should clear structure when loading empty subjects', async () => {
      const { result } = renderHook(() =>
        useActivityFiltersData({
          selectedSubjects: [],
          institutionId: null,
        })
      );

      await act(async () => {
        await result.current.loadTopics([]);
      });

      expect(result.current.knowledgeStructure.topics).toEqual([]);
      expect(result.current.knowledgeStructure.subtopics).toEqual([]);
      expect(result.current.knowledgeStructure.contents).toEqual([]);
      expect(result.current.knowledgeCategories).toEqual([]);
    });
  });

  describe('Hook Factory', () => {
    it('should create hook with provided API client', () => {
      const customApiClient: BaseApiClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const customUseActivityFiltersData =
        createUseActivityFiltersData(customApiClient);

      expect(customUseActivityFiltersData).toBeDefined();
      expect(typeof customUseActivityFiltersData).toBe('function');
    });
  });
});
