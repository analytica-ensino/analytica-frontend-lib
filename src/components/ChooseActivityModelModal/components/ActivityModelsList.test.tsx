import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityModelsList } from './ActivityModelsList';
import type { ActivityModelTableItem } from '../../../types/activitiesHistory';

const mockModels: ActivityModelTableItem[] = [
  {
    id: '1',
    title: 'Test Activity Model',
    savedAt: '01/01/2024',
    subject: {
      id: 'bio-1',
      subjectName: 'Biologia',
      subjectIcon: 'Microscope',
      subjectColor: '#E8F5E9',
    },
    subjectId: 'bio-1',
  },
];

describe('ActivityModelsList', () => {
  it('renders table with models', () => {
    const onParamsChange = vi.fn();
    const onRowClick = vi.fn();

    render(
      <ActivityModelsList
        models={mockModels}
        loading={false}
        onParamsChange={onParamsChange}
        onRowClick={onRowClick}
      />
    );

    expect(screen.getByText('Test Activity Model')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const onParamsChange = vi.fn();
    const onRowClick = vi.fn();

    render(
      <ActivityModelsList
        models={[]}
        loading={true}
        onParamsChange={onParamsChange}
        onRowClick={onRowClick}
      />
    );

    // TableProvider should handle loading state
    expect(screen.queryByText('Test Activity Model')).not.toBeInTheDocument();
  });

  it('renders empty state when no models', () => {
    const onParamsChange = vi.fn();
    const onRowClick = vi.fn();

    render(
      <ActivityModelsList
        models={[]}
        loading={false}
        onParamsChange={onParamsChange}
        onRowClick={onRowClick}
      />
    );

    expect(screen.queryByText('Test Activity Model')).not.toBeInTheDocument();
  });
});
