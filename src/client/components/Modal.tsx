import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { slideInAnimation } from "client/styles/abstracts/animations.styled";
import { forPhoneOnly } from "client/styles/abstracts/mixins.styled";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
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
  min-height: 100%;
  overflow-y: auto; 
`;

const Container = styled.div`
  background-color: #f5faf7;
  max-width: 700px;
	border-radius: 4px;
  margin: 50px auto;
  padding: 2.5rem;
  transform-origin: center center;
  overflow-x: hidden;
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
	closeOnClickOutside?: boolean;
	children: ReactNode;
}

export const Modal = ({
	isOpen,
	setIsOpen,
	closeOnClickOutside = true,
	children,
}: ModalProps) => {
	const backdrop = useRef(null);
	const container = useRef(null);
	const backdropMouseDown = useRef(false);

	const onKeydown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") setIsOpen(false);
		},
		[setIsOpen],
	);

	useEffect(() => {
		document.addEventListener("keydown", onKeydown, false);
		return () => document.removeEventListener("keydown", onKeydown, false);
	}, [onKeydown]);

	useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "auto";
	}, [isOpen]);

	const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === backdrop.current) backdropMouseDown.current = true;
		else backdropMouseDown.current = false;
	};

	// Add proper typing for the event parameter
	const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
		if (
			e.target === backdrop.current &&
			backdropMouseDown.current &&
			closeOnClickOutside
		) {
			setIsOpen(false);
		}
	};

	return createPortal(
		<CSSTransition
			classNames="fade"
			nodeRef={backdrop}
			in={isOpen}
			timeout={250}
			unmountOnExit
		>
			<Backdrop
				ref={backdrop}
				onMouseDown={onMouseDown}
				onMouseUp={onMouseUp}
				aria-label="Modal Backdrop"
			>
				<CSSTransition
					classNames="apear"
					nodeRef={container}
					in={isOpen}
					timeout={250}
					unmountOnExit
				>
					<Container ref={container}>
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
				</CSSTransition>
			</Backdrop>
		</CSSTransition>,
		document.body,
	);
};
