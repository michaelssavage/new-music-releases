import type { SerializedStyles } from "@emotion/react";
import styled from "@emotion/styled";
import type { TypeI } from "client/utils/defaults";
import ReactSelect, { type MultiValue, type StylesConfig } from "react-select";
import makeAnimated from "react-select/animated";
import { Group } from "../Group";

const selectStyles: StylesConfig<TypeI, true> = {
  control: (base) => ({
    ...base,
    minHeight: 32,
    height: 32,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "1px 8px",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 5,
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 5,
  }),
};

interface Props {
  id: string;
  label?: string;
  options: Array<{ value: string; label: string }>;
  value: Array<{ value: string; label: string }>;
  onChange: (e: MultiValue<TypeI>) => void;
  isMulti?: boolean;
  closeMenuOnSelect?: boolean;
  styles?: SerializedStyles;
}

const Label = styled.label`
  font-size: 1.2rem;
`;

export const Select = ({
  id,
  label,
  options,
  value,
  onChange,
  closeMenuOnSelect = false,
  styles,
}: Props) => {
  const animatedComponents = makeAnimated();

  return (
    <Group direction="column" gap="0.1rem" align="flex-start" styling={styles}>
      <Label htmlFor={id}>{label}</Label>
      <ReactSelect
        id={id}
        components={animatedComponents}
        options={options}
        value={value}
        onChange={onChange}
        closeMenuOnSelect={closeMenuOnSelect}
        isMulti={true}
        styles={selectStyles}
      />
    </Group>
  );
};
