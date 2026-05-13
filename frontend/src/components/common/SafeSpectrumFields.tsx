import React, {
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
  ReactNode,
  useCallback,
} from 'react';
import {
  ComboBox as SpectrumComboBox,
  DatePicker as SpectrumDatePicker,
  DateRangePicker as SpectrumDateRangePicker,
  Picker as SpectrumPicker,
} from '@adobe/react-spectrum';
import type { DateValue, SpectrumDatePickerProps, SpectrumDateRangePickerProps } from '@react-types/datepicker';
import type { SpectrumComboBoxProps } from '@react-types/combobox';
import type { SpectrumPickerProps } from '@react-types/select';

const SAFE_PADDING = 24;
const LIST_MIN_HEIGHT = 280;
const CALENDAR_MIN_HEIGHT = 360;
const OPEN_KEYS = new Set(['Enter', ' ', 'ArrowDown']);
const FIELD_SELECTOR = '.spectrum-Field, .spectrum-Dropdown, .spectrum-InputGroup';

type SafeOverlayKind = 'list' | 'calendar';
type SafeWrapperProps = {
  children: ReactNode;
  kind: SafeOverlayKind;
};

const getMinimumOverlayHeight = (kind: SafeOverlayKind) => (
  kind === 'calendar' ? CALENDAR_MIN_HEIGHT : LIST_MIN_HEIGHT
);

const getScrollableParent = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement;

  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent);
    const canScroll = /(auto|scroll|overlay)/.test(style.overflowY);

    if (canScroll && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
};

const getFieldElement = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  return target.closest(FIELD_SELECTOR) ?? target;
};

const getViewportBounds = (container: HTMLElement | null) => {
  if (container) {
    return container.getBoundingClientRect();
  }

  return {
    top: 0,
    bottom: window.innerHeight,
    height: window.innerHeight,
  };
};

const scrollBy = (container: HTMLElement | null, top: number) => {
  if (Math.abs(top) < 1) {
    return;
  }

  if (container) {
    container.scrollBy({ top, behavior: 'auto' });
    return;
  }

  window.scrollBy({ top, behavior: 'auto' });
};

const ensureOverlaySpace = (target: EventTarget | null, kind: SafeOverlayKind) => {
  const field = getFieldElement(target);

  if (!field) {
    return;
  }

  const container = getScrollableParent(field);
  const bounds = getViewportBounds(container);
  const rect = field.getBoundingClientRect();
  const minimumHeight = getMinimumOverlayHeight(kind);
  const availableAbove = rect.top - bounds.top - SAFE_PADDING;
  const availableBelow = bounds.bottom - rect.bottom - SAFE_PADDING;

  if (availableAbove >= minimumHeight || availableBelow >= minimumHeight) {
    return;
  }

  const fieldCenter = rect.top + rect.height / 2;
  const boundsCenter = bounds.top + bounds.height / 2;
  scrollBy(container, fieldCenter - boundsCenter);
};

const SafeSpectrumField = ({ children, kind }: SafeWrapperProps) => {
  const ensureFromEvent = useCallback(
    (target: EventTarget | null) => ensureOverlaySpace(target, kind),
    [kind]
  );

  const handlePointerDownCapture = (event: PointerEvent<HTMLSpanElement>) => {
    ensureFromEvent(event.target);
  };

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (OPEN_KEYS.has(event.key)) {
      ensureFromEvent(event.target);
    }
  };

  const handleFocusCapture = (event: FocusEvent<HTMLSpanElement>) => {
    ensureFromEvent(event.target);
  };

  return (
    <span
      className="safe-spectrum-field"
      onPointerDownCapture={handlePointerDownCapture}
      onKeyDownCapture={handleKeyDownCapture}
      onFocusCapture={handleFocusCapture}
    >
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
