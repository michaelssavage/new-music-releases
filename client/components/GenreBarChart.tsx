import { PHONE_QUERY } from "@client/styles/abstracts/mixins.styled";
import { useMediaQuery } from "@client/hooks/use-media-query.hook";
import styled from "@emotion/styled";
import type { GenreCountI } from "@model/seen-artists";
import { barX, defineChart } from "@tanstack/charts";
import { motion } from "@tanstack/charts/motion";
import { tooltip } from "@tanstack/charts/tooltip";
import { RendererChart } from "@tanstack/charts/react/tooltip";
import { scaleBand, scaleLinear } from "d3-scale";
import { useMemo } from "react";

interface Props {
  genres: Array<GenreCountI>;
  totalArtists: number;
  onSelectGenre: (genre?: string) => void;
}

const BAR_COLORS = [
  "#2f4a8a",
  "#3c5a9e",
  "#4e6db0",
  "#6783bf",
  "#8099cc",
  "#9bb0d8",
  "#b6c6e4",
];
const ROW_HEIGHT = 44;
const CHART_PADDING = 10;
const INITIAL_WIDTH = 600;
const LABEL_MARGIN = 190;
const PHONE_LABEL_MARGIN = 110;

const renderer = motion({
  initial: "always",
  transition: { type: "spring", stiffness: 170, damping: 18, mass: 1 },
});

const ChartContainer = styled.div`
  width: 100%;

  .ts-chart {
    color: #6b7280;
  }

  .ts-chart__axes text {
    fill: #374151;
    font-size: 0.875rem;
  }

  .ts-chart-tooltip {
    min-width: 128px;
    padding: 7px 10px !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 8px !important;
    background: white !important;
    color: #1e1e1e !important;
    box-shadow: 0 2px 6px rgb(0 0 0 / 8%);
    font-size: 0.75rem;
  }
`;

function percentOf(artists: number, total: number) {
  return Math.round((artists / total) * 100);
}

function createGenreChart(
  genres: Array<GenreCountI>,
  totalArtists: number,
  labelMargin: number,
) {
  const genreNames = genres.map(({ genre }) => genre);

  return defineChart(
    {
      marks: [
        barX(genres, {
          id: "genre-bars",
          x: "artists",
          y: "genre",
          color: "genre",
          radius: 5,
        }),
      ],
      scales: {
        x: { scale: scaleLinear, axis: false },
        y: {
          scale: () =>
            scaleBand<string>().paddingInner(0.18).paddingOuter(0.08),
          axis: {
            line: false,
            ticks: {
              size: 0,
              padding: 10,
              format: (genre: string) => {
                const artists =
                  genres.find((count) => count.genre === genre)?.artists ?? 0;
                return `${genre} · ${percentOf(artists, totalArtists)}%`;
              },
            },
          },
        },
      },
      color: { domain: genreNames, range: BAR_COLORS },
      margin: {
        top: CHART_PADDING,
        right: CHART_PADDING,
        bottom: 5,
        left: labelMargin,
      },
      theme: {
        foreground: "#6b7280",
        grid: "#e5e7eb",
        background: "transparent",
      },
    },
    {
      svgAnimation: false,
      focus: "group-x",
      tooltip: {
        use: tooltip,
        className: "ts-chart-tooltip",
        anchor: "group-center",
        placement: "auto",
        content: (points) => {
          const [point] = points;
          return {
            title: point.datum.genre,
            rows: [
              {
                label: "Artists",
                value: `${point.datum.artists} (${percentOf(point.datum.artists, totalArtists)}%)`,
                color: point.color,
              },
            ],
          };
        },
      },
    },
  );
}

export const GenreBarChart = ({
  genres,
  totalArtists,
  onSelectGenre,
}: Props) => {
  const isPhone = useMediaQuery(PHONE_QUERY);
  const labelMargin = isPhone ? PHONE_LABEL_MARGIN : LABEL_MARGIN;
  const definition = useMemo(
    () => createGenreChart(genres, totalArtists, labelMargin),
    [genres, totalArtists, labelMargin],
  );

  return (
    <ChartContainer>
      <RendererChart
        definition={definition}
        renderer={renderer}
        initialWidth={INITIAL_WIDTH}
        height={genres.length * ROW_HEIGHT + CHART_PADDING}
        ariaLabel="Artists seen live by genre"
        onSelect={(point) => onSelectGenre(point?.datum.genre)}
      />
    </ChartContainer>
  );
};
