import { removeArtist, saveArtist } from "@client/lib/Spotify/artist.ts";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import type { Artist } from "src/types/spotify/search.ts";
import noPhoto from "../../assets/no-photo.jpg";
import { Anchor } from "../Anchor.tsx";
import { Button } from "../Button.tsx";
import { Group } from "../Group.tsx";
import { CardWrapper, Content, Fact, Genres } from "./Card.styled.ts";

interface CardI {
	image: string;
	artist: Artist;
	isSaved: boolean;
	refetchArtists: () => void;
}

export const ArtistCard = ({
	image,
	artist,
	isSaved,
	refetchArtists,
}: CardI) => {
	const {
		id,
		name,
		uri,
		genres,
		followers = null,
		external_urls: { spotify: link },
	} = artist;

	const { isPending: loadingSave, mutate: mutateSave } = useMutation({
		mutationFn: saveArtist,
		onSuccess: () => {
			toast.success("Artist saved!");
			refetchArtists();
		},
	});

	const { isPending: loadingRemove, mutate: mutateRemove } = useMutation({
		mutationFn: removeArtist,
		onSuccess: () => {
			toast.success("Artist removed!");
			refetchArtists();
		},
	});

	const handleAction = () => {
		if (isSaved) mutateRemove({ id, name });
		else mutateSave({ id, name, uri });
	};

	return (
		<CardWrapper>
			<img src={image ? image : noPhoto} alt={name} />

			<h2>{name}</h2>

			<Content>
				{followers && (
					<Fact>{`${followers.total.toLocaleString()} Followers`}</Fact>
				)}
				{genres?.length ? <Genres>Genres: {genres.join(", ")}</Genres> : null}
				<Group>
					<Button
						onClick={handleAction}
						variant={isSaved ? "remove" : ""}
						text={`${isSaved ? "Remove" : "Save"} Artist`}
						loading={loadingSave || loadingRemove}
					/>
					{link && <Anchor link={link} text="Open Artist" isExternal />}
				</Group>
			</Content>
		</CardWrapper>
	);
};
