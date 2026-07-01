import DOMPurify from 'dompurify';
import Mustache from 'mustache';
import {
  buildOpportunityExportContext,
  OpportunitySheetExportParams,
  opportunityPdfFileName,
} from './OpportunityExportContext';
import { getBrowserLocale } from './Helper';

const UNSUPPORTED_MUSTACHE_TAG = /{{{|{{\s*[&=>]/;
const TEMPLATE_WIDTH_PX = 794;
const TEMPLATE_HEIGHT_PX = 1123;
const RENDER_SCALE = 2;

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

const waitForImage = async (image: HTMLImageElement): Promise<void> => {
  if (typeof image.decode === 'function') {
    await image.decode();
    return;
  }

  if (image.complete && image.naturalWidth > 0) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    image.addEventListener('load', () => resolve(), { once: true });
    image.addEventListener(
      'error',
      () => reject(new Error('Template image could not be decoded')),
      { once: true }
    );
  });
};

type TemplateImageRasterizer = (
  blob: Blob,
  width: number,
  height: number,
  ownerDocument: Document
) => Promise<string>;

const rasterizeTemplateImage: TemplateImageRasterizer = async (
  blob,
  width,
  height,
  ownerDocument
) => {
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = new (ownerDocument.defaultView?.Image ?? Image)();

    await new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener(
        'error',
        () => reject(new Error('Template image could not be rasterized')),
        { once: true }
      );
      image.src = objectUrl;
    });

    const canvas = ownerDocument.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Template image canvas could not be created');
    }

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const inlineTemplateImages = async (
  root: HTMLElement,
  templateUrl: string,
  fetcher: typeof fetch = fetch,
  rasterizer: TemplateImageRasterizer = rasterizeTemplateImage
): Promise<void> => {
  const images = Array.from(root.querySelectorAll<HTMLImageElement>('img[src]'));

  await Promise.all(
    images.map(async (image) => {
      const source = image.getAttribute('src');

      if (!source) {
        return;
      }

      if (!source.startsWith('data:')) {
        const imageUrl = new URL(source, templateUrl);

        if (imageUrl.protocol !== 'http:' && imageUrl.protocol !== 'https:') {
          throw new Error(`Unsupported template image protocol: ${imageUrl.protocol}`);
        }

        const response = await fetcher(imageUrl.toString());

        if (!response.ok) {
          throw new Error(
            `Template image request failed with status ${response.status}`
          );
        }

        const contentType = response.headers.get('content-type')?.split(';')[0].trim();

        if (!contentType?.startsWith('image/')) {
          throw new Error('Template image response is not an image');
        }

        const imageBlob = await response.blob();
        const bounds = image.getBoundingClientRect();
        const width = Math.max(
          1,
          Math.ceil((bounds.width || image.width || 1) * RENDER_SCALE)
        );
        const height = Math.max(
          1,
          Math.ceil((bounds.height || image.height || 1) * RENDER_SCALE)
        );

        image.removeAttribute('crossorigin');
        image.src = await rasterizer(
          imageBlob,
          width,
          height,
          image.ownerDocument
        );
      }

      await waitForImage(image);
    })
  );
};

const createRenderContainer = (
  html: string
): { host: HTMLIFrameElement; root: HTMLDivElement } => {
  const host = document.createElement('iframe');

  host.setAttribute('aria-hidden', 'true');
  host.setAttribute('title', 'Opportunity PDF rendering');
  host.style.position = 'fixed';
  host.style.left = '0';
  host.style.top = '0';
  host.style.width = `${TEMPLATE_WIDTH_PX}px`;
  host.style.height = `${TEMPLATE_HEIGHT_PX}px`;
  host.style.border = '0';
  host.style.pointerEvents = 'none';
  host.style.transform = 'scale(0.001)';
  host.style.transformOrigin = 'top left';
  document.body.appendChild(host);

  const hostDocument = host.contentDocument;

  if (!hostDocument) {
    host.remove();
    throw new Error('Template rendering document could not be created');
  }

  hostDocument.documentElement.style.width = `${TEMPLATE_WIDTH_PX}px`;
  hostDocument.documentElement.style.height = `${TEMPLATE_HEIGHT_PX}px`;
  hostDocument.documentElement.style.overflow = 'hidden';
  hostDocument.body.style.width = `${TEMPLATE_WIDTH_PX}px`;
  hostDocument.body.style.height = `${TEMPLATE_HEIGHT_PX}px`;
  hostDocument.body.style.margin = '0';
  hostDocument.body.style.overflow = 'hidden';
  hostDocument.body.style.background = '#ffffff';

  const root = hostDocument.createElement('div');

  root.style.width = `${TEMPLATE_WIDTH_PX}px`;
  root.style.height = `${TEMPLATE_HEIGHT_PX}px`;
  root.style.overflow = 'hidden';
  root.style.background = '#ffffff';
  root.innerHTML = html;
  hostDocument.body.appendChild(root);

  return { host, root };
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
  const { host, root } = createRenderContainer(html);

  try {
    await root.ownerDocument.fonts?.ready;
    await inlineTemplateImages(root, templateUrl);

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);
    const canvas = await html2canvas(root, {
      backgroundColor: '#ffffff',
      height: TEMPLATE_HEIGHT_PX,
      logging: false,
      scale: RENDER_SCALE,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: TEMPLATE_WIDTH_PX,
      windowHeight: TEMPLATE_HEIGHT_PX,
      windowWidth: TEMPLATE_WIDTH_PX,
    });
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.addImage(
      canvas.toDataURL('image/jpeg', 0.98),
      'JPEG',
      0,
      0,
      pageWidth,
      pageHeight,
      undefined,
      'FAST'
    );
    doc.save(opportunityPdfFileName(params.card.name));
  } finally {
    host.remove();
  }
};
