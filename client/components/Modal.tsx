import { slideInAnimation } from "@client/styles/abstracts/animations.styled";
import { forPhoneOnly } from "@client/styles/abstracts/mixins.styled";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { CloseIcon } from "./Icons/Close";

const Backdrop = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
	overflow-y: auto;
`;

const Container = styled.div<{ width?: string }>`
  background-color: #f5faf7;
  max-width: ${({ width }) => width || "700px"};
	border-radius: 4px;
  margin: 50px auto;
  padding: 2.5rem;
  transform-origin: center center;
	position: relative;

  ${slideInAnimation("100px")}

  ${forPhoneOnly(css`
    width: 100%;
    max-width: 100%;
    height: 100vh;
    min-height: 100%;
    margin: 0 auto;
    border-radius: 0;
    overflow-x: auto;
    padding: 1rem;
  `)}
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;

	position: absolute;
	top: 0;
	right: 0;
`;

interface ModalProps {
	isOpen: boolean;
	setIsOpen: (state: boolean) => void;
	children: ReactNode;
	width?: string;
}

export const Modal = ({ isOpen, setIsOpen, children, width }: ModalProps) => {
	const backdrop = useRef(null);

	const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === backdrop.current) {
			requestAnimationFrame(() => setIsOpen(false));
		}
	};

	useEffect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsOpen(false);
		};

		if (isOpen) {
			document.addEventListener("keydown", handleKeydown);
		} else {
			document.body.style.overflow = "auto";
		}

		return () => {
			document.removeEventListener("keydown", handleKeydown);
			document.body.style.overflow = "auto";
		};
	}, [isOpen, setIsOpen]);

	return createPortal(
		isOpen && (
			<Backdrop ref={backdrop} onClick={onBackdropClick}>
				<Container width={width}>
					<Header>
						<Button
							onClick={() => setIsOpen(false)}
							variant="ghost"
							aria-label="Close Modal"
							text="Close"
							icon={<CloseIcon />}
						/>
					</Header>
					<div>{children}</div>
				</Container>
			</Backdrop>
		),
		document.body,
	);
};
