// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { Card } from '../interfaces/Card';
import {
  buildOpportunityExportContext,
  OpportunitySheetExportParams,
} from './OpportunityExportContext';
import {
  downloadTemplateOpportunitySheet,
  fetchOpportunityPdfTemplate,
  inlineTemplateImages,
  renderOpportunityPdfTemplate,
} from './OpportunityPdfTemplate';

const { addImageMock, html2canvasMock, saveMock, toDataUrlMock } = vi.hoisted(() => ({
  addImageMock: vi.fn(),
  html2canvasMock: vi.fn(),
  saveMock: vi.fn(),
  toDataUrlMock: vi.fn().mockReturnValue('data:image/jpeg;base64,pdf-page'),
}));

vi.mock('html2canvas', () => ({
  default: html2canvasMock,
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function MockJsPdf() {
    return {
      addImage: addImageMock,
      internal: {
        pageSize: {
          getHeight: () => 841.89,
          getWidth: () => 595.28,
        },
      },
      save: saveMock,
    };
  }),
}));

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
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

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

  it('embeds remote template images before rendering', async () => {
    const root = document.createElement('div');
    root.innerHTML = '<img src="./assets/logo.svg" crossorigin="anonymous">';
    const image = root.querySelector('img')!;
    const decode = vi.fn().mockResolvedValue(undefined);
    const rasterizer = vi
      .fn()
      .mockResolvedValue('data:image/png;base64,embedded-logo');
    const fetcher = vi.fn().mockResolvedValue(
      new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>', {
        status: 200,
        headers: { 'content-type': 'image/svg+xml' },
      })
    );

    Object.defineProperty(image, 'decode', { value: decode });
    image.getBoundingClientRect = () =>
      ({
        bottom: 135,
        height: 135,
        left: 0,
        right: 220,
        top: 0,
        width: 220,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    await inlineTemplateImages(
      root,
      'https://cdn.example.com/templates/opportunity.tpl',
      fetcher,
      rasterizer
    );

    expect(fetcher).toHaveBeenCalledWith(
      'https://cdn.example.com/templates/assets/logo.svg'
    );
    expect(image.getAttribute('crossorigin')).toBeNull();
    expect(rasterizer).toHaveBeenCalledWith(
      expect.any(Blob),
      440,
      270,
      document
    );
    expect(image.src).toBe('data:image/png;base64,embedded-logo');
    expect(decode).toHaveBeenCalledOnce();
  });

  it('rejects an image response with an unsafe content type', async () => {
    const root = document.createElement('div');
    root.innerHTML = '<img src="https://example.com/not-an-image">';
    const fetcher = vi.fn().mockResolvedValue(
      new Response('<html></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      })
    );

    await expect(
      inlineTemplateImages(root, 'https://example.com/template.tpl', fetcher)
    ).rejects.toThrow('not an image');
  });

  it('rasterizes the isolated fixed A4 template into exactly one PDF page', async () => {
    let renderedRoot:
      | { height: string; isMainDocument: boolean; width: string }
      | undefined;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<main style="width:794px;height:1123px">Test</main>', {
          status: 200,
        })
      )
    );
    html2canvasMock.mockImplementation(async (root: HTMLElement) => {
      renderedRoot = {
        height: root.style.height,
        isMainDocument: root.ownerDocument === document,
        width: root.style.width,
      };

      return { toDataURL: toDataUrlMock };
    });

    await downloadTemplateOpportunitySheet(
      params,
      'https://example.com/template.tpl'
    );

    expect(html2canvasMock).toHaveBeenCalledOnce();
    const [, options] = html2canvasMock.mock.calls[0];

    expect(renderedRoot).toEqual({
      height: '1123px',
      isMainDocument: false,
      width: '794px',
    });
    expect(options).toMatchObject({
      backgroundColor: '#ffffff',
      height: 1123,
      scale: 2,
      useCORS: true,
      width: 794,
      windowHeight: 1123,
      windowWidth: 794,
    });
    expect(addImageMock).toHaveBeenCalledWith(
      'data:image/jpeg;base64,pdf-page',
      'JPEG',
      0,
      0,
      595.28,
      841.89,
      undefined,
      'FAST'
    );
    expect(toDataUrlMock).toHaveBeenCalledWith('image/jpeg', 0.98);
    expect(document.querySelector('iframe[title="Opportunity PDF rendering"]')).toBeNull();
    expect(saveMock).toHaveBeenCalledWith(
      'fiche-opportunite-projet-developpement.pdf'
    );
  });
});
