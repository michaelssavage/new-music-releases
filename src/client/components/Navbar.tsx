import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MenuIcon } from "./Icons/Menu.tsx";

const NavbarContainer = styled.nav`
  background-color: #8090c0;
  display: flex;
  justify-content: flex-start;
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
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  
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

const NavLink = styled(Link, {
	shouldForwardProp: (prop) => prop !== "isOpen" && prop !== "isActive",
})<{ isOpen: boolean; isActive: boolean }>`
  text-decoration: none;
  font-size: 1.4rem;
  transition: transform 0.3s ease;
    
  ${({ isActive }) =>
		isActive
			? css`
        color: #bababa;
      `
			: css`
        color: white;
      `};

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 10px;
    opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
    transform: translateY(${({ isOpen }) => (isOpen ? "0" : "-20px")});
    transition: opacity 0.3s ease, transform 0.3s ease;

    &:hover {
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
	{ label: "Releases", link: "/releases" },
	{ label: "Search", link: "/" },
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
