import React, { ReactElement, ReactNode } from 'react';
import {
  ComboBox as SpectrumComboBox,
  DatePicker as SpectrumDatePicker,
  DateRangePicker as SpectrumDateRangePicker,
  Picker as SpectrumPicker,
} from '@adobe/react-spectrum';
import type { DateValue, SpectrumDatePickerProps, SpectrumDateRangePickerProps } from '@react-types/datepicker';
import type { SpectrumComboBoxProps } from '@react-types/combobox';
import type { SpectrumPickerProps } from '@react-types/select';

type SafeOverlayKind = 'list' | 'calendar';
type SafeWrapperProps = {
  children: ReactNode;
  kind: SafeOverlayKind;
};

const SafeSpectrumField = ({ children, kind }: SafeWrapperProps) => {
  return (
    <span className="safe-spectrum-field" data-overlay-kind={kind}>
      {children}
    </span>
  );
};

export const SafePicker = <T extends object>(props: SpectrumPickerProps<T>): ReactElement => {
  return (
    <SafeSpectrumField kind="list">
      <SpectrumPicker {...props} shouldFlip={props.shouldFlip ?? true} />
    </SafeSpectrumField>
  );
};

export const SafeComboBox = <T extends object>(props: SpectrumComboBoxProps<T>): ReactElement => {
  return (
    <SafeSpectrumField kind="list">
      <SpectrumComboBox {...props} shouldFlip={props.shouldFlip ?? true} />
    </SafeSpectrumField>
  );
};

export const SafeDatePicker = <T extends DateValue>(props: SpectrumDatePickerProps<T>): ReactElement => {
  return (
    <SafeSpectrumField kind="calendar">
      <SpectrumDatePicker {...props} shouldFlip={props.shouldFlip ?? true} />
    </SafeSpectrumField>
  );
};

export const SafeDateRangePicker = <T extends DateValue>(props: SpectrumDateRangePickerProps<T>): ReactElement => {
  return (
    <SafeSpectrumField kind="calendar">
      <SpectrumDateRangePicker {...props} shouldFlip={props.shouldFlip ?? true} />
    </SafeSpectrumField>
  );
};
