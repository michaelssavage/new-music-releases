import styled from "@emotion/styled";
import noPhoto from "../assets/no-photo.jpg";

interface CardI {
	image: string;
	name: string;
	fact: string;
	genres?: Array<string>;
	artists?: Array<{ name: string }>;
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
    padding: 0 0.25rem;
		text-align: center;
    margin: 0;
  }
`;

const Fact = styled.p`
  font-size: 1rem;
  padding: 0 0.25rem;
  margin: 0.25rem 0;
`;

const Genres = styled.p`
  font-size: 0.8rem;
  padding: 0 0.25rem;
  display: flex;
  flex-wrap: wrap;
`;

const Artists = styled.p`
  font-size: 0.8rem;
  padding: 0 0.25rem;
  display: flex;
  flex-wrap: wrap;
`;

export const Card = ({ image, name, fact, genres, artists }: CardI) => {
	return (
		<CardWrapper>
			<img src={image ? image : noPhoto} alt={name} />

			<h2>{name}</h2>
			<Fact>{fact}</Fact>
			{genres?.length ? <Genres>Genres: {genres.join(", ")}</Genres> : null}
			{artists?.length ? (
				<Artists>
					Artists: {artists.map((artist) => artist.name).join(", ")}
				</Artists>
			) : null}
		</CardWrapper>
	);
};
