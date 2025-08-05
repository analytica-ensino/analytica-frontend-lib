import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Lista de componentes que precisam de arquivos .d.ts
const components = [
  'Alert',
  'Badge', 
  'Button',
  'CheckBox',
  'Chips',
  'Divider',
  'DropdownMenu',
  'IconButton',
  'IconRoundedButton',
  'Input',
  'NavButton',
  'ProgressBar',
  'ProgressCircle',
  'Radio',
  'SelectionButton',
  'Select',
  'Table',
  'Text',
  'TextArea',
  'Toast',
  'Menu',
  'Modal',
  'Card',
  'Calendar',
  'Stepper',
  'Skeleton',
  'NotFound',
  'Auth',
  'Quiz',
  'MultipleChoice',
  'Accordation',
  'Alternative',
  'AlertDialog'
];

// Componentes Auth individuais
const authComponents = [
  'Auth/AuthProvider',
  'Auth/ProtectedRoute', 
  'Auth/PublicRoute',
  'Auth/withAuth',
  'Auth/useAuth',
  'Auth/useAuthGuard',
  'Auth/useRouteAuth',
  'Auth/getRootDomain',
  'Auth/zustandAuthAdapter',
  'Auth/useUrlAuthentication',
  'Auth/useApiConfig'
];

// Utilitários do Toast
const toastUtils = [
  'Toast/Toaster',
  'Toast/ToastStore'
];

// Quiz store
const quizStore = ['Quiz/useQuizStore'];

// CheckBox subcomponents
const checkboxComponents = ['CheckBox/CheckboxList'];

// Função para criar arquivo .d.ts
function createTypeFile(componentPath) {
  const distPath = join(rootDir, 'dist', componentPath);
  const typeFilePath = join(distPath, 'index.d.ts');
  
  // Criar diretório se não existir
  if (!existsSync(distPath)) {
    mkdirSync(distPath, { recursive: true });
  }
  
  // Calcular o caminho relativo para o index principal
  const depth = componentPath.split('/').length;
  const relativePath = '../'.repeat(depth);
  
  const content = `export * from '${relativePath}index';\n`;
  
  writeFileSync(typeFilePath, content);
}

// Gerar .d.ts para componentes principais
components.forEach(component => {
  createTypeFile(component);
});

// Gerar .d.ts para componentes Auth individuais
authComponents.forEach(component => {
  createTypeFile(component);
});

// Gerar .d.ts para utilitários do Toast
toastUtils.forEach(component => {
  createTypeFile(component);
});

// Gerar .d.ts para Quiz store
quizStore.forEach(component => {
  createTypeFile(component);
});

// Gerar .d.ts para CheckBox subcomponents
checkboxComponents.forEach(component => {
  createTypeFile(component);
});