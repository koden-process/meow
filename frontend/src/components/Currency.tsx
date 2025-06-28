import { useSelector } from 'react-redux';
import { selectCurrency } from '../store/Store';
import { DEFAULT_CURRENCY } from '../Constants';
import { getBrowserLocale } from '../helpers/Helper';
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

export interface CurrencyProps {
    value: number;
}

function formatValue(value: number, currency: string) {
  if (currency === 'MT2') {
    return value.toLocaleString(getBrowserLocale(), {
      style: 'unit',
      unit: 'meter',
      unitDisplay: 'narrow',
    });
  }

  return value.toLocaleString(getBrowserLocale(), {
    style: 'currency',
    currency: currency ?? DEFAULT_CURRENCY,
  });
}

export const Currency = ({ value }: CurrencyProps) => {
    const currency = useSelector(selectCurrency);

    return (
        <>{currency ? currency === "MT2" ? formatValue(value, currency) + "²" : formatValue(value, currency) : "undefine"}</>
    );
};
