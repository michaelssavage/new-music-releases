import { useAppStore } from "@client/store/appStore";
import {} from "@client/utils/defaults";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { SearchBox } from "./SearchBox";

interface NavLinkProps {
	isActive: boolean | Record<never, string>;
}

const NavbarContainer = styled.nav`
  padding: 3rem 2rem;
  background-color: ${({ color }) => color || "#8090c0"};

  display: flex;
  align-items: center;

  @media screen and (max-width:  440px) {
    flex-direction: column;
    gap: 2rem; 
  }
`;

const NavItems = styled.div`
  background-color: #333;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;

`;

const NavLink = styled(Link, {
	shouldForwardProp: (prop) => prop !== "isActive",
})<NavLinkProps>`
  text-decoration: none;
  font-size: 1.4rem;
  transition: transform 0.3s ease;
  color: ${({ isActive }) => (isActive ? "white" : "#bababa")};
  text-decoration: ${({ isActive }) => (isActive ? "underline" : "none")};

  ${({ isActive }) =>
		!isActive &&
		css`
      &:hover {
        transform: scale(1.1);
      }
  `}
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

const navItems = [{ label: "Home", link: "/" }];

export const Navbar = () => {
	const navigate = useNavigate();
	const matchRoute = useMatchRoute();
	const { isAuthenticated, logout } = useAppStore();

	const handleLogout = () => {
		logout();
		navigate({ to: "/login" });
	};

	return (
		<NavbarContainer>
			<NavItems>
				{navItems.map(({ label, link }) => (
					<NavLink key={label} to={link} isActive={matchRoute({ to: link })}>
						{label}
					</NavLink>
				))}
				{isAuthenticated && (
					<LogoutButton onClick={handleLogout}>Logout</LogoutButton>
				)}
			</NavItems>

			<SearchBox />
		</NavbarContainer>
	);
};
