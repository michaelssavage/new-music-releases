import { useAppStore } from "@client/store/appStore";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MenuIcon } from "./Icons/Menu";

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;

  display: flex;
  justify-content: center;
  align-items: center;
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

`;

const NavLink = styled(Link, {
	shouldForwardProp: (prop) => !["isActive", "isOpen"].includes(prop),
})<{
	isOpen: boolean;
	isActive: boolean | Record<never, string>;
}>`
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

`;

const Menu = styled(MenuIcon)`
  display: none;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #bababa;
  font-size: 1.4rem;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const navItems = [
	{ label: "Search", link: "/" },
	{ label: "Releases", link: "/releases" },
];

export const Navbar = () => {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const matchRoute = useMatchRoute();
	const { isAuthenticated, logout } = useAppStore();

	const handleLogout = () => {
		logout();
		navigate({ to: "/login" });
	};

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
				{isAuthenticated && (
					<LogoutButton onClick={handleLogout}>Logout</LogoutButton>
				)}
			</NavItems>
		</NavbarContainer>
	);
};
