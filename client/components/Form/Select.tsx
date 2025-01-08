import styled from "@emotion/styled";
import type { TypeI } from "client/utils/defaults";
import ReactSelect, { type MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import { Group } from "../Group";

interface Props {
	id: string;
	label: string;
	options: Array<{ value: string; label: string }>;
	value: Array<{ value: string; label: string }>;
	onChange: (e: MultiValue<TypeI>) => void;
	isMulti?: boolean;
	closeMenuOnSelect?: boolean;
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
}: Props) => {
	const animatedComponents = makeAnimated();

	return (
		<Group direction="column" gap="0.2rem" align="flex-start">
			<Label htmlFor={id}>{label}</Label>
			<ReactSelect
				id={id}
				components={animatedComponents}
				options={options}
				value={value}
				onChange={onChange}
				closeMenuOnSelect={closeMenuOnSelect}
				isMulti={true}
			/>
		</Group>
	);
};
