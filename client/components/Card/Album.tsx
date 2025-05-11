import noPhoto from "@client/assets/no-photo.jpg";
import { getArtist } from "@client/lib/spotify";
import styled from "@emotion/styled";
import type { Artist } from "@model/spotify/liked-tracks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader } from "../Loader";
import { Modal } from "../Modal";
import { ArtistCard } from "./Artist";
import { CardWrapper } from "./Card.styled";

interface CardI {
	image: string;
	name: string;
	type: string;
	genres?: Array<string>;
	artists?: Array<Artist>;
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
	align-items: center;
	> p {
		padding: 0;
	}
	> button {
		color: #1ed4b6;
		text-decoration: underline #1ed4b6 2px;
		border: none;
		background-color: transparent;

		&:hover {
			color: #0d6153;
			text-decoration: underline #0d6153 2px;
		}
	}
`;

export const AlbumCard = ({ image, name, type, artists }: CardI) => {
	const [isOpen, setIsOpen] = useState(false);
	const [artistId, setArtistId] = useState<string>();

	const handleArtistClick = (id: string) => {
		setIsOpen(true);
		setArtistId(id);
	};

	const {
		data: artistData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["artist", artistId],
		queryFn: () => getArtist(artistId),
		enabled: artistId !== undefined,
		refetchOnWindowFocus: false,
	});

	const renderArtist = () => {
		if (!artistData) return null;
		if (isLoading) return <Loader />;
		if (isError) return <p>Error fetching Artist, please try again</p>;

		return (
			<ArtistCard image={artistData.images?.[0].url} artist={artistData} />
		);
	};

	return (
		<CardWrapper>
			<img src={image ? image : noPhoto} alt={name} />

			<h2>{name}</h2>

			<Content>
				{artists?.length ? (
					<Artists>
						<p>Artists:</p>
						{artists.map((artist, index) => (
							<>
								<button
									key={`${artist.id}-${index}`}
									type="button"
									onClick={() => handleArtistClick(artist.id)}
								>
									{artist.name}
								</button>
								{index < artists.length - 1 && ", "}
							</>
						))}
					</Artists>
				) : null}
				<Fact>{`Album Type: ${type}`}</Fact>
			</Content>

			<Modal isOpen={isOpen} setIsOpen={setIsOpen}>
				{renderArtist()}
			</Modal>
		</CardWrapper>
	);
};
