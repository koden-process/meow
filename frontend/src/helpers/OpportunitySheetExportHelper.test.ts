// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { OpportunitySheetExportParams } from './OpportunityExportContext';
import {
  downloadOpportunitySheetWithDependencies,
  OpportunitySheetDownloadDependencies,
} from './OpportunitySheetExportHelper';

const params: OpportunitySheetExportParams = {
  card: {
    _id: 'opportunity-1',
    name: 'Projet',
    teamId: 'team-1',
    userId: 'user-1',
    amount: 100,
    laneId: 'lane-1',
    inLaneSince: '2026-01-01T00:00:00.000Z',
    attributes: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  accounts: [],
  amountLabel: 'Montant',
};

const dependencies = (
  templateUrl?: string
): OpportunitySheetDownloadDependencies => ({
  getTemplateUrl: () => templateUrl,
  downloadGeneric: vi.fn().mockResolvedValue(undefined),
  downloadTemplate: vi.fn().mockResolvedValue(undefined),
  warn: vi.fn(),
});

describe('downloadOpportunitySheetWithDependencies', () => {
  it('uses the generic PDF when no template URL is configured', async () => {
    const deps = dependencies();

    await downloadOpportunitySheetWithDependencies(params, deps);

    expect(deps.downloadGeneric).toHaveBeenCalledOnce();
    expect(deps.downloadTemplate).not.toHaveBeenCalled();
  });

  it('uses the custom template when it succeeds', async () => {
    const deps = dependencies('https://example.com/template.html');

    await downloadOpportunitySheetWithDependencies(params, deps);

    expect(deps.downloadTemplate).toHaveBeenCalledWith(
      params,
      'https://example.com/template.html'
    );
    expect(deps.downloadGeneric).not.toHaveBeenCalled();
  });

  it('falls back to the generic PDF after a template error', async () => {
    const deps = dependencies('https://example.com/template.html');
    vi.mocked(deps.downloadTemplate).mockRejectedValue(new TypeError('CORS error'));

    await downloadOpportunitySheetWithDependencies(params, deps);

    expect(deps.warn).toHaveBeenCalledOnce();
    expect(deps.downloadGeneric).toHaveBeenCalledOnce();
  });
});
