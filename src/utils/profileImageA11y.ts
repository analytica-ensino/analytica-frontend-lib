/** Rótulo do estado vazio — não há foto de perfil para mostrar. */
const NO_IMAGE_LABEL = 'Imagem de perfil, sem imagem';

/** Rótulo de quando há foto mas o nome da pessoa ainda não é conhecido. */
const GENERIC_LABEL = 'Imagem de perfil';

export interface ProfileImageLabelOptions {
  /** URL da foto. Ausente, vazia ou só espaços = estado "sem imagem". */
  src?: string | null;
  /** Nome da pessoa. Ausente = rótulo genérico, sem "de fulano". */
  name?: string | null;
}

/**
 * Nome acessível de uma foto de perfil, nos dois estados.
 *
 * Existe porque a mesma copy é necessária em pontos com markup diferente
 * (`Avatar`, o cabeçalho do menu de perfil, a página de dados pessoais do
 * aluno) e, sem uma fonte de verdade, as correções divergiram: o mesmo estado
 * vazio já foi anunciado de duas formas em telas do mesmo app.
 *
 * Devolve uma string em vez de props espalháveis de propósito: cada ponto de
 * uso já ramifica entre `<img>` e o fallback por causa do markup, então um
 * objeto de props não eliminaria a ramificação — só esconderia em qual elemento
 * o rótulo precisa cair.
 *
 * O leitor de tela anuncia o papel ("imagem") depois do rótulo, então o estado
 * vazio é falado como "Imagem de perfil, sem imagem, imagem". A redundância é
 * conhecida e aceita: o texto vem do Figma e vale mais a consistência entre as
 * telas do que economizar uma palavra.
 *
 * @example
 * ```tsx
 * const label = profileImageLabel({ src: photoUrl, name: user.name });
 *
 * photoUrl
 *   ? <img src={photoUrl} alt={label} />
 *   : <div role="img" aria-label={label}><UserIcon aria-hidden /></div>
 * ```
 */
export const profileImageLabel = ({
  src,
  name,
}: ProfileImageLabelOptions): string => {
  if (!src?.trim()) {
    return NO_IMAGE_LABEL;
  }

  const trimmedName = name?.trim();

  return trimmedName ? `${GENERIC_LABEL} de ${trimmedName}` : GENERIC_LABEL;
};
