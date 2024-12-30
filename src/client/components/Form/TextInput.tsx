import styled from "@emotion/styled";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Group } from "../Group.tsx";

interface Props {
	id: string;
	label: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	placeholder: string;
	onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const Label = styled.label`
  font-size: 1.2rem;
`;

const TextInputStyled = styled.input`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-height: 38px;
  outline: 0;
  background-color: hsl(0, 0%, 100%);
  border-color: hsl(0, 0%, 80%);
  padding: 0.5rem;
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  box-sizing: border-box;
`;

export const TextInput = ({
	id,
	label,
	placeholder,
	onChange,
	onKeyDown,
}: Props) => {
	return (
		<Group direction="column" gap="0.2rem" align="flex-start">
			<Label htmlFor={id}>{label}</Label>
			<TextInputStyled
				id={id}
				type="text"
				placeholder={placeholder}
				onChange={onChange}
				onKeyDown={onKeyDown}
			/>
		</Group>
	);
};
