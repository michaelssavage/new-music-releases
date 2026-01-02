interface YouTubeI {
  videoId: string;
  width?: number;
  height?: number;
}

export const YouTube = ({ videoId, width = 560, height = 315 }: YouTubeI) => {
  return (
    <iframe
      width={width}
      height={height}
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
      title="YouTube video player"
      allow="autoplay; encrypted-media"
      allowFullScreen
    />
  );
};
