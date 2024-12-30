import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MenuIcon } from "./Icons/Menu.tsx";

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;

  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem;
    position: static;
    flex-direction: column;
    align-items: flex-start;
    background-color: #333;
  }
`;

const NavItems = styled.div<{ isOpen: boolean }>`
  background-color: #333;
  color: white;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  
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
        color: white;
        text-decoration: underline;
      `
			: css`
        color: #bababa;
        
        &:hover {
          transform: scale(1.1);
        }
      `};


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
	{ label: "Search", link: "/" },
	{ label: "Releases", link: "/releases" },
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
