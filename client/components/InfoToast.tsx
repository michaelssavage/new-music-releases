import styled from "@emotion/styled";

const ToastStyle = styled.div`
  background: #fff;
  color: #363636;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;

  > span {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 20px;
    min-height: 20px;
  }

  > p {
    display: flex;
    justify-content: center;
    margin: 4px 10px;
    color: inherit;
    flex: 1 1 auto;
    white-space: pre-line;
  }

  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
`;

export const Info = ({ text }: { text: string }) => {
	return (
		<ToastStyle>
			<span>ℹ️</span> {text}
		</ToastStyle>
	);
};
