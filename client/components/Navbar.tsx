import { useAppStore } from "@client/store/appStore";
import {} from "@client/utils/defaults";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { HomeIcon } from "./Icons/Home";
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

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;

  ${({ isActive }) => {
		if (!isActive) {
			return css`
        color: #bababa;
        transform: scale(1.1);
      `;
		}
		return css`
      color: white;
    `;
	}}
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

const navItems = [{ icon: <HomeIcon />, label: "Home", link: "/" }];

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
				{navItems.map(({ icon, label, link }) => (
					<NavLink key={label} to={link} isActive={matchRoute({ to: link })}>
						{icon} {label}
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
