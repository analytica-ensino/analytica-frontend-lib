import { expect as baseExpect, test, type Page } from '@playwright/test';

/**
 * The ebook reader (`EbookReader`, AE-3321) in the Ladle stories
 * `EbookReader > *`, with EB40 ("O Caso da Couve Mordida") as the upload
 * stores it (`public/fixtures/ebook/eb40`, built by
 * `scripts/ebook-fixtures/build_eb40_fixture.py`). The fixture's narration
 * covers pages "caso" and "p04" only. Every flow runs on a computer, where the
 * book opens two pages at a time, and on a phone, where it shows one.
 */

const expect = baseExpect.configure({ timeout: 15_000 });

const VIEWPORTS = [
  { name: 'desktop', size: { width: 1440, height: 900 }, spread: true },
  { name: 'phone', size: { width: 375, height: 812 }, spread: false },
] as const;

const openStory = async (page: Page, story: string) => {
  await page.goto(`?story=ebookreader--${story}&mode=preview`);
  await expect(page.getByTestId('ebook-reader-content')).toBeVisible();
};

/** Waits for page-flip to build the book (it reports the cover as seen). */
const openBook = async (page: Page, story = 'student-book') => {
  await openStory(page, story);
  await expect(page.locator('#livro.stf__parent')).toBeVisible();
};

const pageLabel = (page: Page) => page.getByTestId('ebook-reader-page-label');
const seenSections = (page: Page) => page.getByTestId('ebook-seen-sections');

const goToChapter = async (page: Page, chapter: string) => {
  await page.getByRole('button', { name: 'Sumário' }).click();
  await page.getByRole('menuitem', { name: chapter }).click();
};

/** The header title (the book has headings with the same text). */
const headerTitle = (page: Page) =>
  page.locator('section.ebook-reader > header h1');

const clip = (page: Page, trecho: string) =>
  page.locator(`[data-trecho="${trecho}"]`);

for (const { name, size, spread } of VIEWPORTS) {
  /** The counter reads "a–b de 24" on a spread and "a de 24" on one page. */
  const pages = (first: number) =>
    spread ? `${first}–${first + 1} de 24` : `${first} de 24`;

  test.describe(`ebook reader on a ${name} @e2e`, () => {
    test.use({ viewport: size });

    test('opens at the cover and turns pages with the buttons and the keyboard', async ({
      page,
    }) => {
      await openBook(page);
      await expect(pageLabel(page)).toHaveText('Capa');
      await expect(
        page.getByRole('button', { name: 'Página anterior' })
      ).toBeDisabled();

      await page.getByRole('button', { name: 'Próxima página' }).click();
      await expect(pageLabel(page)).toHaveText(pages(1));

      await page.keyboard.press('ArrowRight');
      await expect(pageLabel(page)).toHaveText(spread ? pages(3) : pages(2));

      await page.keyboard.press('ArrowLeft');
      await expect(pageLabel(page)).toHaveText(pages(1));
    });

    test('shows the pages one under the other and comes back to the same page', async ({
      page,
    }) => {
      await openBook(page);
      await goToChapter(page, 'O caso');
      await expect(pageLabel(page)).toHaveText(pages(3));

      await page.getByRole('button', { name: 'Ler em rolagem' }).click();
      await expect(page.locator('#livro.rolagem')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Próxima página' })
      ).toHaveCount(0);
      await expect(page.locator('[data-ix="3"]')).toBeInViewport();

      await page.getByRole('button', { name: 'Voltar ao modo livro' }).click();
      await expect(pageLabel(page)).toHaveText(pages(3));
    });

    test('reads the narration aloud and highlights the clip being read', async ({
      page,
    }) => {
      await openBook(page);
      await goToChapter(page, 'O caso');
      await expect(pageLabel(page)).toHaveText(pages(3));

      await page.getByRole('button', { name: 'Ouvir' }).click();

      await expect(page.getByRole('button', { name: 'Parar' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      // The page starts with the description of the first panel.
      await expect(clip(page, 'p3-1')).toHaveClass(/lendo/);

      await page.getByRole('button', { name: 'Parar' }).click();
      await expect(clip(page, 'p3-1')).not.toHaveClass(/lendo/);
    });

    test('skips the image descriptions when audio description is off', async ({
      page,
    }) => {
      await page.addInitScript(() =>
        localStorage.setItem('ebook:audio-description', 'off')
      );
      await openBook(page);
      await goToChapter(page, 'O caso');
      await expect(pageLabel(page)).toHaveText(pages(3));
      await expect(
        page.getByRole('button', { name: 'Audiodescrição (AD)' })
      ).toHaveAttribute('aria-pressed', 'false');

      await page.getByRole('button', { name: 'Ouvir' }).click();

      // Straight to the first spoken line, past the 13 s description.
      await expect(clip(page, 'p3-2')).toHaveClass(/lendo/, { timeout: 5_000 });
      await expect(clip(page, 'p3-1')).not.toHaveClass(/lendo/);
    });

    test('stops listening on a page without narration', async ({ page }) => {
      await openBook(page);
      await goToChapter(page, 'O caso');
      await expect(pageLabel(page)).toHaveText(pages(3));
      await page.getByRole('button', { name: 'Ouvir' }).click();
      await expect(clip(page, 'p3-1')).toHaveClass(/lendo/);

      await goToChapter(page, 'Como se lê um gibi');

      await expect(page.getByRole('button', { name: 'Ouvir' })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      await expect(page.locator('.lendo')).toHaveCount(0);
    });

    test('opens at the page where the student stopped', async ({ page }) => {
      await openBook(page, 'resume-at-section');

      await expect(pageLabel(page)).toHaveText(pages(5));
      await expect(seenSections(page)).toContainText('suspeitos');
    });

    test('shows only the book and the controls in full screen', async ({
      page,
    }) => {
      await openBook(page);
      const fullscreen = page.getByRole('button', { name: 'Tela cheia' });
      test.skip(
        (await fullscreen.count()) === 0,
        'This browser does not let pages go full screen'
      );
      const title = headerTitle(page);
      await expect(title).toBeVisible();

      await fullscreen.click();
      await expect(title).toBeHidden();
      await expect(
        page.getByRole('button', { name: 'Próxima página' })
      ).toBeVisible();

      await page.getByRole('button', { name: 'Sair da tela cheia' }).click();
      await expect(title).toBeVisible();
    });

    test('records the sections read, and nothing in the teacher preview', async ({
      page,
    }) => {
      await openBook(page);
      await page.getByRole('button', { name: 'Próxima página' }).click();
      await expect(seenSections(page)).toContainText('capa, rosto');

      await openBook(page, 'teacher-preview');
      await page.getByRole('button', { name: 'Próxima página' }).click();
      await expect(pageLabel(page)).toHaveText(pages(1));
      await expect(seenSections(page)).toHaveText('Seções vistas: nenhuma');
    });

    test('follows the platform theme', async ({ page }) => {
      await openBook(page);
      const stage = page.locator('.ebook-leitor');
      await expect(stage).toHaveAttribute('data-theme', 'light');
      await expect(stage).toHaveCSS('background-color', 'rgb(246, 249, 248)');

      await openBook(page, 'dark-theme');
      await expect(stage).toHaveAttribute('data-theme', 'dark');
      await expect(stage).toHaveCSS('background-color', 'rgb(14, 27, 31)');
    });

    test('opens and closes the answer of "ver resposta"', async ({ page }) => {
      await openBook(page);
      await goToChapter(page, 'Caderno do detetive');
      const answer = page
        .getByRole('button', { name: 'Ver resposta' })
        .filter({ visible: true })
        .first();

      await answer.click();

      const open = page.getByRole('button', { name: 'Esconder' });
      await expect(open).toHaveAttribute('aria-expanded', 'true');
      await open.click();
      await expect(
        page
          .getByRole('button', { name: 'Ver resposta' })
          .filter({ visible: true })
          .first()
      ).toHaveAttribute('aria-expanded', 'false');
    });

    test('shows the material details beside the book or over it', async ({
      page,
    }) => {
      await openBook(page);
      const details = page.getByRole('complementary', {
        name: 'Ficha do material',
      });

      if (spread) {
        await expect(details).toBeVisible();
        await page
          .getByRole('button', { name: 'Fechar a ficha do material' })
          .click();
        await expect(details).toBeHidden();
      } else {
        await expect(details).toBeHidden();
        await page
          .getByRole('button', { name: 'Abrir a ficha do material' })
          .click();
        await expect(details).toBeVisible();
      }
    });

    test('shows the guide in scroll with the design system typography, and goes back to the book', async ({
      page,
    }) => {
      await openStory(page, 'teacher-guide');
      await expect(headerTitle(page)).toHaveText(
        'Guia do Professor · O Caso da Couve Mordida'
      );
      await expect(headerTitle(page)).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Próxima página' })
      ).toHaveCount(0);
      await expect(
        page.getByTestId('ebook-reader-content').locator('h1').first()
      ).toHaveCSS('font-family', /Roboto/);

      await page.getByRole('tab', { name: 'Livro do estudante' }).click();

      await expect(page.locator('#livro.stf__parent')).toBeVisible();
      await expect(pageLabel(page)).toHaveText('Capa');
    });
  });
}
