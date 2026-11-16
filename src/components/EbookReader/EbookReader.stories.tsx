import { useEffect, useState, type ReactNode } from 'react';
import type { Story } from '@ladle/react';
import { useThemeStore } from '../../store/themeStore';
import EbookReader from './EbookReader';
import {
  EBOOK_MATERIAL_TYPE,
  type EbookContent,
  type EbookDetails,
  type EbookMaterialType,
  type EbookReaderMode,
} from './types';

export default {
  title: 'EbookReader',
};

/**
 * EB40 ("O Caso da Couve Mordida") as the upload stores a version, served by
 * Ladle itself (`public/fixtures/ebook/eb40`, built by
 * `scripts/ebook-fixtures/build_eb40_fixture.py`). Relative paths work in
 * `ladle serve` and in the published Ladle.
 */
const FIXTURE = 'fixtures/ebook/eb40';

/** Folder of each material inside the fixture. */
const FOLDER: Record<EbookMaterialType, string> = {
  [EBOOK_MATERIAL_TYPE.STUDENT]: 'aluno',
  [EBOOK_MATERIAL_TYPE.TEACHER]: 'professor',
};

/** Fields of the package's `metadata.json` the stories use. */
interface PackageMetadata {
  titulo: string;
  categoria: string;
  ano_escolar: string;
  autores: { nome: string }[];
  habilidades_bncc: { codigo: string }[];
  palavras: number;
  tempo_leitura_estimado_min: number;
}

interface LoadedMaterial {
  content: EbookContent;
  title: string;
  subtitle: string;
  details: EbookDetails;
}

const loadMaterial = async (
  material: EbookMaterialType
): Promise<LoadedMaterial> => {
  const base = new URL(`${FIXTURE}/${FOLDER[material]}/`, document.baseURI)
    .href;
  const get = (path: string) => fetch(new URL(path, base));
  const [html, css, narration, metadata] = await Promise.all([
    get('content.html').then((response) => response.text()),
    get('styles.css').then((response) => response.text()),
    material === EBOOK_MATERIAL_TYPE.STUDENT
      ? get('narration.json').then((response) => response.json())
      : Promise.resolve(null),
    get('metadata.json').then(
      (response) => response.json() as Promise<PackageMetadata>
    ),
  ]);
  return {
    content: { html, css, narration, assetBaseUrl: base },
    title: metadata.titulo,
    subtitle: `${metadata.ano_escolar} · ${metadata.categoria}`,
    details: {
      code: 'EB40',
      theme: metadata.categoria,
      audience: metadata.ano_escolar,
      authors: metadata.autores.map((author) => author.nome),
      bncc: metadata.habilidades_bncc.map((skill) => skill.codigo),
      words: metadata.palavras,
      readingMinutes: metadata.tempo_leitura_estimado_min,
    },
  };
};

/** Loads the fixture and shows the reader full screen, with the sections seen so far. */
const FixtureReader = ({
  initialMaterial = EBOOK_MATERIAL_TYPE.STUDENT,
  mode,
  initialSection,
  withTabs = false,
}: Readonly<{
  initialMaterial?: EbookMaterialType;
  mode?: EbookReaderMode;
  initialSection?: string;
  withTabs?: boolean;
}>) => {
  const [material, setMaterial] = useState(initialMaterial);
  const [loaded, setLoaded] = useState<LoadedMaterial | null>(null);
  const [seen, setSeen] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    loadMaterial(material).then((result) => {
      if (active) setLoaded(result);
    });
    return () => {
      active = false;
    };
  }, [material]);

  if (!loaded) return <p className="p-4">Carregando o livro…</p>;

  return (
    <div className="flex h-screen flex-col">
      <EbookReader
        key={material}
        content={loaded.content}
        title={loaded.title}
        subtitle={loaded.subtitle}
        details={loaded.details}
        material={material}
        onMaterialChange={withTabs ? setMaterial : undefined}
        onBack={() => setSeen([])}
        mode={mode}
        initialSection={initialSection}
        onSectionsSeen={(sections) =>
          setSeen((current) => [...current, ...sections])
        }
        className="min-h-0 flex-1"
      />
      <output
        className="block px-4 py-1 text-xs text-text-600"
        data-testid="ebook-seen-sections"
      >
        Seções vistas: {seen.join(', ') || 'nenhuma'}
      </output>
    </div>
  );
};

/** Student book: turns pages, two at a time on a wide screen. */
export const StudentBook: Story = () => <FixtureReader />;

/** Student book opened at the page of a section (resume). */
export const ResumeAtSection: Story = () => (
  <FixtureReader initialSection="suspeitos" />
);

/** Teacher and manager: preview without recording, with the book / guide tabs. */
export const TeacherPreview: Story = () => (
  <FixtureReader mode="preview" withTabs />
);

/** Guia do Professor: no book pages, scroll only, design system typography. */
export const TeacherGuide: Story = () => (
  <FixtureReader
    initialMaterial={EBOOK_MATERIAL_TYPE.TEACHER}
    mode="preview"
    withTabs
  />
);

/** Shows its children with the platform in dark mode, and puts the mode back on leaving. */
const DarkPlatform = ({ children }: Readonly<{ children: ReactNode }>) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { themeMode, setTheme } = useThemeStore.getState();
    setTheme('dark');
    setReady(true);
    return () => setTheme(themeMode);
  }, []);
  return ready ? children : null;
};

/** Student book with the platform in dark mode: the book follows it. */
export const DarkTheme: Story = () => (
  <DarkPlatform>
    <FixtureReader />
  </DarkPlatform>
);
