import type { jsPDF as JsPdfDocument } from 'jspdf';
import { Account } from '../interfaces/Account';
import { Card } from '../interfaces/Card';
import { Lane } from '../interfaces/Lane';
import { Schema, SchemaAttribute, SchemaAttributeType } from '../interfaces/Schema';
import { CurrencyCode, Team } from '../interfaces/Team';
import { User } from '../interfaces/User';
import { DEFAULT_CURRENCY, DEFAULT_LANGUAGE } from '../Constants';
import { Translations } from '../Translations';
import { getBrowserLocale } from './Helper';
import { SchemaHelper } from './SchemaHelper';

interface OpportunitySheetExportParams {
  card: Card;
  schema?: Schema;
  accounts: Account[];
  lane?: Lane;
  owner?: User;
  team?: Team;
  amountLabel: string;
  currency?: CurrencyCode;
}

interface ExportRow {
  label: string;
  value: string;
}

interface PdfLayout {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
  footerY: number;
  y: number;
}

const PDF_MARGIN = 18;
const PDF_LINE_HEIGHT = 5;
const PDF_LABEL_WIDTH = 58;
const PDF_ROW_GAP = 6;
const PDF_ROW_PADDING = 3;

const normalizePdfText = (value: string): string => {
  return value.replace(/\s+/g, ' ').trim();
};

const fileNamePart = (value: string): string => {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'opportunite';
};

const formatDate = (value?: string): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(getBrowserLocale(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const formatDateTime = (value?: string): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(getBrowserLocale(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatAmount = (amount: number, currency?: CurrencyCode): string => {
  if (currency === CurrencyCode.MT2) {
    return `${amount.toLocaleString(getBrowserLocale(), {
      style: 'unit',
      unit: 'meter',
      unitDisplay: 'narrow',
    })}²`;
  }

  return amount.toLocaleString(getBrowserLocale(), {
    style: 'currency',
    currency: currency ?? DEFAULT_CURRENCY,
  });
};

const formatBoolean = (value: boolean): string => {
  return value
    ? Translations.YesLabel[DEFAULT_LANGUAGE]
    : Translations.NoLabel[DEFAULT_LANGUAGE];
};

const contactNameFor = (accounts: Account[], id: string): string => {
  return (
    accounts.find((account) => account._id === id)?.name
    ?? Translations.OpportunitySheetContactNotFound[DEFAULT_LANGUAGE]
  );
};

const formatAttributeValue = (
  attribute: SchemaAttribute,
  value: string | number | boolean | null | undefined,
  accounts: Account[]
): string => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (SchemaHelper.isReferenceAttribute(attribute)) {
    return contactNameFor(accounts, value.toString());
  }

  if (attribute.type === SchemaAttributeType.Boolean && typeof value === 'boolean') {
    return formatBoolean(value);
  }

  return value.toString();
};

const buildAttributeRows = (card: Card, schema: Schema | undefined, accounts: Account[]) => {
  if (!schema?.attributes) {
    return [];
  }

  return schema.attributes
    .slice()
    .sort((left, right) => left.index - right.index)
    .map((attribute) => ({
      label: attribute.name,
      value: formatAttributeValue(attribute, card.attributes?.[attribute.key], accounts),
    }))
    .filter((row) => row.value !== '');
};

const buildSummaryRows = ({
  card,
  lane,
  owner,
  amountLabel,
  currency,
}: OpportunitySheetExportParams): ExportRow[] => {
  return [
    { label: Translations.OpportunityNameLabel[DEFAULT_LANGUAGE], value: card.name },
    { label: Translations.StageLabel[DEFAULT_LANGUAGE], value: lane?.name ?? '' },
    { label: Translations.UserLabel[DEFAULT_LANGUAGE], value: owner?.name ?? '' },
    { label: amountLabel, value: formatAmount(card.amount, currency) },
    { label: Translations.NextFollowUpLabel[DEFAULT_LANGUAGE], value: formatDate(card.nextFollowUpAt) },
    {
      label: Translations.ExpectedCloseDateLabel[DEFAULT_LANGUAGE],
      value: formatDate(card.closedAt),
    },
    { label: Translations.CreatedAtLabel[DEFAULT_LANGUAGE], value: formatDateTime(card.createdAt) },
    { label: Translations.LastUpdateLabel[DEFAULT_LANGUAGE], value: formatDateTime(card.updatedAt) },
  ].filter((row) => row.value !== '');
};

const splitText = (doc: JsPdfDocument, text: string, maxWidth: number): string[] => {
  return doc.splitTextToSize(normalizePdfText(text), maxWidth) as string[];
};

const getLayout = (doc: JsPdfDocument): PdfLayout => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  return {
    pageWidth,
    pageHeight,
    margin: PDF_MARGIN,
    contentWidth: pageWidth - PDF_MARGIN * 2,
    footerY: pageHeight - PDF_MARGIN,
    y: PDF_MARGIN,
  };
};

const ensureSpace = (doc: JsPdfDocument, layout: PdfLayout, height: number): void => {
  if (layout.y + height <= layout.footerY - 8) {
    return;
  }

  doc.addPage();
  layout.y = layout.margin;
};

const drawTitle = (doc: JsPdfDocument, layout: PdfLayout, params: OpportunitySheetExportParams): void => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(29, 29, 27);
  doc.text(Translations.OpportunitySheetTitle[DEFAULT_LANGUAGE], layout.margin, layout.y);
  layout.y += 9;

  if (params.team?.name) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(85, 85, 85);
    doc.text(params.team.name, layout.margin, layout.y);
    layout.y += 7;
  }

  doc.setDrawColor(29, 29, 27);
  doc.setLineWidth(0.4);
  doc.line(layout.margin, layout.y, layout.pageWidth - layout.margin, layout.y);
  layout.y += 11;
};

const drawSectionTitle = (doc: JsPdfDocument, layout: PdfLayout, title: string): void => {
  ensureSpace(doc, layout, 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(29, 29, 27);
  doc.text(title, layout.margin, layout.y);
  layout.y += 7;
};

const drawEmptyState = (doc: JsPdfDocument, layout: PdfLayout): void => {
  ensureSpace(doc, layout, 8);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(Translations.OpportunitySheetNoData[DEFAULT_LANGUAGE], layout.margin, layout.y);
  layout.y += 8;
};

const drawRows = (doc: JsPdfDocument, layout: PdfLayout, rows: ExportRow[]): void => {
  if (rows.length === 0) {
    drawEmptyState(doc, layout);
    return;
  }

  const valueX = layout.margin + PDF_LABEL_WIDTH + PDF_ROW_GAP;
  const valueWidth = layout.contentWidth - PDF_LABEL_WIDTH - PDF_ROW_GAP;

  rows.forEach((row) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const labelLines = splitText(doc, row.label, PDF_LABEL_WIDTH);
    doc.setFont('helvetica', 'normal');
    const valueLines = splitText(doc, row.value, valueWidth);
    const lineCount = Math.max(labelLines.length, valueLines.length);
    const rowHeight = lineCount * PDF_LINE_HEIGHT + PDF_ROW_PADDING * 2;

    ensureSpace(doc, layout, rowHeight);

    const rowTop = layout.y;
    const textY = rowTop + PDF_ROW_PADDING + 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(85, 85, 85);
    doc.text(labelLines, layout.margin, textY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(29, 29, 27);
    doc.text(valueLines, valueX, textY);

    layout.y = rowTop + rowHeight;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(layout.margin, layout.y, layout.pageWidth - layout.margin, layout.y);
  });

  layout.y += 7;
};

const drawFooters = (doc: JsPdfDocument, layout: PdfLayout, generatedAt: string): void => {
  const pages = doc.getNumberOfPages();
  const footer = `${Translations.OpportunitySheetGeneratedAt[DEFAULT_LANGUAGE]} ${formatDateTime(generatedAt)}. ${Translations.OpportunitySheetContactsNameOnly[DEFAULT_LANGUAGE]}`;
  const footerLines = splitText(doc, footer, layout.contentWidth - 22);

  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(layout.margin, layout.footerY - 6, layout.pageWidth - layout.margin, layout.footerY - 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(footerLines, layout.margin, layout.footerY - 2);
    doc.text(`${page}/${pages}`, layout.pageWidth - layout.margin, layout.footerY - 2, { align: 'right' });
  }
};

const buildSheetPdf = (doc: JsPdfDocument, params: OpportunitySheetExportParams): JsPdfDocument => {
  const layout = getLayout(doc);
  const generatedAt = new Date().toISOString();
  const summaryRows = buildSummaryRows(params);
  const attributeRows = buildAttributeRows(params.card, params.schema, params.accounts);

  doc.setProperties({
    title: `${Translations.OpportunitySheetTitle[DEFAULT_LANGUAGE]} - ${params.card.name}`,
    subject: Translations.OpportunitySheetTitle[DEFAULT_LANGUAGE],
  });

  drawTitle(doc, layout, params);
  drawSectionTitle(doc, layout, Translations.OpportunitySheetSummaryTitle[DEFAULT_LANGUAGE]);
  drawRows(doc, layout, summaryRows);
  drawSectionTitle(doc, layout, Translations.OpportunitySheetDetailsTitle[DEFAULT_LANGUAGE]);
  drawRows(doc, layout, attributeRows);
  drawFooters(doc, layout, generatedAt);

  return doc;
};

export const downloadOpportunitySheet = async (params: OpportunitySheetExportParams): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = buildSheetPdf(new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }), params);

  doc.save(`fiche-opportunite-${fileNamePart(params.card.name)}.pdf`);
};
