import type { SerializedStyles } from "@emotion/react";
import styled from "@emotion/styled";
import { Group } from "../Group";

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  options: ReadonlyArray<Option>;
  selected: ReadonlyArray<string>;
  onToggle: (value: string) => void;
  styles?: SerializedStyles;
}

const Label = styled.span`
  font-size: 1.2rem;
`;

const Pill = styled.button`
  min-height: 32px;
  padding: 0.25rem 1rem;
  border: 1px solid #4e6db0;
  border-radius: 999px;
  color: #1e1e1e;
  background-color: #ffffff;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: #ebedf5;
  }

  &[aria-pressed="true"] {
    color: #eff3f2;
    background-color: #4e6db0;
  }

  &:focus-visible {
    outline: 1px solid #1e1e1e;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.75);
  }
`;

export const PillToggleGroup = ({
  label,
  options,
  selected,
  onToggle,
  styles,
}: Props) => (
  <Group direction="column" gap="0.2rem" align="flex-start" styling={styles}>
    <Label>{label}</Label>
    <Group role="group" aria-label={label} justify="flex-start" gap="0.5rem">
      {options.map(({ value, label: optionLabel }) => (
        <Pill
          key={value}
          type="button"
          aria-pressed={selected.includes(value)}
          onClick={() => onToggle(value)}
        >
          {optionLabel}
        </Pill>
      ))}
    </Group>
  </Group>
);
