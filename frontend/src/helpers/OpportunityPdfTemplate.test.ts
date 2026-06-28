// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { Card } from '../interfaces/Card';
import {
  buildOpportunityExportContext,
  OpportunitySheetExportParams,
} from './OpportunityExportContext';
import {
  fetchOpportunityPdfTemplate,
  renderOpportunityPdfTemplate,
} from './OpportunityPdfTemplate';

const params: OpportunitySheetExportParams = {
  card: {
    _id: 'opportunity-1',
    name: '<Projet & développement>',
    teamId: 'team-1',
    userId: 'user-1',
    amount: 1250,
    laneId: 'lane-1',
    inLaneSince: '2026-01-01T00:00:00.000Z',
    attributes: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  } satisfies Card,
  accounts: [],
  amountLabel: 'Montant',
};

const context = buildOpportunityExportContext(params, {
  generatedAt: new Date('2026-06-28T08:30:00.000Z'),
  locale: 'fr-FR',
});

describe('opportunity PDF templates', () => {
  it('renders escaped Mustache values and sections', () => {
    const html = renderOpportunityPdfTemplate(
      '<h1>{{opportunity.name}}</h1>{{#opportunity}}<p>{{amount.display}}</p>{{/opportunity}}',
      context
    );

    expect(html).toContain('&lt;Projet &amp; développement&gt;');
    expect(html).toContain('<p>');
  });

  it('removes scripts and event handlers from the rendered HTML', () => {
    const html = renderOpportunityPdfTemplate(
      '<style>p { color: navy; }</style><script>alert(1)</script><img src="x" onerror="alert(2)"><p>{{opportunity.name}}</p>',
      context
    );

    expect(html).toContain('<style>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
    expect(html).toContain('<p>');
  });

  it('rejects unescaped interpolation and malformed templates', () => {
    expect(() =>
      renderOpportunityPdfTemplate('<p>{{{opportunity.name}}}</p>', context)
    ).toThrow('Only escaped Mustache interpolation and sections are allowed');
    expect(() =>
      renderOpportunityPdfTemplate('{{=<% %>=}}<%& opportunity.name %>', context)
    ).toThrow('Only escaped Mustache interpolation and sections are allowed');
    expect(() =>
      renderOpportunityPdfTemplate('{{#opportunity}}', context)
    ).toThrow('Opportunity PDF template is invalid');
    expect(() =>
      renderOpportunityPdfTemplate('<script>alert(1)</script>', context)
    ).toThrow('no safe HTML content');
  });

  it('loads a non-empty template over HTTP', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response('<h1>{{opportunity.name}}</h1>', { status: 200 })
    );

    await expect(
      fetchOpportunityPdfTemplate('https://example.com/template.html', fetcher)
    ).resolves.toContain('opportunity.name');
  });

  it('rejects HTTP errors and empty responses', async () => {
    const httpError = vi.fn().mockResolvedValue(new Response('', { status: 503 }));
    const empty = vi.fn().mockResolvedValue(new Response('  ', { status: 200 }));

    await expect(
      fetchOpportunityPdfTemplate('https://example.com/template.html', httpError)
    ).rejects.toThrow('status 503');
    await expect(
      fetchOpportunityPdfTemplate('https://example.com/template.html', empty)
    ).rejects.toThrow('empty');
  });
});
