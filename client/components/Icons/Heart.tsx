import styled from "@emotion/styled";
interface Props {
  onClick?: () => void;
  size?: string;
  fill?: boolean;
  fillColor?: string;
}

const HeartStyled = styled.svg`
  cursor: pointer;
`;

export const HeartIcon = ({
  onClick,
  size = "24",
  fill = false,
  fillColor = "red",
}: Props) => {
  return (
    <HeartStyled
      role="img"
      aria-label="heart icon"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? fillColor : "none"}
      stroke={fill ? fillColor : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      onClick={onClick}
      onKeyUp={onClick}
      onKeyDown={onClick}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
    </HeartStyled>
  );
};
