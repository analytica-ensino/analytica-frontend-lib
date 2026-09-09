import type { Story } from '@ladle/react';
import { SubjectIcons, type SubjectIconsItem } from './SubjectIcons';

const SUBJECTS: SubjectIconsItem[] = [
  { id: '1', name: 'Biologia', color: '#2E7D32', icon: 'Atom' },
  { id: '2', name: 'Física', color: '#1565C0', icon: 'Atom' },
  { id: '3', name: 'Matemática', color: '#C62828', icon: 'MathOperations' },
  { id: '4', name: 'Química', color: '#6A1B9A', icon: 'Flask' },
  { id: '5', name: 'História', color: '#EF6C00', icon: 'BookOpen' },
];

/**
 * Every count the "Componente curricular" column has to survive, inside a cell
 * of the real width so the overflow behaviour is visible.
 */
export const AllSubjectIcons: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <h2 className="font-bold text-3xl text-text-900">SubjectIcons</h2>
    <p className="text-text-700">
      Um ícone por componente curricular. Acima de <code>maxVisible</code> o
      excedente vira <code>+N</code>; os nomes completos ficam no tooltip.
    </p>

    <section>
      <h3 className="font-bold text-2xl text-text-900 mb-4">
        Dentro da largura real da coluna (max-w-[140px])
      </h3>
      <table className="border border-border-200">
        <thead>
          <tr>
            <th className="text-left p-2 min-w-fit text-text-900">
              Componente curricular
            </th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3, 5].map((count) => (
            <tr key={count} className="border-t border-border-200">
              <td className="p-2 max-w-[140px] whitespace-nowrap">
                <SubjectIcons subjects={SUBJECTS.slice(0, count)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    <section>
      <h3 className="font-bold text-2xl text-text-900 mb-4">maxVisible</h3>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 5].map((maxVisible) => (
          <div key={maxVisible} className="flex items-center gap-4">
            <span className="text-sm text-text-500 w-24">
              maxVisible={maxVisible}
            </span>
            <SubjectIcons subjects={SUBJECTS} maxVisible={maxVisible} />
          </div>
        ))}
      </div>
    </section>

    <section>
      <h3 className="font-bold text-2xl text-text-900 mb-4">Sem componente</h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-500 w-24">showEmptyDash</span>
          <SubjectIcons subjects={[]} />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-500 w-24">sem traço</span>
          <SubjectIcons subjects={[]} showEmptyDash={false} />
        </div>
      </div>
    </section>

    <section>
      <h3 className="font-bold text-2xl text-text-900 mb-4">
        Ícone desconhecido ou vazio
      </h3>
      <SubjectIcons
        subjects={[
          { id: 'a', name: 'Ícone vazio', color: '#455A64', icon: '' },
          {
            id: 'b',
            name: 'Ícone inexistente',
            color: '#455A64',
            icon: 'NaoExiste',
          },
        ]}
      />
    </section>
  </div>
);
