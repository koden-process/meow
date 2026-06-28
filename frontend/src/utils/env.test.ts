// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCustomOpportunityPdfTemplateUrl,
} from './env';

describe('opportunity PDF template environment variable', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    window.ENV = undefined;
    vi.restoreAllMocks();
  });

  it('returns a valid runtime URL', () => {
    window.ENV = {
      VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL:
        'https://example.com/opportunity-template.html',
    };

    expect(getCustomOpportunityPdfTemplateUrl()).toBe(
      'https://example.com/opportunity-template.html'
    );
  });

  it('ignores empty and unsubstituted runtime values', () => {
    window.ENV = {
      VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL:
        '${VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL}',
    };
    expect(getCustomOpportunityPdfTemplateUrl()).toBeUndefined();

    window.ENV.VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL = '   ';
    expect(getCustomOpportunityPdfTemplateUrl()).toBeUndefined();
  });
});
