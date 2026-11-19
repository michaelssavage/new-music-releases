import type { SerializedStyles } from "@emotion/react";
import styled from "@emotion/styled";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Group } from "../Group";

interface Props {
  id: string;
  label?: string;
  ariaLabel?: string;
  type?: "text" | "number";
  value?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  styles?: SerializedStyles;
}

const Label = styled.label`
  font-size: 1.2rem;
`;

const TextInputStyled = styled.input`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  height: 32px;
  outline: 0;
  background-color: #ffffff;
  padding: 0.25rem;
  border-radius: 4px;
  border: 1px solid #cccccc;

  &:focus {
    border: 1px solid #0cb57c;
  }
`;

export const TextInput = ({
  id,
  label,
  ariaLabel,
  type = "text",
  value,
  placeholder,
  onChange,
  onKeyDown,
  styles,
}: Props) => {
  return (
    <Group direction="column" gap="0.2rem" align="flex-start" styling={styles}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <TextInputStyled
        id={id}
        type={type}
        aria-label={ariaLabel}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </Group>
  );
};
