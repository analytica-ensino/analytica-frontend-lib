import Text from '../Text/Text';

export interface NoSearchResultProps {
  /**
   * Image source for the illustration
   */
  image: string;
  /**
   * Title text to display
   * @default "Nenhum resultado encontrado"
   */
  title?: string;
  /**
   * Description text to display below the title
   * @default "Não encontramos nenhum resultado com esse nome. Tente revisar a busca ou usar outra palavra-chave."
   */
  description?: string;
}

/**
 * Component displayed when no search results are found
 * Shows an illustration with customizable title and description in horizontal layout
 *
 * @example
 * ```tsx
 * import { NoSearchResult } from 'analytica-frontend-lib';
 * import noSearchImage from './assets/no-search.png';
 *
 * <NoSearchResult
 *   image={noSearchImage}
 *   title="Nenhum resultado encontrado"
 *   description="Tente usar outros filtros"
 * />
 * ```
 */
const NoSearchResult = ({ image, title, description }: NoSearchResultProps) => {
  const displayTitle = title || 'Nenhum resultado encontrado';
  const displayDescription =
    description ||
    'Não encontramos nenhum resultado com esse nome. Tente revisar a busca ou usar outra palavra-chave.';

  return (
    <div className="flex flex-row justify-center items-center gap-8 w-full max-w-4xl min-h-96">
      {/* Illustration */}
      <div className="w-72 h-72 flex-shrink-0 relative">
        <img
          src={image}
          alt="No search results"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-start w-full max-w-md">
        {/* Header Container */}
        <div className="flex flex-row justify-between items-end px-6 pt-6 pb-4 w-full rounded-t-xl">
          {/* Title */}
          <Text
            as="h2"
            className="text-text-950 font-semibold text-3xl leading-tight w-full flex items-center"
          >
            {displayTitle}
          </Text>
        </div>

        {/* Description Container */}
        <div className="flex flex-row justify-center items-center px-6 gap-2 w-full">
          {/* Description */}
          <Text className="text-text-600 font-normal text-lg leading-relaxed w-full text-justify">
            {displayDescription}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default NoSearchResult;
