import type { Story } from '@ladle/react';
import { useState } from 'react';
import TablePagination from './TablePagination';

export const Default: Story = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  return (
    <div className="p-8 bg-white">
      <TablePagination
        totalItems={100}
        currentPage={currentPage}
        totalPages={10}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="escolas"
      />
    </div>
  );
};

export const FirstPage: Story = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  return (
    <div className="p-8 bg-white">
      <TablePagination
        totalItems={100}
        currentPage={currentPage}
        totalPages={10}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="alunos"
      />
      <p className="mt-4 text-sm text-gray-600">
        O botão &quot;Anterior&quot; está desabilitado na primeira página
      </p>
    </div>
  );
};

export const LastPage: Story = () => {
  const [currentPage, setCurrentPage] = useState(10);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  return (
    <div className="p-8 bg-white">
      <TablePagination
        totalItems={100}
        currentPage={currentPage}
        totalPages={10}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="atividades"
      />
      <p className="mt-4 text-sm text-gray-600">
        O botão &quot;Próxima&quot; está desabilitado na última página
      </p>
    </div>
  );
};

export const MiddlePage: Story = () => {
  const [currentPage, setCurrentPage] = useState(5);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  return (
    <div className="p-8 bg-white">
      <TablePagination
        totalItems={100}
        currentPage={currentPage}
        totalPages={10}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="professores"
      />
      <p className="mt-4 text-sm text-gray-600">
        Ambos os botões estão habilitados em páginas intermediárias
      </p>
    </div>
  );
};

export const ManyItems: Story = () => {
  const [currentPage, setCurrentPage] = useState(50);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  return (
    <div className="p-8 bg-white">
      <TablePagination
        totalItems={5000}
        currentPage={currentPage}
        totalPages={250}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="registros"
      />
      <p className="mt-4 text-sm text-gray-600">
        Exemplo com muitos itens (5000 registros, 250 páginas)
      </p>
    </div>
  );
};

export const FewItems: Story = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  return (
    <div className="p-8 bg-white">
      <TablePagination
        totalItems={5}
        currentPage={currentPage}
        totalPages={1}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="itens"
      />
      <p className="mt-4 text-sm text-gray-600">
        Exemplo com poucos itens (apenas 5 itens em 1 página)
      </p>
    </div>
  );
};

export const DifferentLabels: Story = () => {
  const [currentPage1, setCurrentPage1] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(2);
  const [currentPage3, setCurrentPage3] = useState(3);

  return (
    <div className="p-8 bg-white space-y-8">
      <div>
        <h3 className="mb-2 font-bold">Label: &quot;alunos&quot;</h3>
        <TablePagination
          totalItems={150}
          currentPage={currentPage1}
          totalPages={15}
          itemsPerPage={10}
          onPageChange={setCurrentPage1}
          itemLabel="alunos"
        />
      </div>

      <div>
        <h3 className="mb-2 font-bold">Label: &quot;atividades&quot;</h3>
        <TablePagination
          totalItems={80}
          currentPage={currentPage2}
          totalPages={8}
          itemsPerPage={10}
          onPageChange={setCurrentPage2}
          itemLabel="atividades"
        />
      </div>

      <div>
        <h3 className="mb-2 font-bold">Label: &quot;turmas&quot;</h3>
        <TablePagination
          totalItems={200}
          currentPage={currentPage3}
          totalPages={20}
          itemsPerPage={10}
          onPageChange={setCurrentPage3}
          itemLabel="turmas"
        />
      </div>
    </div>
  );
};

export const WithoutItemsPerPageSelect: Story = () => {
  const [currentPage, setCurrentPage] = useState(3);

  return (
    <div className="p-8 bg-white">
      <TablePagination
        totalItems={100}
        currentPage={currentPage}
        totalPages={10}
        itemsPerPage={10}
        onPageChange={setCurrentPage}
        itemLabel="documentos"
      />
      <p className="mt-4 text-sm text-gray-600">
        Sem seletor de items por página (onItemsPerPageChange não fornecido)
      </p>
    </div>
  );
};
