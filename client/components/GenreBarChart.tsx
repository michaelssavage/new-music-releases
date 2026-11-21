import { PHONE_QUERY } from "@client/styles/abstracts/mixins.styled";
import { useMediaQuery } from "@client/hooks/use-media-query.hook";
import styled from "@emotion/styled";
import type { GenreCountI } from "@model/seen-artists";
import {
  barX,
  defineChart,
  type ChartRendererRenderContext,
} from "@tanstack/charts";
import { motion } from "@tanstack/charts/motion";
import { tooltip } from "@tanstack/charts/tooltip";
import { RendererChart } from "@tanstack/charts/react/tooltip";
import { scaleBand, scaleLinear } from "d3-scale";
import { useCallback, useMemo, useRef } from "react";

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
const LABEL_GAP = 10;
const BAR_VALUE_PADDING = 8;

const renderer = motion({
  initial: "always",
  transition: { type: "spring", stiffness: 170, damping: 18, mass: 1 },
});

const ChartContainer = styled.div`
  position: relative;
  width: 100%;

  .ts-chart {
    color: #6b7280;
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

const GenreLabels = styled.ol`
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
  visibility: hidden;

  li {
    position: absolute;
    left: 0;
    transform: translateY(-50%);
    color: #374151;
    font-size: 0.875rem;
    line-height: 1.2;
    text-align: right;
    overflow-wrap: anywhere;
  }
`;

const BarValues = styled.ol`
  position: absolute;
  inset: 0;
  z-index: 1;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
  visibility: hidden;

  li {
    position: absolute;
    transform: translateY(-50%);
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    color: #040c2f;
    animation: fade-in 0.3s ease-out 0.5s both;

    &[data-fits="true"] {
      color: #ffffff;
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
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
          axis: { line: false, ticks: { size: 0 }, tickLabels: false },
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
  const labelsRef = useRef<HTMLOListElement>(null);
  const valuesRef = useRef<HTMLOListElement>(null);

  const positionLabels = useCallback(
    ({ scene }: ChartRendererRenderContext<GenreCountI, number, string>) => {
      const labels = labelsRef.current;
      const values = valuesRef.current;
      if (!labels || !values) return;

      const labelWidth = scene.chart.x - LABEL_GAP;
      const barStart = scene.scales.x.map(0);
      genres.forEach(({ genre, artists }, index) => {
        const top = `${scene.scales.y.map(genre)}px`;

        const label = labels.children[index] as HTMLElement;
        label.style.top = top;
        label.style.width = `${labelWidth}px`;

        const value = values.children[index] as HTMLElement;
        const barEnd = scene.scales.x.map(artists);
        const fits =
          barEnd - barStart >= value.offsetWidth + BAR_VALUE_PADDING * 2;
        value.dataset.fits = String(fits);
        value.style.top = top;
        value.style.left = fits
          ? `${barEnd - BAR_VALUE_PADDING - value.offsetWidth}px`
          : `${barEnd + BAR_VALUE_PADDING}px`;
      });
      labels.style.visibility = "visible";
      values.style.visibility = "visible";
    },
    [genres],
  );

  return (
    <ChartContainer>
      <GenreLabels ref={labelsRef} aria-label="Genres">
        {genres.map(({ genre }) => (
          <li key={genre}>{genre}</li>
        ))}
      </GenreLabels>
      <BarValues aria-hidden="true" ref={valuesRef}>
        {genres.map(({ genre, artists }) => (
          <li key={genre}>{percentOf(artists, totalArtists)}%</li>
        ))}
      </BarValues>
      <RendererChart
        definition={definition}
        renderer={renderer}
        initialWidth={INITIAL_WIDTH}
        height={genres.length * ROW_HEIGHT + CHART_PADDING}
        ariaLabel="Artists seen live by genre"
        onRender={positionLabels}
        onSelect={(point) => onSelectGenre(point?.datum.genre)}
      />
    </ChartContainer>
  );
};
