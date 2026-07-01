import { Account } from '../interfaces/Account';
import { Card } from '../interfaces/Card';
import { Lane } from '../interfaces/Lane';
import { Schema, SchemaAttribute, SchemaAttributeType } from '../interfaces/Schema';
import { CurrencyCode, Team } from '../interfaces/Team';
import { User } from '../interfaces/User';
import { DEFAULT_CURRENCY, DEFAULT_LANGUAGE } from '../Constants';
import { Translations } from '../Translations';
import { SchemaHelper } from './SchemaHelper';

export interface OpportunitySheetExportParams {
  card: Card;
  schema?: Schema;
  accounts: Account[];
  lane?: Lane;
  owner?: User;
  team?: Team;
  amountLabel: string;
  currency?: CurrencyCode;
}

export interface OpportunityExportDate {
  iso: string;
  display: string;
}

export interface OpportunityAttributeExportValue {
  key: string;
  index: number;
  name: string;
  type: string;
  rawValue: string | number | boolean | null;
  displayValue: string;
  referenceId?: string;
  referenceName?: string;
}

export interface OpportunityExportContextV1 {
  version: '1';
  locale: string;
  generatedAt: OpportunityExportDate;
  opportunity: {
    id: string;
    name: string;
    status: string | null;
    amount: {
      raw: number;
      display: string;
      label: string;
      unit: string;
    };
    createdAt: OpportunityExportDate;
    updatedAt: OpportunityExportDate;
    closedAt: OpportunityExportDate | null;
    nextFollowUpAt: OpportunityExportDate | null;
  };
  owner: { id: string; name: string } | null;
  lane: { id: string; name: string; index: number } | null;
  team: { id: string; name: string; currency: string } | null;
  attributes: OpportunityAttributeExportValue[];
  attributesByKey: Record<string, OpportunityAttributeExportValue>;
}

export interface OpportunityExportContextOptions {
  generatedAt: Date;
  locale: string;
}

const formatDate = (date: Date, locale: string, includeTime: boolean): string => {
  const options: Intl.DateTimeFormatOptions = includeTime
    ? {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }
    : {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

  return new Intl.DateTimeFormat(locale, options).format(date);
};

const exportDate = (
  value: string,
  locale: string,
  includeTime: boolean
): OpportunityExportDate => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { iso: value, display: value };
  }

  return {
    iso: date.toISOString(),
    display: formatDate(date, locale, includeTime),
  };
};

const optionalExportDate = (
  value: string | undefined,
  locale: string,
  includeTime: boolean
): OpportunityExportDate | null => {
  return value ? exportDate(value, locale, includeTime) : null;
};

const formatAmount = (
  amount: number,
  currency: CurrencyCode | undefined,
  locale: string
): { display: string; unit: string } => {
  if (currency === CurrencyCode.MT2) {
    const display = amount.toLocaleString(locale, {
      style: 'unit',
      unit: 'meter',
      unitDisplay: 'narrow',
    });

    return { display: `${display}²`, unit: 'm²' };
  }

  const unit = currency ?? DEFAULT_CURRENCY;

  return {
    display: amount.toLocaleString(locale, {
      style: 'currency',
      currency: unit,
    }),
    unit,
  };
};

const normalizeRawValue = (
  value: string | number | boolean | null | undefined
): string | number | boolean | null => {
  return value === undefined ? null : value;
};

const buildAttributeValue = (
  attribute: SchemaAttribute,
  value: string | number | boolean | null | undefined,
  accounts: Account[]
): OpportunityAttributeExportValue => {
  const rawValue = normalizeRawValue(value);
  const baseValue: OpportunityAttributeExportValue = {
    key: attribute.key,
    index: attribute.index,
    name: attribute.name,
    type: attribute.type,
    rawValue,
    displayValue: rawValue === null ? '' : String(rawValue),
  };

  if (SchemaHelper.isReferenceAttribute(attribute) && rawValue !== null && rawValue !== '') {
    const referenceId = String(rawValue);
    const referenceName = accounts.find((account) => account._id === referenceId)?.name;

    return {
      ...baseValue,
      referenceId,
      referenceName,
      displayValue:
        referenceName ?? Translations.OpportunitySheetContactNotFound[DEFAULT_LANGUAGE],
    };
  }

  if (attribute.type === SchemaAttributeType.Boolean && typeof rawValue === 'boolean') {
    return {
      ...baseValue,
      displayValue: rawValue
        ? Translations.YesLabel[DEFAULT_LANGUAGE]
        : Translations.NoLabel[DEFAULT_LANGUAGE],
    };
  }

  return baseValue;
};

export const buildOpportunityExportContext = (
  params: OpportunitySheetExportParams,
  options: OpportunityExportContextOptions
): OpportunityExportContextV1 => {
  const { locale, generatedAt } = options;
  const amount = formatAmount(params.card.amount, params.currency, locale);
  const attributes = (params.schema?.attributes ?? [])
    .slice()
    .sort((left, right) => left.index - right.index)
    .map((attribute) =>
      buildAttributeValue(
        attribute,
        params.card.attributes?.[attribute.key],
        params.accounts
      )
    );

  return {
    version: '1',
    locale,
    generatedAt: {
      iso: generatedAt.toISOString(),
      display: formatDate(generatedAt, locale, true),
    },
    opportunity: {
      id: params.card._id,
      name: params.card.name,
      status: params.card.status ?? null,
      amount: {
        raw: params.card.amount,
        display: amount.display,
        label: params.amountLabel,
        unit: amount.unit,
      },
      createdAt: exportDate(params.card.createdAt, locale, true),
      updatedAt: exportDate(params.card.updatedAt, locale, true),
      closedAt: optionalExportDate(params.card.closedAt, locale, false),
      nextFollowUpAt: optionalExportDate(params.card.nextFollowUpAt, locale, false),
    },
    owner: params.owner
      ? { id: params.owner._id, name: params.owner.name }
      : null,
    lane: params.lane
      ? { id: params.lane._id, name: params.lane.name, index: params.lane.index }
      : null,
    team: params.team
      ? {
        id: params.team._id,
        name: params.team.name,
        currency: params.team.currency,
      }
      : null,
    attributes,
    attributesByKey: Object.fromEntries(
      attributes.map((attribute) => [attribute.key, attribute])
    ),
  };
};

export const opportunityPdfFileName = (opportunityName: string): string => {
  const normalized = opportunityName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `fiche-opportunite-${normalized || 'opportunite'}.pdf`;
};
