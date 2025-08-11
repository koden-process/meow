import {Item, Picker} from '@adobe/react-spectrum';
import {useEffect, useState} from 'react';

export interface SelectAttributeProps {
    attributeKey: string;
    name: string;
    value: string | null;
    options?: string[] | undefined;
    isDisabled: boolean;
    update: (index: string, value: string) => void;
}

export const SelectAttribute = ({
                                    attributeKey,
                                    name,
                                    update,
                                    options,
                                    value: valueDefault,
                                    isDisabled,
                                }: SelectAttributeProps) => {
    const [value, setValue] = useState(valueDefault);

    useEffect(() => {
        setValue(valueDefault);
    }, [valueDefault]);

    const updateValue = (value: string) => {
        setValue(value);
        update(attributeKey, value);
    };

    return (
        <div className="attribute">
            {Array.isArray(options) && (
                <Picker
                    width="100%"
                    aria-label={name}
                    label={name}
                    selectedKey={value}
                    isDisabled={isDisabled}
                    onSelectionChange={(key) => updateValue(key ? key.toString() : '')}
                >
                    {options?.sort((a, b) => a.localeCompare(b)).map((option) => {
                        return <Item key={option}>{option}</Item>;
                    })}
                </Picker>
            )}
        </div>
    );
};
