import noPhoto from "@client/assets/no-photo.jpg";
import { getArtist } from "@client/lib/spotify";
import styled from "@emotion/styled";
import type { Artist, Track } from "@model/spotify/liked-tracks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "../Button";
import { Loader } from "../Loader";
import { Modal } from "../Modal";
import { ArtistCard } from "./Artist";
import { CardWrapper } from "./Card.styled";

interface CardI {
	image: string;
	name: string;
	artists?: Array<Artist>;
	track: Track;
}

const Content = styled.div`
	padding: 0.5rem;
  font-size: 1rem;
`;

const Artists = styled.p`
  margin: 0.25rem 0;
  display: flex;
  flex-wrap: wrap;
	align-items: center;
	> p {
		padding: 0;
		margin-right: 0.25rem;
	}
`;

export const TrackCard = ({ image, name, artists }: CardI) => {
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
						<p>Artists: </p>
						{artists.map((artist, index) => (
							<>
								<Button
									key={`${artist.id}-${index}`}
									variant="link"
									onClick={() => handleArtistClick(artist.id)}
									text={artist.name}
								/>
								{index < artists.length - 1 && ", "}
							</>
						))}
					</Artists>
				) : null}
			</Content>

			<Modal isOpen={isOpen} setIsOpen={setIsOpen}>
				{renderArtist()}
			</Modal>
		</CardWrapper>
	);
};
