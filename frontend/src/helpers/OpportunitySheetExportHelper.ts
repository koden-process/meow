import type { jsPDF as JsPdfDocument } from 'jspdf';
import { Account } from '../interfaces/Account';
import { Card } from '../interfaces/Card';
import { Lane } from '../interfaces/Lane';
import { Schema, SchemaAttribute, SchemaAttributeType } from '../interfaces/Schema';
import { CurrencyCode, Team } from '../interfaces/Team';
import { User } from '../interfaces/User';
import { DEFAULT_CURRENCY, DEFAULT_LANGUAGE } from '../Constants';
import { Translations } from '../Translations';
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

interface FieldSpec {
  label: string;
  aliases?: string[];
}

interface CardStyle {
  fill: [number, number, number];
  border: [number, number, number];
  title: [number, number, number];
  label: [number, number, number];
  value: [number, number, number];
}

interface PdfAssets {
  preskriptionLogo?: string;
  unikaloFooterLogo?: string;
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const FOOTER_HEIGHT = 8.5;
const COLOR_DARK: [number, number, number] = [29, 29, 27];
const COLOR_GREY_CARD: [number, number, number] = [145, 142, 142];
const COLOR_GREY_BORDER: [number, number, number] = [135, 135, 135];
const COLOR_FOOTER: [number, number, number] = [105, 105, 105];
const COLOR_WHITE: [number, number, number] = [255, 255, 255];
const PDF_LOCALE = 'fr-FR';

const WORKSITE_FIELDS: FieldSpec[] = [
  { label: 'Description' },
  { label: 'Adresse' },
  { label: 'Code Postal', aliases: ['Code postal'] },
  { label: 'Ville' },
  { label: 'Financement' },
  { label: 'Typologie de Chantier', aliases: ['Typologie de chantier'] },
  { label: 'Marque CCTP' },
  { label: 'ITE' },
  { label: 'SEL' },
  { label: 'Autre' },
];

const STAKEHOLDER_FIELDS: FieldSpec[] = [
  { label: "Maîtrise d'ouvrage", aliases: ['Maîtrise d’ouvrage'] },
  { label: "Maîtrise d'oeuvre", aliases: ['Maîtrise d’œuvre', "Maîtrise d'oeuvre"] },
  { label: 'Architecte' },
  { label: 'Distributeur' },
  { label: "Secteur d’activité", aliases: ["Secteur d'activite", "Secteur d'activité"] },
  { label: 'Entreprise adjudicatrice' },
];

const setTextColor = (doc: JsPdfDocument, color: [number, number, number]): void => {
  doc.setTextColor(color[0], color[1], color[2]);
};

const setFillColor = (doc: JsPdfDocument, color: [number, number, number]): void => {
  doc.setFillColor(color[0], color[1], color[2]);
};

const setDrawColor = (doc: JsPdfDocument, color: [number, number, number]): void => {
  doc.setDrawColor(color[0], color[1], color[2]);
};

const normalizePdfText = (value: string): string => {
  return value.replace(/\s+/g, ' ').trim();
};

const normalizeFieldName = (value: string): string => {
  return normalizePdfText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`´]/g, "'")
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'oe')
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

  return new Intl.DateTimeFormat(PDF_LOCALE, {
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

  return new Intl.DateTimeFormat(PDF_LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatAmount = (amount: number, currency?: CurrencyCode): string => {
  if (currency === CurrencyCode.MT2) {
    const value = amount.toLocaleString(PDF_LOCALE, {
      maximumFractionDigits: 2,
      useGrouping: false,
    });

    return `${value} m²`;
  }

  return amount.toLocaleString(PDF_LOCALE, {
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

  return owner.name || owner._id;
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
    { label: 'Dernière MAJ', value: formatDateTime(card.updatedAt) },
    { label: Translations.NextFollowUpLabel[DEFAULT_LANGUAGE], value: formatDate(card.nextFollowUpAt) },
  ].filter((row) => row.value !== '');
};

const buildAttributeLookup = (params: OpportunitySheetExportParams): Map<string, string> => {
  return new Map(
    buildAttributeRows(params.card, params.schema, params.accounts)
      .map((row) => [normalizeFieldName(row.label), row.value])
  );
};

const getLookupValue = (lookup: Map<string, string>, spec: FieldSpec): string => {
  const labels = [spec.label, ...(spec.aliases ?? [])];

  for (const label of labels) {
    const value = lookup.get(normalizeFieldName(label));

    if (value) {
      return value;
    }
  }

  return '';
};

const buildOrderedRows = (lookup: Map<string, string>, specs: FieldSpec[]): ExportRow[] => {
  return specs
    .map((spec) => ({ label: spec.label, value: getLookupValue(lookup, spec) }))
    .filter((row) => row.value !== '');
};

const buildSections = (params: OpportunitySheetExportParams): ExportSection[] => {
  const lookup = buildAttributeLookup(params);

  return [
    {
      title: Translations.OpportunitySheetWorksiteInfoTitle[DEFAULT_LANGUAGE],
      rows: buildOrderedRows(lookup, WORKSITE_FIELDS),
    },
    {
      title: Translations.OpportunitySheetStakeholdersTitle[DEFAULT_LANGUAGE],
      rows: buildOrderedRows(lookup, STAKEHOLDER_FIELDS),
    },
  ];
};

const splitText = (doc: JsPdfDocument, text: string, maxWidth: number): string[] => {
  return doc.splitTextToSize(normalizePdfText(text), maxWidth) as string[];
};

const truncateLines = (lines: string[], maxLines: number): string[] => {
  if (lines.length <= maxLines) {
    return lines;
  }

  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\.*$/, '')}...`;

  return kept;
};

const loadImageDataUrl = async (path: string): Promise<string | undefined> => {
  try {
    const response = await fetch(path);

    if (!response.ok) {
      return undefined;
    }

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result?.toString());
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Unable to load PDF asset ${path}`, error);
    return undefined;
  }
};

const loadPdfAssets = async (): Promise<PdfAssets> => {
  const [preskriptionLogo, unikaloFooterLogo] = await Promise.all([
    loadImageDataUrl('/pdf-assets/preskription-logo.png'),
    loadImageDataUrl('/pdf-assets/unikalo-footer-logo.png'),
  ]);

  return {
    preskriptionLogo,
    unikaloFooterLogo,
  };
};

const drawFallbackPreskriptionLogo = (doc: JsPdfDocument, x: number, y: number): void => {
  setTextColor(doc, [226, 28, 35]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PRESKRIPTION', x, y + 12);
  doc.setFontSize(4);
  doc.text('unikalo', x + 22, y + 15);
};

const drawFallbackUnikaloLogo = (doc: JsPdfDocument, x: number, y: number): void => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setTextColor(doc, [226, 28, 35]);
  doc.text('u', x, y);
  setTextColor(doc, COLOR_WHITE);
  doc.text('nikalo', x + 3.2, y);
};

const drawInfoIcon = (doc: JsPdfDocument, cx: number, cy: number): void => {
  setDrawColor(doc, COLOR_WHITE);
  doc.setLineWidth(0.55);
  doc.circle(cx, cy, 4.2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setTextColor(doc, COLOR_WHITE);
  doc.text('i', cx, cy + 3, { align: 'center' });
};

const drawBuildingIcon = (doc: JsPdfDocument, cx: number, cy: number): void => {
  setDrawColor(doc, COLOR_WHITE);
  doc.setLineWidth(0.7);
  doc.roundedRect(cx - 4.8, cy - 5.2, 9.6, 10.4, 0.8, 0.8, 'S');
  setFillColor(doc, COLOR_WHITE);

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 2; column += 1) {
      doc.rect(cx - 3 + column * 3.2, cy - 3.3 + row * 2.4, 1.2, 1.2, 'F');
    }
  }

  doc.rect(cx - 1.2, cy + 2.8, 2.4, 2.4, 'F');
};

const drawUsersIcon = (doc: JsPdfDocument, cx: number, cy: number): void => {
  setDrawColor(doc, COLOR_WHITE);
  setFillColor(doc, COLOR_WHITE);
  doc.setLineWidth(0.55);
  doc.circle(cx, cy - 3.6, 2.2, 'S');
  doc.circle(cx - 4.3, cy - 2.2, 1.9, 'S');
  doc.circle(cx + 4.3, cy - 2.2, 1.9, 'S');
  doc.roundedRect(cx - 3.1, cy - 0.4, 6.2, 6.2, 1.2, 1.2, 'S');
  doc.roundedRect(cx - 7.2, cy + 0.7, 5, 5, 1, 1, 'S');
  doc.roundedRect(cx + 2.2, cy + 0.7, 5, 5, 1, 1, 'S');
};

const drawSectionIcon = (
  doc: JsPdfDocument,
  cx: number,
  cy: number,
  icon: 'info' | 'building' | 'users'
): void => {
  setFillColor(doc, COLOR_GREY_CARD);
  setDrawColor(doc, COLOR_WHITE);
  doc.setLineWidth(1);
  doc.circle(cx, cy, 8.5, 'FD');

  if (icon === 'info') {
    drawInfoIcon(doc, cx, cy);
  }

  if (icon === 'building') {
    drawBuildingIcon(doc, cx, cy);
  }

  if (icon === 'users') {
    drawUsersIcon(doc, cx, cy);
  }
};

const drawCard = (
  doc: JsPdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  style: CardStyle
): void => {
  setFillColor(doc, style.fill);
  setDrawColor(doc, style.border);
  doc.setLineWidth(0.8);
  doc.roundedRect(x, y, width, height, radius, radius, 'FD');
};

const drawCardTitle = (
  doc: JsPdfDocument,
  x: number,
  y: number,
  width: number,
  title: string,
  color: [number, number, number]
): void => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  setTextColor(doc, color);
  doc.text(title, x + width / 2, y, { align: 'center' });
};

const drawRows = (
  doc: JsPdfDocument,
  rows: ExportRow[],
  x: number,
  y: number,
  width: number,
  maxY: number,
  labelWidth: number,
  style: CardStyle
): void => {
  let currentY = y;

  if (rows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.4);
    setTextColor(doc, style.value);
    doc.text(Translations.OpportunitySheetNoData[DEFAULT_LANGUAGE], x, currentY);
    return;
  }

  rows.forEach((row) => {
    if (currentY >= maxY) {
      return;
    }

    const valueX = x + labelWidth + 5;
    const valueWidth = width - labelWidth - 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    setTextColor(doc, style.label);
    const labelLines = truncateLines(splitText(doc, row.label, labelWidth), 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    const valueLines = truncateLines(splitText(doc, row.value, valueWidth), 3);
    const rowHeight = Math.max(labelLines.length, valueLines.length) * 3.6;

    if (currentY + rowHeight > maxY) {
      return;
    }

    doc.setFont('helvetica', 'bold');
    setTextColor(doc, style.label);
    doc.text(labelLines, x, currentY);

    doc.setFont('helvetica', 'normal');
    setTextColor(doc, style.value);
    doc.text(valueLines, valueX, currentY);

    currentY += rowHeight + 7.2;
  });
};

const drawHeader = (
  doc: JsPdfDocument,
  params: OpportunitySheetExportParams,
  assets: PdfAssets
): void => {
  if (assets.preskriptionLogo) {
    doc.addImage(assets.preskriptionLogo, 'PNG', 39.5, 12, 51.2, 26.8);
  } else {
    drawFallbackPreskriptionLogo(doc, 42, 18);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  setTextColor(doc, COLOR_DARK);
  const titleLines = truncateLines(splitText(doc, params.card.name, 92), 3);
  doc.text(titleLines, 18, 55);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  setTextColor(doc, [75, 75, 75]);
  doc.text(formatAmount(params.card.amount, params.currency), 18, 76);
};

const drawGeneralInfo = (doc: JsPdfDocument, rows: ExportRow[]): void => {
  const style: CardStyle = {
    fill: COLOR_GREY_CARD,
    border: COLOR_GREY_CARD,
    title: COLOR_WHITE,
    label: COLOR_WHITE,
    value: COLOR_WHITE,
  };
  const x = 118;
  const y = 13;
  const width = 75;
  const height = 88;

  drawCard(doc, x, y, width, height, 4, style);
  drawSectionIcon(doc, x + width / 2, y, 'info');
  drawCardTitle(doc, x, y + 14.5, width, Translations.OpportunitySheetGeneralInfoTitle[DEFAULT_LANGUAGE], style.title);
  drawRows(doc, rows, x + 5, y + 27, width - 10, y + height - 8, 18.5, style);
};

const drawWorksiteSection = (doc: JsPdfDocument, section: ExportSection): void => {
  const style: CardStyle = {
    fill: COLOR_WHITE,
    border: COLOR_GREY_BORDER,
    title: [110, 110, 110],
    label: COLOR_DARK,
    value: COLOR_DARK,
  };
  const x = 12.5;
  const y = 115;
  const width = 100;
  const height = 164.5;

  drawCard(doc, x, y, width, height, 4, style);
  drawSectionIcon(doc, x + width / 2, y, 'building');
  drawCardTitle(doc, x, y + 15.5, width, section.title, style.title);
  drawRows(doc, section.rows, x + 5.5, y + 28, width - 11, y + height - 9, 38, style);
};

const drawStakeholdersSection = (doc: JsPdfDocument, section: ExportSection): void => {
  const style: CardStyle = {
    fill: COLOR_GREY_CARD,
    border: COLOR_GREY_CARD,
    title: COLOR_WHITE,
    label: COLOR_WHITE,
    value: COLOR_WHITE,
  };
  const x = 118;
  const y = 115;
  const width = 75;
  const height = 164.5;

  drawCard(doc, x, y, width, height, 4, style);
  drawSectionIcon(doc, x + width / 2, y, 'users');
  drawCardTitle(doc, x, y + 15.5, width, section.title, style.title);
  drawRows(doc, section.rows, x + 5, y + 28, width - 10, y + height - 9, 23, style);
};

const drawFooter = (doc: JsPdfDocument, generatedAt: string, assets: PdfAssets): void => {
  const y = PAGE_HEIGHT - FOOTER_HEIGHT;
  setFillColor(doc, COLOR_FOOTER);
  doc.rect(0, y, PAGE_WIDTH, FOOTER_HEIGHT, 'F');

  if (assets.unikaloFooterLogo) {
    doc.addImage(assets.unikaloFooterLogo, 'PNG', 12.5, y + 1.8, 19.7, 7.7);
  } else {
    drawFallbackUnikaloLogo(doc, 13, y + 6);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  setTextColor(doc, COLOR_WHITE);
  doc.text(
    `${Translations.OpportunitySheetTitle[DEFAULT_LANGUAGE]} - Export du ${formatDate(generatedAt)}`,
    PAGE_WIDTH - 16,
    y + 6,
    { align: 'right' }
  );
};

const drawWhiteBackground = (doc: JsPdfDocument): void => {
  setFillColor(doc, COLOR_WHITE);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
};

const buildSheetPdf = (
  doc: JsPdfDocument,
  params: OpportunitySheetExportParams,
  assets: PdfAssets
): JsPdfDocument => {
  const generatedAt = new Date().toISOString();
  const headerRows = buildHeaderRows(params);
  const sections = buildSections(params);

  doc.setProperties({
    title: `${Translations.OpportunitySheetTitle[DEFAULT_LANGUAGE]} - ${params.card.name}`,
    subject: Translations.OpportunitySheetTitle[DEFAULT_LANGUAGE],
  });

  drawWhiteBackground(doc);
  drawHeader(doc, params, assets);
  drawGeneralInfo(doc, headerRows);
  drawWorksiteSection(doc, sections[0]);
  drawStakeholdersSection(doc, sections[1]);
  drawFooter(doc, generatedAt, assets);

  return doc;
};

export const downloadOpportunitySheet = async (params: OpportunitySheetExportParams): Promise<void> => {
  const [{ jsPDF }, assets] = await Promise.all([
    import('jspdf'),
    loadPdfAssets(),
  ]);
  const doc = buildSheetPdf(
    new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }),
    params,
    assets
  );

  doc.save(`fiche-opportunite-${fileNamePart(params.card.name)}.pdf`);
};
