import noPhoto from "@client/assets/no-photo.jpg";
import { removeArtist, saveArtist } from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import type { Artist } from "@model/spotify/search";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Anchor } from "../Anchor";
import { Button } from "../Button";
import { Group } from "../Group";
import { CardWrapper, Content, Fact, Genres } from "./Card.styled";

interface CardI {
	image: string;
	artist: Artist;
	isSaved: boolean;
}

export const ArtistCard = ({ image, artist, isSaved }: CardI) => {
	const {
		id,
		name,
		genres,
		followers = null,
		external_urls: { spotify: link },
	} = artist;

	const { userId, refetchArtists } = useAppStore();

	const handleRefetch = () => {
		if (refetchArtists) refetchArtists();
		else {
			console.error("Refetch function is not set in the store");
		}
	};

	const { isPending: loadingSave, mutate: mutateSave } = useMutation({
		mutationFn: saveArtist,
		onSuccess: () => {
			toast.success("Artist saved!");
			handleRefetch();
		},
	});

	const { isPending: loadingRemove, mutate: mutateRemove } = useMutation({
		mutationFn: removeArtist,
		onSuccess: () => {
			toast.success("Artist removed!");
			handleRefetch();
		},
	});

	const handleAction = () => {
		if (isSaved) mutateRemove({ userId, name, id });
		else mutateSave({ userId, data: artist });
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
						variant={isSaved ? "remove" : undefined}
						text={`${isSaved ? "Remove" : "Save"} Artist`}
						loading={loadingSave || loadingRemove}
					/>
					{link && <Anchor link={link} text="Open Artist" isExternal />}
				</Group>
			</Content>
		</CardWrapper>
	);
};
