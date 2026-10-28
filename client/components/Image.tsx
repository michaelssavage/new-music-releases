import styled from "@emotion/styled";

interface ImageI {
  src: string;
  alt: string;
  maxWidth?: string;
}

const Frame = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const Picture = styled.img<{ $maxWidth?: string }>`
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth || "100%"};
  height: auto;
`;

export const Image = ({ src, alt, maxWidth }: ImageI) => {
  return (
    <Frame>
      <Picture src={src} alt={alt} $maxWidth={maxWidth} />
    </Frame>
  );
};
