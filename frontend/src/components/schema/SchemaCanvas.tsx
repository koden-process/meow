import { Fragment, useEffect, useState } from 'react';
import { SchemaAttribute, Schema, SchemaSelectAttribute } from '../../interfaces/Schema';
import { SelectAttribute } from './SelectAttribute';
import { TextAreaAttribute } from './TextAreaAttribute';
import { TextAttribute } from './TextAttribute';
import { ReferenceAttribute } from './ReferenceAttribute';
import { BooleanAttribute } from './BooleanAttribute';
import { Attribute } from '../../interfaces/Attribute';
import { EmailAttribute } from './EmailAttribute';
import { LinkAttribute } from './LinkAttribute';

const toStringOrNull = (value: unknown) => {
  if (typeof value === 'undefined' || value === null) {
    return null;
  }

  return value ? value.toString() : null;
};

const toBooleanOrNull = (value: unknown): boolean | null => {
  if (typeof value === 'undefined' || value === null) {
    return null;
  }

  return Boolean(value);
};

export interface SchemaCanvasProps {
  schema: Schema;
  values?: Attribute;
  isDisabled: boolean;
  validate: (values: Attribute) => void;
}

export const SchemaCanvas = ({
  schema,
  values: valuesImport,
  validate,
  isDisabled,
}: SchemaCanvasProps) => {
  const [values, setValues] = useState<Attribute | undefined>(valuesImport);

  useEffect(() => {
    setValues(valuesImport);
  }, [valuesImport]);

  const updateAttribute = (key: string, value: Attribute[typeof key] | null) => {
    const updated = { ...values };

    if (value === null) {
      delete updated[key];
    } else {
      updated[key] = value;
    }

    setValues({ ...updated });
    validate({ ...updated });
  };

  const getAttribute = (attribute: SchemaAttribute, value: string | number | boolean | null) => {
    const { key: _key, ...attributeProps } = attribute;

    switch (attribute.type) {
      case 'text':
        return (
          <TextAttribute
            update={updateAttribute}
            attributeKey={attribute.key}
            value={toStringOrNull(value)}
            isDisabled={isDisabled}
            {...attributeProps}
          />
        );
      case 'email':
        return (
          <EmailAttribute
            update={updateAttribute}
            attributeKey={attribute.key}
            value={toStringOrNull(value)}
            isDisabled={isDisabled}
            {...attributeProps}
          />
        );
      case 'link':
        return (
          <LinkAttribute
            update={updateAttribute}
            attributeKey={attribute.key}
            value={toStringOrNull(value)}
            isDisabled={isDisabled}
            {...attributeProps}
          />
        );
      case 'textarea':
        return (
          <TextAreaAttribute
            update={updateAttribute}
            attributeKey={attribute.key}
            value={toStringOrNull(value)}
            isDisabled={isDisabled}
            {...attributeProps}
          />
        );
      case 'select':
        return (
          <SelectAttribute
            update={updateAttribute}
            attributeKey={attribute.key}
            value={toStringOrNull(value)}
            {...(attributeProps as Omit<SchemaSelectAttribute, 'key'>)}
            isDisabled={isDisabled}
          />
        );
      case 'reference':
        return (
          <ReferenceAttribute
            update={updateAttribute}
            attributeKey={attribute.key}
            value={toStringOrNull(value)}
            {...attributeProps}
            isDisabled={isDisabled}
          />
        );
      case 'boolean':
        return (
          <BooleanAttribute
            update={updateAttribute}
            attributeKey={attribute.key}
            value={toBooleanOrNull(value)}
            {...attributeProps}
            isDisabled={isDisabled}
          />
        );
    }
  };

  return (
    <>
      {schema?.attributes?.map((attribute) => {
        return (
          <Fragment key={attribute.key}>
            {getAttribute(attribute!, values?.[attribute.key] ?? null)}
          </Fragment>
        );
      })}
    </>
  );
};
