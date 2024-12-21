import { removeArtist, saveArtist } from "@client/lib/artist.ts";
import { toast } from "react-hot-toast";
import { useMutation } from "react-query";
import type { Artist } from "src/types/spotify/search.ts";
import noPhoto from "../../assets/no-photo.jpg";
import { Button } from "../Button.tsx";
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
	const { id, name, uri, genres, followers } = artist;

	const { isLoading: loadingSave, mutate: mutateSave } = useMutation({
		mutationFn: saveArtist,
		onSuccess: () => {
			toast.success("Artist saved!");
			refetchArtists();
		},
	});

	const { isLoading: loadingRemove, mutate: mutateRemove } = useMutation({
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
				<Fact>{`${followers.total.toLocaleString()} Followers`}</Fact>
				{genres?.length ? <Genres>Genres: {genres.join(", ")}</Genres> : null}
				<Button
					onClick={handleAction}
					variant={isSaved ? "remove" : ""}
					text={`${isSaved ? "Remove" : "Save"} Artist`}
					loading={loadingSave || loadingRemove}
				/>
			</Content>
		</CardWrapper>
	);
};
