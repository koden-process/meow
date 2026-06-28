import DOMPurify from 'dompurify';
import Mustache from 'mustache';
import {
  buildOpportunityExportContext,
  OpportunitySheetExportParams,
  opportunityPdfFileName,
} from './OpportunityExportContext';
import { getBrowserLocale } from './Helper';

const UNSUPPORTED_MUSTACHE_TAG = /{{{|{{\s*[&=>]/;

export const fetchOpportunityPdfTemplate = async (
  url: string,
  fetcher: typeof fetch = fetch
): Promise<string> => {
  const response = await fetcher(url);

  if (!response.ok) {
    throw new Error(`Template request failed with status ${response.status}`);
  }

  const template = await response.text();

  if (!template.trim()) {
    throw new Error('Template response is empty');
  }

  return template;
};

export const renderOpportunityPdfTemplate = (
  template: string,
  context: ReturnType<typeof buildOpportunityExportContext>
): string => {
  if (UNSUPPORTED_MUSTACHE_TAG.test(template)) {
    throw new Error('Only escaped Mustache interpolation and sections are allowed');
  }

  let rendered: string;

  try {
    rendered = Mustache.render(template, context);
  } catch (error) {
    throw new Error('Opportunity PDF template is invalid', { cause: error });
  }

  const sanitized = DOMPurify.sanitize(rendered, {
    ADD_TAGS: ['style'],
    FORCE_BODY: true,
  });

  if (!sanitized.replace(/<style[\s\S]*?<\/style>/gi, '').trim()) {
    throw new Error('Opportunity PDF template has no safe HTML content');
  }

  return sanitized;
};

export const downloadTemplateOpportunitySheet = async (
  params: OpportunitySheetExportParams,
  templateUrl: string
): Promise<void> => {
  const template = await fetchOpportunityPdfTemplate(templateUrl);
  const context = buildOpportunityExportContext(params, {
    generatedAt: new Date(),
    locale: getBrowserLocale(),
  });
  const html = renderOpportunityPdfTemplate(template, context);
  const container = document.createElement('div');

  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.background = '#ffffff';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    await document.fonts?.ready;

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    await doc.html(container, {
      autoPaging: 'text',
      html2canvas: {
        logging: false,
        scale: 0.75,
        useCORS: true,
      },
      margin: [20, 20, 20, 20],
      width: 555,
      windowWidth: 794,
    });

    doc.save(opportunityPdfFileName(params.card.name));
  } finally {
    container.remove();
  }
};
