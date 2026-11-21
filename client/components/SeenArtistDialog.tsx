import {
  addSeenArtist,
  deleteSeenArtist,
  getSeenArtists,
  updateSeenArtist,
} from "@client/lib/spotify";
import styled from "@emotion/styled";
import {
  GENRES,
  type SeenArtistInputI,
  type SeenArtistWithGenreI,
} from "@model/seen-artists";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useId, useState } from "react";
import { toast } from "react-hot-toast";
import type { StylesConfig } from "react-select";
import CreatableSelect from "react-select/creatable";
import { Button } from "./Button";
import { TextInput } from "./Form/TextInput";
import { Group } from "./Group";
import { CloseIcon } from "./Icons/Close";
import { Modal } from "./Modal";

const MIN_YEAR = 1950;

interface FormSighting {
  event: string;
  year: string;
}

interface DialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  /** The artist being edited. Omit to add a new one. */
  artist?: SeenArtistWithGenreI;
  /** Pre-fills the name when adding. */
  initialName?: string;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h2 {
    margin: 0;
  }
`;

const SectionTitle = styled.span`
  font-size: 1.2rem;
`;

const Sightings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SightingRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;

  > div:first-of-type {
    flex: 1;
    min-width: 0;
  }

  input {
    width: 100%;
  }

  > div:nth-of-type(2) {
    width: 110px;
    flex-shrink: 0;
  }
`;

const RemoveSighting = styled.button`
  flex: none;
  width: fit-content;
  height: 32px;
  padding: 0 0.5rem;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;

  &:hover {
    border-color: #e63946;
  }
`;

const FieldLabel = styled.label`
  font-size: 1.2rem;
`;

const genreSelectStyles: StylesConfig<GenreOption, true> = {
  container: (base) => ({ ...base, width: "100%" }),
  control: (base) => ({ ...base, minHeight: 32, height: 32 }),
  valueContainer: (base) => ({ ...base, padding: "1px 8px" }),
  dropdownIndicator: (base) => ({ ...base, padding: 5 }),
  clearIndicator: (base) => ({ ...base, padding: 5 }),
};

const Hint = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
`;

interface GenreOption {
  value: string;
  label: string;
}

function toOption(genre: string): GenreOption {
  return { value: genre, label: genre };
}

function saveSeenArtist({ id, ...input }: SeenArtistInputI & { id?: string }) {
  return id ? updateSeenArtist({ id, ...input }) : addSeenArtist(input);
}

function toFormSightings(artist?: SeenArtistWithGenreI): Array<FormSighting> {
  if (!artist) return [blankSighting()];
  return artist.sightings.map(({ event, year }) => ({
    event,
    year: String(year),
  }));
}

function blankSighting(): FormSighting {
  return { event: "", year: String(new Date().getFullYear()) };
}

function isValidSighting({ event, year }: FormSighting) {
  const parsedYear = Number(year);
  return (
    event.trim() !== "" &&
    Number.isInteger(parsedYear) &&
    parsedYear >= MIN_YEAR &&
    parsedYear <= new Date().getFullYear() + 1
  );
}

const SeenArtistForm = ({
  artist,
  initialName = "",
  close,
}: Omit<DialogProps, "isOpen" | "setIsOpen"> & { close: () => void }) => {
  const formId = useId();
  const queryClient = useQueryClient();

  const [name, setName] = useState(artist?.name ?? initialName);
  const [sightings, setSightings] = useState(() => toFormSightings(artist));
  const [genres, setGenres] = useState(artist?.genreOverrides ?? []);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { data } = useQuery({
    queryKey: ["seen-artists"],
    queryFn: getSeenArtists,
    refetchOnWindowFocus: false,
  });
  const genreOptions = [
    ...new Set([...GENRES, ...(data?.genres.map(({ genre }) => genre) ?? [])]),
  ].map(toOption);

  const onSuccess = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["seen-artists"] });
    close();
  };
  const onError = (error: Error) => toast.error(error.message);

  const { isPending: isSaving, mutate: save } = useMutation({
    mutationFn: saveSeenArtist,
    onSuccess: () => onSuccess(artist ? "Artist updated!" : "Artist added!"),
    onError,
  });

  const { isPending: isDeleting, mutate: remove } = useMutation({
    mutationFn: deleteSeenArtist,
    onSuccess: () => onSuccess("Artist deleted!"),
    onError,
  });

  const updateSighting = (index: number, change: Partial<FormSighting>) =>
    setSightings((current) =>
      current.map((sighting, i) =>
        i === index ? { ...sighting, ...change } : sighting,
      ),
    );

  const canSave =
    name.trim() !== "" &&
    sightings.length > 0 &&
    sightings.every(isValidSighting);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSave) return;

    save({
      id: artist?.id,
      name: name.trim(),
      sightings: sightings.map(({ event, year }) => ({
        event: event.trim(),
        year: Number(year),
      })),
      ...(genres.length > 0 && { genreOverrides: genres }),
    });
  };

  const handleDelete = () => {
    if (!artist) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    remove(artist.id);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>{artist ? "Edit seen artist" : "Add seen artist"}</h2>

      <TextInput
        id={`${formId}-name`}
        label="Artist"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Sightings>
        <SectionTitle>Seen at</SectionTitle>
        {sightings.map((sighting, index) => (
          <SightingRow key={index}>
            <TextInput
              id={`${formId}-event-${index}`}
              ariaLabel="Event"
              placeholder="Festival or venue"
              value={sighting.event}
              onChange={(e) => updateSighting(index, { event: e.target.value })}
            />
            <TextInput
              id={`${formId}-year-${index}`}
              ariaLabel="Year"
              type="number"
              value={sighting.year}
              onChange={(e) => updateSighting(index, { year: e.target.value })}
            />
            <RemoveSighting
              type="button"
              aria-label="Remove sighting"
              onClick={() =>
                setSightings((current) => current.filter((_, i) => i !== index))
              }
            >
              <CloseIcon />
            </RemoveSighting>
          </SightingRow>
        ))}
        <Group justify="flex-start">
          <Button
            variant="secondary"
            text="Add another sighting"
            onClick={() =>
              setSightings((current) => [...current, blankSighting()])
            }
          />
        </Group>
      </Sightings>

      <Group direction="column" align="flex-start" gap="0.2rem">
        <FieldLabel htmlFor={`${formId}-genre`}>Genres</FieldLabel>
        <CreatableSelect<GenreOption, true>
          inputId={`${formId}-genre`}
          options={genreOptions}
          value={genres.map(toOption)}
          onChange={(options) =>
            setGenres(options.map(({ value }) => value.trim()))
          }
          placeholder="Automatic"
          formatCreateLabel={(typed) => `Add genre "${typed}"`}
          isMulti
          isClearable
          styles={genreSelectStyles}
        />
        <Hint>
          {artist
            ? `Automatic genre: ${artist.automaticGenre}. Leave empty to use it, or pick or type genres to replace it.`
            : "Leave empty to pick the genre from Last.fm tags, or pick or type genres."}
        </Hint>
      </Group>

      <Group justify="space-between">
        {artist && (
          <Button
            variant="remove"
            text={confirmingDelete ? "Click again to delete" : "Delete"}
            onClick={handleDelete}
            loading={isDeleting}
          />
        )}

        <Button
          type="submit"
          text={artist ? "Save changes" : "Add artist"}
          onClick={() => undefined}
          disabled={!canSave}
          loading={isSaving}
        />
      </Group>
    </Form>
  );
};

export const SeenArtistDialog = ({
  isOpen,
  setIsOpen,
  artist,
  initialName,
}: DialogProps) => (
  <Modal isOpen={isOpen} setIsOpen={setIsOpen} width="600px">
    <SeenArtistForm
      artist={artist}
      initialName={initialName}
      close={() => setIsOpen(false)}
    />
  </Modal>
);
