import { useState } from "react";
import { Button } from "./Button";
import { SeenArtistDialog } from "./SeenArtistDialog";

interface Props {
  artistName: string;
}

export const AddSeenArtistButton = ({ artistName }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        text="Seen live"
        onClick={() => setIsOpen(true)}
      />
      <SeenArtistDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        initialName={artistName}
      />
    </>
  );
};
