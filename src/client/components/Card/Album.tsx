import styled from "@emotion/styled";
import type { MouseEventHandler } from "react";
import noPhoto from "../../assets/no-photo.jpg";
import { CardWrapper } from "./Card.styled.ts";

interface CardI {
	image: string;
	name: string;
	type: string;
	genres?: Array<string>;
	artists?: Array<{ name: string }>;
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

const Content = styled.div`
	padding: 0.5rem;
  font-size: 1rem;
`;

const Fact = styled.p`
  margin: 0.25rem 0;
`;

const Artists = styled.p`
  margin: 0.25rem 0;
  display: flex;
  flex-wrap: wrap;
`;

export const AlbumCard = ({ image, name, type, artists }: CardI) => {
	return (
		<CardWrapper>
			<img src={image ? image : noPhoto} alt={name} />

			<h2>Album: {name}</h2>

			<Content>
				{artists?.length ? (
					<Artists>
						Artists: {artists.map((artist) => artist.name).join(", ")}
					</Artists>
				) : null}
				<Fact>{`Album Type: ${type}`}</Fact>
			</Content>
		</CardWrapper>
	);
};
