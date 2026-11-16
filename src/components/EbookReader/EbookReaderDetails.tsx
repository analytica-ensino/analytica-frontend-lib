import { Fragment } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import type { EbookDetails } from './types';

/**
 * "884 palavras, cerca de 13 min", or whichever half is known.
 * @param details - Words and minutes of the material
 */
export const readingLabel = ({
  words,
  readingMinutes,
}: EbookDetails): string | undefined => {
  const parts = [
    words === undefined ? '' : `${words.toLocaleString('pt-BR')} palavras`,
    readingMinutes === undefined ? '' : `cerca de ${readingMinutes} min`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
};

/**
 * Rows of the panel, in the design's order, without the empty ones.
 * @param details - What is known about the material
 */
export const detailRows = (details: EbookDetails): [string, string][] =>
  (
    [
      ['Código', details.code],
      ['Tema', details.theme],
      ['Público', details.audience],
      ['Autoria', details.authors?.join(', ')],
      ['BNCC', details.bncc?.join(', ')],
      ['Leitura', readingLabel(details)],
    ] as [string, string | undefined][]
  ).filter((row): row is [string, string] => !!row[1]);

/**
 * "Ficha do material": the panel beside the book with code, theme, audience,
 * authors, BNCC and reading time.
 */
export const EbookReaderDetails = ({
  id,
  details,
  className,
}: Readonly<{ id: string; details: EbookDetails; className?: string }>) => (
  <aside
    id={id}
    aria-labelledby={`${id}-title`}
    className={cn('overflow-y-auto bg-background p-6', className)}
  >
    <Text
      as="h2"
      id={`${id}-title`}
      size="lg"
      weight="bold"
      className="text-text-950"
    >
      Ficha do material
    </Text>
    <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
      {detailRows(details).map(([label, value]) => (
        <Fragment key={label}>
          <dt className="text-text-600">{label}</dt>
          <dd className="font-semibold text-text-950">{value}</dd>
        </Fragment>
      ))}
    </dl>
  </aside>
);
