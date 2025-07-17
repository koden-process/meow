import React from 'react';

export type SelectMappings = {
  [key: string]: { [id: string]: string }
};

export const SelectMappingContext = React.createContext<SelectMappings>({}); 