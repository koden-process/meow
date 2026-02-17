import { Button, TextField } from '@adobe/react-spectrum';
import { useEffect, useState } from 'react';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';

export interface LinkAttributeProps {
  attributeKey: string;
  name: string;
  value: string | null;
  isDisabled: boolean;
  update: (index: string, value: string) => void;
}

export const LinkAttribute = ({
  attributeKey,
  name,
  value: valueDefault,
  update,
  isDisabled,
}: LinkAttributeProps) => {
  const [value, setValue] = useState(valueDefault);

  useEffect(() => {
    setValue(valueDefault);
  }, [valueDefault]);

  const updateValue = (value: string) => {
    setValue(value);
    update(attributeKey, value);
  };

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!value) {
      setIsValid(false);
      return;
    }

    // Validation simple d'URL - accepte les URLs complètes et relatives
    const urlPattern = /^(https?:\/\/[^\s]+)|(\/[^\s]*)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)$/;
    setIsValid(urlPattern.test(value.trim()));
  }, [value]);

  const handleLinkClick = (url: string | null) => {
    if (!url) return;

    let finalUrl = url.trim();

    // Si l'URL ne commence pas par http:// ou https://, on ajoute https://
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('/')) {
      finalUrl = `https://${finalUrl}`;
    }

    window.open(finalUrl, '_blank');
  };

  return (
    <div className="attribute email-attribute">
      <TextField
        width="100%"
        aria-label={name}
        label={`${name} ${Translations.LinkLabelSuffix[DEFAULT_LANGUAGE]}`}
        value={value?.toString()}
        isDisabled={isDisabled}
        onChange={(value) => updateValue(value)}
      />
      <div className="send">
        <Button isDisabled={!isValid} onPress={() => handleLinkClick(value)} variant="secondary">
          {Translations.OpenButton[DEFAULT_LANGUAGE]}
        </Button>
      </div>
    </div>
  );
};

