import styled from "@emotion/styled";
import type { MouseEventHandler } from "react";
import noPhoto from "../assets/no-photo.jpg";

interface CardI {
	image: string;
	name: string;
	fact: string;
	genres?: Array<string>;
	artists?: Array<{ name: string }>;
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
	width: 20%;
	max-width: 200px;
	flex-wrap: wrap;
	border: 1px solid #a4b4c7;
	border-radius: 4px;
	img {
		width: 100%;
		border-radius: inherit;
	}

  h2 {
		margin: 0.5rem 0 0 0;
    padding: 0 0.25rem;
		text-align: center;
  }
`;

const Content = styled.div`
	padding: 0.5rem;
`;

const Fact = styled.p`
  font-size: 1rem;
  margin: 0.25rem 0;
`;

const Genres = styled.p`
  font-size: 0.8rem;
  display: flex;
  flex-wrap: wrap;
`;

const Artists = styled.p`
  font-size: 0.8rem;
  padding: 0 0.25rem;
  display: flex;
  flex-wrap: wrap;
`;

const Button = styled.button`
	margin: 0.5rem 0;
	padding: 0.5rem 0.75rem;
	border-radius: 4px;
	background-color: #a1a2d6;
	&:hover {
		color: #f5faf7;
		background-color: #0cb57c;
	}
`;

export const Card = ({
	image,
	name,
	fact,
	genres,
	artists,
	onClick,
}: CardI) => {
	return (
		<CardWrapper>
			<img src={image ? image : noPhoto} alt={name} />

			<h2>{name}</h2>

			<Content>
				<Fact>{fact}</Fact>
				{genres?.length ? <Genres>Genres: {genres.join(", ")}</Genres> : null}
				{artists?.length ? (
					<Artists>
						Artists: {artists.map((artist) => artist.name).join(", ")}
					</Artists>
				) : null}

				<Button onClick={onClick}>Save Artist</Button>
			</Content>
		</CardWrapper>
	);
};
