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

interface ExportSection {
  title: string;
  rows: ExportRow[];
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
const PDF_COLUMN_GAP = 8;
const PDF_HEADER_GAP = 12;

const normalizePdfText = (value: string): string => {
  return value.replace(/\s+/g, ' ').trim();
};

const normalizeFieldName = (value: string): string => {
  return normalizePdfText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
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

const formatOwnerIdentifier = (owner?: User): string => {
  if (!owner) {
    return '';
  }

  return owner._id || owner.name;
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

const buildHeaderRows = ({
  card,
  lane,
  owner,
}: OpportunitySheetExportParams): ExportRow[] => {
  return [
    { label: Translations.UserLabel[DEFAULT_LANGUAGE], value: formatOwnerIdentifier(owner) },
    { label: Translations.StageLabel[DEFAULT_LANGUAGE], value: lane?.name ?? '' },
    {
      label: Translations.CreatedAtLabel[DEFAULT_LANGUAGE],
      value: formatDateTime(card.createdAt),
    },
    { label: Translations.LastUpdateLabel[DEFAULT_LANGUAGE], value: formatDateTime(card.updatedAt) },
    { label: Translations.NextFollowUpLabel[DEFAULT_LANGUAGE], value: formatDate(card.nextFollowUpAt) },
  ].filter((row) => row.value !== '');
};

const buildAttributeLookup = (params: OpportunitySheetExportParams): Map<string, string> => {
  return new Map(
    buildAttributeRows(params.card, params.schema, params.accounts)
      .map((row) => [normalizeFieldName(row.label), row.value])
  );
};

const getLookupValue = (lookup: Map<string, string>, label: string): string => {
  return lookup.get(normalizeFieldName(label)) ?? '';
};

const buildOrderedRows = (lookup: Map<string, string>, labels: string[]): ExportRow[] => {
  return labels
    .map((label) => ({ label, value: getLookupValue(lookup, label) }))
    .filter((row) => row.value !== '');
};

const buildSections = (params: OpportunitySheetExportParams): ExportSection[] => {
  const lookup = buildAttributeLookup(params);

  return [
    {
      title: Translations.OpportunitySheetWorksiteInfoTitle[DEFAULT_LANGUAGE],
      rows: buildOrderedRows(lookup, [
        'Description',
        'Adresse',
        'Code Postal',
        'Ville',
        'Financement',
        'Typologie de Chantier',
        'Marque CCTP',
        'ITE',
        'SEL',
        'Autre',
      ]),
    },
    {
      title: Translations.OpportunitySheetStakeholdersTitle[DEFAULT_LANGUAGE],
      rows: buildOrderedRows(lookup, [
        "Maîtrise d'ouvrage",
        "Maîtrise d'oeuvre",
        'Architecte',
        'Distributeur',
        "Secteur d’activité",
        'Entreprise adjudicatrice',
      ]),
    },
  ];
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

const drawTitle = (
  doc: JsPdfDocument,
  x: number,
  y: number,
  width: number,
  params: OpportunitySheetExportParams
): number => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(29, 29, 27);
  const titleLines = splitText(doc, params.card.name, width);
  doc.text(titleLines, x, y);
  let currentY = y + titleLines.length * 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(85, 85, 85);
  doc.text(formatAmount(params.card.amount, params.currency), x, currentY);
  currentY += 8;

  return currentY;
};

const drawSectionTitle = (doc: JsPdfDocument, x: number, y: number, title: string, align: 'left' | 'right' = 'left'): void => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(85, 85, 85);
  doc.text(title, x, y, align === 'right' ? { align: 'right' } : undefined);
};

const drawEmptyState = (doc: JsPdfDocument, x: number, y: number, width: number): number => {
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(splitText(doc, Translations.OpportunitySheetNoData[DEFAULT_LANGUAGE], width), x, y);
  return y + 6;
};

const drawGeneralInfoRows = (
  doc: JsPdfDocument,
  x: number,
  y: number,
  width: number,
  rows: ExportRow[]
): number => {
  drawSectionTitle(doc, x + width, y, Translations.OpportunitySheetGeneralInfoTitle[DEFAULT_LANGUAGE], 'right');
  let currentY = y + 6;

  rows.forEach((row) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(85, 85, 85);
    const labelWidth = Math.min(34, width * 0.42);
    const valueX = x + labelWidth + 4;
    const valueWidth = width - labelWidth - 4;
    const labelLines = splitText(doc, row.label, labelWidth);

    doc.text(labelLines, x, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(29, 29, 27);
    const valueLines = splitText(doc, row.value, valueWidth);
    doc.text(valueLines, valueX, currentY);

    currentY += Math.max(labelLines.length * 4.5, valueLines.length * 4.5) + 2;
  });

  return currentY;
};

const drawSectionColumn = (
  doc: JsPdfDocument,
  x: number,
  startY: number,
  width: number,
  section: ExportSection
): number => {
  let y = startY;
  drawSectionTitle(doc, x, y, section.title);
  y += 6;

  if (section.rows.length === 0) {
    return drawEmptyState(doc, x, y, width);
  }

  section.rows.forEach((row) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(85, 85, 85);
    const labelLines = splitText(doc, row.label, width);
    doc.text(labelLines, x, y);
    y += labelLines.length * 4.2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(29, 29, 27);
    const valueLines = splitText(doc, row.value, width);
    doc.text(valueLines, x, y);
    y += valueLines.length * 4.6 + 4;
  });

  return y;
};

const drawHeader = (doc: JsPdfDocument, layout: PdfLayout, params: OpportunitySheetExportParams, rows: ExportRow[]): void => {
  const leftWidth = layout.contentWidth * 0.52;
  const rightWidth = layout.contentWidth - leftWidth - PDF_HEADER_GAP;
  const startY = layout.y;
  const leftY = drawTitle(doc, layout.margin, startY, leftWidth, params);
  const rightX = layout.margin + leftWidth + PDF_HEADER_GAP;
  const rightY = drawGeneralInfoRows(doc, rightX, startY, rightWidth, rows);

  layout.y = Math.max(leftY, rightY) + 4;
  doc.setDrawColor(29, 29, 27);
  doc.setLineWidth(0.4);
  doc.line(layout.margin, layout.y, layout.pageWidth - layout.margin, layout.y);
  layout.y += 8;
};

const drawSectionColumns = (doc: JsPdfDocument, layout: PdfLayout, sections: ExportSection[]): void => {
  const columnWidth = (layout.contentWidth - PDF_COLUMN_GAP) / 2;
  const startY = layout.y;
  let maxY = startY;

  sections.forEach((section, index) => {
    const x = layout.margin + index * (columnWidth + PDF_COLUMN_GAP);
    const y = drawSectionColumn(doc, x, startY, columnWidth, section);
    maxY = Math.max(maxY, y);
  });

  layout.y = maxY + 4;
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
  const headerRows = buildHeaderRows(params);
  const sections = buildSections(params);

  doc.setProperties({
    title: `${Translations.OpportunitySheetTitle[DEFAULT_LANGUAGE]} - ${params.card.name}`,
    subject: Translations.OpportunitySheetTitle[DEFAULT_LANGUAGE],
  });

  drawHeader(doc, layout, params, headerRows);
  drawSectionColumns(doc, layout, sections);
  drawFooters(doc, layout, generatedAt);

  return doc;
};

export const downloadOpportunitySheet = async (params: OpportunitySheetExportParams): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = buildSheetPdf(new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }), params);

  doc.save(`fiche-opportunite-${fileNamePart(params.card.name)}.pdf`);
};
