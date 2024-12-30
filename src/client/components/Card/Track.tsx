import { getArtist } from "@client/lib/Spotify/artist.ts";
import { getSavedArtists } from "@client/lib/Spotify/artist.ts";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Artist, Track } from "src/types/spotify/search.ts";
import noPhoto from "../../assets/no-photo.jpg";
import { Button } from "../Button.tsx";
import { Loader } from "../Loader.tsx";
import { Modal } from "../Modal.tsx";
import { ArtistCard } from "./Artist.tsx";
import { CardWrapper } from "./Card.styled.ts";

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

	const { data: artistIds = [], refetch: refetchArtists } = useQuery<
		Array<Artist>
	>({
		queryKey: ["data"],
		queryFn: getSavedArtists,
		enabled: artistId !== undefined,
		refetchOnWindowFocus: false,
	});

	const renderArtist = () => {
		if (!artistData) return null;
		if (isLoading) return <Loader />;
		if (isError) return <p>Error fetching Artist, please try again</p>;

		return (
			<ArtistCard
				image={artistData.images?.[0].url}
				artist={artistData}
				refetchArtists={refetchArtists}
				isSaved={artistIds.some(({ id }) => id === artistData.id)}
			/>
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
									key={artist.id}
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
