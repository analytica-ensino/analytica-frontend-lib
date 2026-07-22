import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    // Main bundle
    index: 'src/index.ts',

    // Individual components
    'Alert/index': 'src/components/Alert/Alert.tsx',
    'Badge/index': 'src/components/Badge/Badge.tsx',
    'Button/index': 'src/components/Button/Button.tsx',
    'CheckBox/index': 'src/components/CheckBox/CheckBox.tsx',
    'Chips/index': 'src/components/Chips/Chips.tsx',
    'Divider/index': 'src/components/Divider/Divider.tsx',
    'DropdownMenu/index': 'src/components/DropdownMenu/DropdownMenu.tsx',
    'IconButton/index': 'src/components/IconButton/IconButton.tsx',
    'IconRoundedButton/index':
      'src/components/IconRoundedButton/IconRoundedButton.tsx',
    'IconRender/index': 'src/components/IconRender/IconRender.tsx',
    'Input/index': 'src/components/Input/Input.tsx',
    'LatexRenderer/index': 'src/components/LatexRenderer/LatexRenderer.tsx',
    'SubjectInfo/index': 'src/components/SubjectInfo/SubjectInfo.tsx',
    'NavButton/index': 'src/components/NavButton/NavButton.tsx',
    'Search/index': 'src/components/Search/Search.tsx',
    'ProgressBar/index': 'src/components/ProgressBar/ProgressBar.tsx',
    'LoadingModal/index': 'src/components/LoadingModal/loadingModal.tsx',
    'ProgressCircle/index': 'src/components/ProgressCircle/ProgressCircle.tsx',
    'ProgressModal/index': 'src/components/ProgressModal/ProgressModal.tsx',
    'ScoreCircle/index': 'src/components/ScoreCircle/ScoreCircle.tsx',
    'ImagePreviewCard/index':
      'src/components/ImagePreviewCard/ImagePreviewCard.tsx',
    'Radio/index': 'src/components/Radio/Radio.tsx',
    'SelectionButton/index':
      'src/components/SelectionButton/SelectionButton.tsx',
    'Select/index': 'src/components/Select/Select.tsx',
    'Table/index': 'src/components/Table/Table.tsx',
    'Table/TablePagination/index': 'src/components/Table/TablePagination.tsx',
    'TableProvider/index': 'src/components/TableProvider/TableProvider.tsx',
    'Text/index': 'src/components/Text/Text.tsx',
    'TextArea/index': 'src/components/TextArea/TextArea.tsx',
    'Toast/index': 'src/components/Toast/Toast.tsx',
    'Tooltip/index': 'src/components/Tooltip/Tooltip.tsx',
    'TruncatedText/index': 'src/components/TruncatedText/TruncatedText.tsx',
    'Menu/index': 'src/components/Menu/Menu.tsx',
    'Modal/index': 'src/components/Modal/Modal.tsx',
    'Modal/utils/videoUtils/index': 'src/components/Modal/utils/videoUtils.ts',
    'CorrectActivityModal/index':
      'src/components/CorrectActivityModal/CorrectActivityModal.tsx',
    'FileAttachment/index': 'src/components/FileAttachment/FileAttachment.tsx',
    'Card/index': 'src/components/Card/Card.tsx',
    'StatisticsCard/index': 'src/components/StatisticsCard/StatisticsCard.tsx',
    'StudentRanking/index': 'src/components/StudentRanking/StudentRanking.tsx',
    'QuestionsData/index': 'src/components/QuestionsData/QuestionsData.tsx',
    'SimpleBarChart/index': 'src/components/SimpleBarChart/SimpleBarChart.tsx',
    'VerticalBarChart/index':
      'src/components/VerticalBarChart/VerticalBarChart.tsx',
    'ProficiencyChart/index':
      'src/components/ProficiencyChart/ProficiencyChart.tsx',
    'Calendar/index': 'src/components/Calendar/Calendar.tsx',
    'Stepper/index': 'src/components/Stepper/Stepper.tsx',
    'Skeleton/index': 'src/components/Skeleton/Skeleton.tsx',
    'NotificationCard/index':
      'src/components/NotificationCard/NotificationCard.tsx',
    'CalendarCard/index': 'src/components/CalendarCard/CalendarCard.tsx',
    'NotFound/index': 'src/components/NotFound/NotFound.tsx',
    'NoSearchResult/index': 'src/components/NoSearchResult/NoSearchResult.tsx',
    'EmptyState/index': 'src/components/EmptyState/EmptyState.tsx',
    'VideoPlayer/index': 'src/components/VideoPlayer/VideoPlayer.tsx',
    'Whiteboard/index': 'src/components/Whiteboard/Whiteboard.tsx',
    'DownloadButton/index': 'src/components/DownloadButton/DownloadButton.tsx',
    'RichEditor/index': 'src/components/RichEditor/index.ts',
    'Auth/index': 'src/components/Auth/Auth.tsx',
    'Quiz/index': 'src/components/Quiz/Quiz.tsx',
    'Quiz/useQuizStore/index': 'src/components/Quiz/useQuizStore.ts',
    'utils/index': 'src/utils/utils.ts',

    'MultipleChoice/index': 'src/components/MultipleChoice/MultipleChoice.tsx',
    'AlertManager/index': 'src/components/AlertManager/AlertsManager.tsx',
    'AlertManagerView/index':
      'src/components/AlertManagerView/AlertsManagerView.tsx',
    'AppHeader/index': 'src/components/AppHeader/AppHeader.tsx',
    'AppLayout/index': 'src/components/AppLayout/AppLayout.tsx',
    // Hooks
    'hooks/useMobile/index': 'src/hooks/useMobile.ts',
    'hooks/useTheme/index': 'src/hooks/useTheme.ts',
    'hooks/useBrandingLogo/index': 'src/hooks/useBrandingLogo.ts',
    'BrandingLogo/index': 'src/components/BrandingLogo/BrandingLogo.tsx',
    'UserIcon/index': 'src/components/UserIcon/UserIcon.tsx',
    'BreadcrumbMenu/index': 'src/components/BreadcrumbMenu/BreadcrumbMenu.tsx',
    'BreadcrumbMenu/useBreadcrumbBuilder/index':
      'src/components/BreadcrumbMenu/useBreadcrumbBuilder.ts',
    'BreadcrumbMenu/useUrlParams/index':
      'src/components/BreadcrumbMenu/useUrlParams.ts',
    'BreadcrumbMenu/breadcrumbStore/index':
      'src/components/BreadcrumbMenu/breadcrumbStore.ts',
    'hooks/useQuestionsList/index': 'src/hooks/useQuestionsList.ts',
    // Individual Auth components
    'ThemeToggle/index': 'src/components/ThemeToggle/ThemeToggle.tsx',
    'Auth/AuthProvider/index': 'src/components/Auth/Auth.tsx',
    'Auth/ProtectedRoute/index': 'src/components/Auth/Auth.tsx',
    'Auth/PublicRoute/index': 'src/components/Auth/Auth.tsx',
    'Auth/withAuth/index': 'src/components/Auth/Auth.tsx',
    'Auth/useAuth/index': 'src/components/Auth/Auth.tsx',
    'Auth/useAuthGuard/index': 'src/components/Auth/Auth.tsx',
    'Auth/useRouteAuth/index': 'src/components/Auth/Auth.tsx',
    'Auth/getRootDomain/index': 'src/components/Auth/Auth.tsx',
    'Auth/zustandAuthAdapter/index':
      'src/components/Auth/zustandAuthAdapter.ts',
    'Auth/useUrlAuthentication/index':
      'src/components/Auth/useUrlAuthentication.ts',
    'Auth/useApiConfig/index': 'src/components/Auth/useApiConfig.ts',

    'Accordation/index': 'src/components/Accordation/Accordation.tsx',
    'Alternative/index': 'src/components/Alternative/Alternative.tsx',
    'AlertDialog/index': 'src/components/AlertDialog/AlertDialog.tsx',
    'ActivityFilters/index':
      'src/components/ActivityFilters/ActivityFilters.tsx',
    'ActivityDetails/index':
      'src/components/ActivityDetails/ActivityDetails.tsx',
    'ActivityPreview/index':
      'src/components/ActivityPreview/ActivityPreview.tsx',
    'ActivityCardQuestionPreview/index':
      'src/components/ActivityCardQuestionPreview/ActivityCardQuestionPreview.tsx',
    'ActivityCardQuestionBanks/index':
      'src/components/ActivityCardQuestionBanks/ActivityCardQuestionBanks.tsx',
    // Toast utils
    'Toast/Toaster/index': 'src/components/Toast/utils/Toaster.tsx',
    'Toast/ToastStore/index': 'src/components/Toast/utils/ToastStore.ts',

    // Support
    'Support/index': 'src/components/Support/index.ts',
    'Support/TicketModal/index':
      'src/components/Support/components/TicketModal.tsx',
    'types/support/index': 'src/types/support.ts',

    // SendActivityModal
    'SendActivityModal/index': 'src/components/SendActivityModal/index.ts',
    'SendActivityModal/types': 'src/components/SendActivityModal/types.ts',
    'SendActivityModal/validation':
      'src/components/SendActivityModal/validation.ts',
    'SendActivityModal/hooks/useSendActivityModal':
      'src/components/SendActivityModal/hooks/useSendActivityModal.ts',
    'SendActivityModal/SendActivityModal':
      'src/components/SendActivityModal/SendActivityModal.tsx',

    // RecommendedLessonsHistory
    'RecommendedLessonsHistory/index':
      'src/components/RecommendedLessonsHistory/index.ts',
    'hooks/useRecommendedLessons/index': 'src/hooks/useRecommendedLessons.ts',
    'hooks/useRecommendedLessonsPage/index':
      'src/hooks/useRecommendedLessonsPage.ts',
    'hooks/useRecommendedClassDrafts/index':
      'src/hooks/useRecommendedClassDrafts.ts',
    'types/recommendedLessons/index': 'src/types/recommendedLessons.ts',

    // ActivityPageLayout
    'ActivityPageLayout/index':
      'src/components/ActivityPageLayout/ActivityPageLayout.tsx',

    // Simulations (teacher-facing list + nested detail modal)
    'SimulationsPage/index': 'src/components/SimulationsPage/index.ts',
    'hooks/useSimulations/index': 'src/hooks/useSimulations.ts',
    'types/simulations/index': 'src/types/simulations.ts',

    // ActivitiesHistory
    'ActivitiesHistory/index': 'src/components/ActivitiesHistory/index.ts',
    'hooks/useActivitiesHistory/index': 'src/hooks/useActivitiesHistory.ts',
    'hooks/useActivityModels/index': 'src/hooks/useActivityModels.ts',
    'types/activitiesHistory/index': 'src/types/activitiesHistory.ts',

    // Activities types
    'types/activities/index': 'src/types/activities.ts',

    // SendActivity hook and types
    'types/sendActivity/index': 'src/types/sendActivity.ts',
    'hooks/useSendActivity/index': 'src/hooks/useSendActivity.ts',

    // StudentPerformanceDetailsModal
    'StudentPerformanceDetailsModal/index':
      'src/components/StudentPerformanceDetailsModal/index.ts',

    // StudentLessonProgressModal
    'StudentLessonProgressModal/index':
      'src/components/StudentLessonProgressModal/index.ts',

    // DownloadModal
    'DownloadModal/index': 'src/components/DownloadModal/DownloadModal.tsx',

    // PrintableUsersTable
    'PrintableUsersTable/index':
      'src/components/PrintableUsersTable/PrintableUsersTable.tsx',

    // ChoroplethMap
    'ChoroplethMap/index': 'src/components/ChoroplethMap/ChoroplethMap.tsx',

    // Map Data
    'hooks/useMapData/index': 'src/hooks/useMapData.ts',
    'types/mapData/index': 'src/types/mapData.ts',

    // Report Export
    'utils/exportExcel/index': 'src/utils/exportExcel.ts',
    'utils/exportPdf/index': 'src/utils/exportPdf.ts',

    // Chatbot (student AI assistant)
    'Chatbot/index': 'src/components/Chatbot/Chatbot.tsx',
    'hooks/useChatbot/index': 'src/hooks/useChatbot.ts',
    'types/chatbot/index': 'src/types/chatbot.ts',

    // Accessibility Widget
    'AccessibilityWidget/index':
      'src/components/AccessibilityWidget/AccessibilityWidget.tsx',
    'hooks/useA11yPreferences/index': 'src/hooks/useA11yPreferences.ts',
    'hooks/useA11yKeyboardShortcut/index':
      'src/hooks/useA11yKeyboardShortcut.ts',
    'hooks/useTTS/index': 'src/hooks/useTTS.ts',

    // Stores (consumed directly by the apps; needed as subpaths so importing a
    // single store does not pull the whole barrel)
    'store/authStore/index': 'src/store/authStore.ts',
    'store/appStore/index': 'src/store/appStore.ts',
    'store/userStore/index': 'src/store/userStore.ts',
    'store/notificationStore/index': 'src/store/notificationStore.ts',
    'store/themeStore/index': 'src/store/themeStore.ts',

    // Enums / shared types consumed directly by the apps
    'enums/SubjectEnum/index': 'src/enums/SubjectEnum.ts',
    'types/questions/index': 'src/types/questions.ts',
    'types/questionTypes/index': 'src/types/questionTypes.ts',
    'types/chat/index': 'src/types/chat.ts',

    // Support / Zendesk (consumed directly by the apps)
    'ZendeskWidget/index': 'src/components/ZendeskWidget/ZendeskWidget.tsx',
    'hooks/useSupportFeatureFlag/index': 'src/hooks/useSupportFeatureFlag.ts',
    'hooks/useZendesk/index': 'src/hooks/useZendesk.ts',

    // Profile labels (per-institution custom nomenclatura)
    'hooks/useProfileLabels/index': 'src/hooks/useProfileLabels.ts',
    'types/profileLabels/index': 'src/types/profileLabels.ts',

    // ============================================================
    // Bundle migration: subpath entries for symbols consumed by the
    // apps. Grouped by kind for legibility. Each entry maps a public
    // subpath to the source file that DEFINES the consumed symbol(s),
    // listed in the trailing comment.
    // ============================================================

    // === migration: Components ===
    'AccessReportModal/index': 'src/components/AccessReportModal/AccessReportModal.tsx', // AccessReportModal, AccessReportProfessionalData, AccessReportStudentData
    'Accordation/AccordionGroup/index': 'src/components/Accordation/AccordionGroup.tsx', // AccordionGroup
    'ActivityCreate/index': 'src/components/ActivityCreate/ActivityCreate.tsx', // CreateActivity
    'ActivityCreate/ActivityCreate.types/index': 'src/components/ActivityCreate/ActivityCreate.types.ts', // ActivityType
    'AlertManager/types/index': 'src/components/AlertManager/types.ts', // AlertData, AlertsConfig
    'AlertManager/useAlertForm/index': 'src/components/AlertManager/useAlertForm.ts', // useAlertFormStore
    'Chat/index': 'src/components/Chat/Chat.tsx', // Chat
    'CheckBoxGroup/index': 'src/components/CheckBoxGroup/CheckBoxGroup.tsx', // CategoryConfig, CheckboxGroup
    'ChoroplethMap/ChoroplethMap.types/index': 'src/components/ChoroplethMap/ChoroplethMap.types.ts', // RegionData
    'ColorPicker/index': 'src/components/ColorPicker/ColorPicker.tsx', // ColorPicker
    'ComparatorChart/ComparatorView/index': 'src/components/ComparatorChart/ComparatorView.tsx', // ComparatorView
    'ExamDetailsLayout/ExamDetailsPage/index': 'src/components/ExamDetailsLayout/ExamDetailsPage.tsx', // ExamDetailsPage
    'ExamPageLayout/index': 'src/components/ExamPageLayout/ExamPageLayout.tsx', // ExamPageLayout, ExamTab
    'ExamPageLayout/GabaritoCard/index': 'src/components/ExamPageLayout/GabaritoCard.tsx', // PageContainer
    'ExamPageLayout/examsTableConfig/index': 'src/components/ExamPageLayout/examsTableConfig.tsx', // examsTableColumns
    'FileDropzone/index': 'src/components/FileDropzone/FileDropzone.tsx', // FileDropzone
    'Filter/useTableFilter/index': 'src/components/Filter/useTableFilter.ts', // FilterConfig, useTableFilter
    'Forum/index': 'src/components/Forum/Forum.tsx', // Forum
    'ImageUpload/index': 'src/components/ImageUpload/ImageUpload.tsx', // ImageUpload
    'MaskedInput/index': 'src/components/MaskedInput/MaskedInput.tsx', // MaskedInput
    'ModuleProtectedRoute/index': 'src/components/ModuleProtectedRoute.tsx', // ModuleProtectedRoute
    'PerformanceQuestionsData/index': 'src/components/PerformanceQuestionsData/PerformanceQuestionsData.tsx', // ContentVariantData, PerformanceQuestionsData, PerformanceQuestionsVariant, QuestionsVariantData
    'PerformanceRanking/index': 'src/components/PerformanceRanking/PerformanceRanking.tsx', // GroupedBy, PerformanceRanking, PerformanceRankingData, PerformanceRankingItem
    'PerformanceReport/index': 'src/components/PerformanceReport/PerformanceReport.tsx', // PerformanceCardData, PerformanceDefaultData, PerformanceReport, PerformanceReportTab, PerformanceStudentData
    'PerformanceReportModal/index': 'src/components/PerformanceReportModal/PerformanceReportModal.tsx', // PerformanceReportModal, UserPerformanceProfessionalData, UserPerformanceStudentData
    'PeriodSelector/index': 'src/components/PeriodSelector/PeriodSelector.tsx', // PeriodSelector
    'Quiz/Quiz.types/index': 'src/components/Quiz/Quiz.types.ts', // QuizVariant
    'Quiz/QuizResult/index': 'src/components/Quiz/QuizResult.tsx', // QuizHeaderResult, QuizListResult, QuizListResultByMateria, QuizResultHeaderTitle, QuizResultPerformance, QuizResultTitle
    'Quiz/TeacherFeedbackSection/index': 'src/components/Quiz/TeacherFeedbackSection.tsx', // TeacherFeedbackSection
    'RecommendedLessonCreate/index': 'src/components/RecommendedLessonCreate/RecommendedLessonCreate.tsx', // RecommendedLessonCreate
    'RecommendedLessonDetails/index': 'src/components/RecommendedLessonDetails/RecommendedLessonDetails.tsx', // RecommendedLessonDetails
    'RecommendedLessonDetails/types/index': 'src/components/RecommendedLessonDetails/types.ts', // StudentPerformanceData
    'RestrictedAccess/index': 'src/components/RestrictedAccess/RestrictedAccess.tsx', // RestrictedAccess
    'SearchSelect/index': 'src/components/SearchSelect/SearchSelect.tsx', // SearchSelect, SearchSelectOption, SearchSelectPagination
    'SendLessonModal/index': 'src/components/SendLessonModal/SendLessonModal.tsx', // SendLessonModal
    'SimulatedPerformance/SimulatedPerformanceView/index': 'src/components/SimulatedPerformance/SimulatedPerformanceView.tsx', // SimulatedPerformanceView
    'SimulatedPerformance/constants/index': 'src/components/SimulatedPerformance/constants.ts', // SCORE_TYPE_OPTIONS
    'SimulatedPerformance/useSimulatedPerformance/index': 'src/components/SimulatedPerformance/useSimulatedPerformance.tsx', // useSimulatedPerformance
    'StudentLessonProgressModal/types/index': 'src/components/StudentLessonProgressModal/types.ts', // StudentLessonProgressData
    'StudentPerformanceDetailsModal/types/index': 'src/components/StudentPerformanceDetailsModal/types.ts', // StudentPerformanceDetailsData
    'TimeChart/index': 'src/components/TimeChart/TimeChart.tsx', // DEFAULT_CATEGORIES, STUDENT_CATEGORIES, TimeChart, TimeChartData
    'TimeReport/index': 'src/components/TimeReport/TimeReport.tsx', // TimeReport, TimeReportData, TimeReportTab, formatHoursToTime, formatVariation, getTrendDirection
    'ToggleSwitch/index': 'src/components/ToggleSwitch/ToggleSwitch.tsx', // ToggleSwitch
    'TokenValidation/index': 'src/components/TokenValidation/TokenValidation.tsx', // TokenValidation
    'TypeSelector/index': 'src/components/TypeSelector/TypeSelector.tsx', // TypeSelector
    'TypeSelector/TypeSelector.types/index': 'src/components/TypeSelector/TypeSelector.types.ts', // ActivityCategory, TypeRoutes, createActivityCategoryConfig
    'UnifiedDraftModelPage/index': 'src/components/UnifiedDraftModelPage/UnifiedDraftModelPage.tsx', // UnifiedDraftModelPage
    'UnifiedHistoryPage/index': 'src/components/UnifiedHistoryPage/UnifiedHistoryPage.tsx', // UnifiedHistoryPage

    // === migration: Hooks ===
    'hooks/useActivityDrafts/index': 'src/hooks/useActivityDrafts.ts', // createUseActivityDrafts
    'hooks/useAppContent/index': 'src/hooks/useAppContent.ts', // useAppContent
    'hooks/useAppInitialization/index': 'src/hooks/useAppInitialization.ts', // useAppInitialization
    'hooks/useCep/index': 'src/hooks/useCep.ts', // useCep
    'hooks/useComparator/index': 'src/hooks/useComparator.ts', // createUseComparator
    'hooks/useDraftAutoSave/index': 'src/hooks/useDraftAutoSave.ts', // useDraftAutoSave
    'hooks/useExamDetails/index': 'src/hooks/useExamDetails.ts', // createUseExamDetails
    'hooks/useExamsHistory/index': 'src/hooks/useExamsHistory.ts', // createUseExamsHistory
    'hooks/useInstitution/index': 'src/hooks/useInstitution.ts', // useInstitution
    'hooks/useModules/index': 'src/hooks/useModules.ts', // useModules
    'hooks/useNotificationStore/index': 'src/hooks/useNotificationStore.ts', // createUseNotificationStore
    'hooks/useNotifications/index': 'src/hooks/useNotifications.ts', // createNotificationsHook
    'hooks/useQuestionsData/index': 'src/hooks/useQuestionsData.ts', // QuestionsDataApiResponse, QuestionsDataFilters, createUseQuestionsData
    'hooks/useStudentsHighlight/index': 'src/hooks/useStudentsHighlight.ts', // PERIOD_TABS, StudentsHighlightApiResponse, StudentsHighlightFilters, StudentsHighlightPeriod, StudentsHighlightType, createUseStudentsHighlight

    // === migration: Stores ===
    'store/comparatorStore/index': 'src/store/comparatorStore.ts', // createComparatorStore

    // === migration: Enums ===
    'enums/Quiz/index': 'src/enums/Quiz.ts', // TrueFalseEnum

    // === migration: Types ===
    'types/activityDetails/index': 'src/types/activityDetails.ts', // ACTIVITY_AVAILABILITY, ActivityAvailability, STUDENT_ACTIVITY_STATUS, StudentActivityStatus
    'types/activityFilters/index': 'src/types/activityFilters.ts', // ActivityFiltersData
    'types/api/index': 'src/types/api.ts', // BaseApiClient
    'types/common/index': 'src/types/common.ts', // REPORT_MODAL_VARIANT
    'types/comparator/index': 'src/types/comparator.ts', // ComparatorTabType
    'types/examDrafts/index': 'src/types/examDrafts.ts', // ExamActivityCategory
    'types/examsHistory/index': 'src/types/examsHistory.ts', // ExamHistoryFilters, ExamStatus, ExamTableItem
    'types/forum/index': 'src/types/forum.ts', // ForumApiClient, ForumTopicDetailResponse, ForumTopicsResponse
    'types/lessonAvailability/index': 'src/types/lessonAvailability.ts', // LESSON_AVAILABILITY
    'types/notifications/index': 'src/types/notifications.ts', // NotificationEntityType
    'types/performance/index': 'src/types/performance.ts', // PERFORMANCE_TAG_CONFIG, PerformanceTag, PerformanceTagConfig, TimeInterval, getPerformanceTagConfig
    'types/user/index': 'src/types/user.ts', // MyDataResponse, StudentDetailsResponse, UpdateMyDataRequest, UserTelemetryData

    // === migration: Utils ===
    'utils/brazilianFormatters/index': 'src/utils/brazilianFormatters.ts', // MASK_TYPE, formatCnpj, formatPhone
    'utils/brazilianStates/index': 'src/utils/brazilianStates.ts', // UF_LIST
    'utils/calendarActivityUtils/index': 'src/utils/calendarActivityUtils.ts', // filterActivitiesFromDate, getActivityDateKey, getCalendarActivityStatus
    'utils/chatUtils/index': 'src/utils/chatUtils.ts', // getChatUserInfo, getChatWsUrl
    'utils/domainUtils/index': 'src/utils/domainUtils.ts', // resolveRootHostname, extractSubdomainSlug, buildLoginUrlWithReturnTo
    'utils/examFilterHelpers/index': 'src/utils/examFilterHelpers.ts', // EXAM_STATUS_OPTIONS
    'utils/lessonAvailabilityUtils/index': 'src/utils/lessonAvailabilityUtils.ts', // checkLessonAvailability
    'utils/renderSubjectCell/index': 'src/utils/renderSubjectCell.tsx', // renderSubjectCell
    'utils/renderTextCell/index': 'src/utils/renderTextCell.tsx', // renderTextCell
    'utils/studentActivityCorrection_types/index': 'src/utils/studentActivityCorrection/types.ts', // StudentActivityCorrectionData
    'utils/subjectMappers/index': 'src/utils/subjectMappers.ts', // mapSubjectNameToEnum

    // Styles
    styles: 'src/styles.css',
  },
  format: ['esm', 'cjs'],
  outDir: 'dist',
  splitting: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'dayjs',
    'dayjs/locale/pt-br',
    'zod',
    'react-hook-form',
    '@hookform/resolvers/zod',
    '@phosphor-icons/react',
    '@react-google-maps/api',
    '@turf/union',
    '@turf/helpers',
    'react-markdown',
    'remark-gfm',
    // Tiptap dependencies (required for RichEditor)
    '@tiptap/react',
    '@tiptap/core',
    '@tiptap/starter-kit',
    '@tiptap/extension-underline',
    '@tiptap/extension-text-align',
    '@tiptap/extension-color',
    '@tiptap/extension-text-style',
    '@tiptap/extension-highlight',
    '@tiptap/extension-subscript',
    '@tiptap/extension-superscript',
    '@tiptap/extension-link',
    '@tiptap/extension-placeholder',
    'xlsx',
  ],
  target: 'es2022',
  sourcemap: true,
  dts: false, // Use tsc directly for better memory efficiency
  loader: {
    '.png': 'dataurl',
    '.gif': 'dataurl',
  },
});
