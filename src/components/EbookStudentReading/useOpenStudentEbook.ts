import { useEffect, useState } from 'react';
import type { StudentAttachedEbook } from '../../types/ebookAttachment';

/**
 * The book whose reading a student's modal shows in place of its content
 * ("Ver detalhes" of "Leitura do livro"). Another student, or the modal
 * closing, goes back to the content.
 *
 * @param isOpen - Whether the modal is open
 * @param studentKey - Who the modal is about
 * @returns The open book, or null, and its setter
 */
export const useOpenStudentEbook = (
  isOpen: boolean,
  studentKey: string | undefined
) => {
  const [openEbook, setOpenEbook] = useState<StudentAttachedEbook | null>(null);

  useEffect(() => {
    setOpenEbook(null);
  }, [isOpen, studentKey]);

  return [openEbook, setOpenEbook] as const;
};
