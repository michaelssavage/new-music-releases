import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MenuIcon } from "./Icons/Menu.tsx";

const NavbarContainer = styled.nav`
  background-color: #8090c0;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    background-color: #333;
  }
`;

const NavItems = styled.div<{ isOpen: boolean }>`
  background-color: #333;
  color: white;
  padding: 1rem;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    padding: 0;
    flex-direction: column;
    border-radius: 0;
    width: 100%;
    max-height: ${({ isOpen }) => (isOpen ? "500px" : "0")};
    opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
    overflow: hidden;
    transition: all 0.3s ease-in-out;
  }
`;

const NavLink = styled(Link)<{ isOpen: boolean; isActive: boolean }>`
  ${({ isActive }) =>
		isActive
			? css`
        color: #7fd1dd;
        text-decoration: underline;
      `
			: css`
        color: white;
        text-decoration: none;
      `};
  font-size: 1.4rem;

  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 10px;
    opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
    transform: translateY(${({ isOpen }) => (isOpen ? "0" : "-20px")});
    transition: opacity 0.3s ease, transform 0.3s ease;

    &:hover {
      text-decoration: none;
      color: #c5cccb;
    }
  }
`;

const Menu = styled(MenuIcon)`
  display: none;

  @media (max-width: 768px) {
    display: block;
    cursor: pointer;
  }
`;

const navItems = [
	{ label: "Home", link: "/" },
	{ label: "Profile", link: "/profile" },
];

export const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const matchRoute = useMatchRoute();

	return (
		<NavbarContainer>
			<Menu color="white" size={30} onClick={() => setIsOpen(!isOpen)} />

			<NavItems isOpen={isOpen}>
				{navItems.map(({ label, link }) => (
					<NavLink
						key={label}
						to={link}
						isOpen={isOpen}
						isActive={matchRoute({ to: link })}
					>
						{label}
					</NavLink>
				))}
			</NavItems>
		</NavbarContainer>
	);
};
