import { TabList } from "@client/components/Tabs";
import { useTabs } from "@client/context/tabs.context";
import { useAppStore } from "@client/store/appStore";
import styled from "@emotion/styled";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { SearchBox } from "./SearchBox";

interface NavLinkProps {
  isActive: boolean | Record<never, string>;
}

const NavbarContainer = styled.nav`
  padding: 2rem 2rem 1rem;
  background-color: #eaecf1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NavItems = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 4px;

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;

  @media screen and (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const NavLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<NavLinkProps>`
  text-decoration: none;
  transition: transform 0.3s ease;

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.3rem;
  font-weight: bold;

  color: #171717;

  &:hover {
    color: #2f2f2f;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #171717;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.3rem;

  &:hover {
    color: #2f2f2f;
  }
`;

export const Navbar = () => {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const { isAuthenticated, logout } = useAppStore();
  const { tabs } = useTabs();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <NavbarContainer>
      <NavItems>
        <NavLink to="/" isActive={matchRoute({ to: "/" })}>
          HOME
        </NavLink>

        {isAuthenticated && (
          <LogoutButton onClick={handleLogout}>LOGOUT</LogoutButton>
        )}
        <SearchBox />
      </NavItems>

      {tabs && <TabList data={tabs} defaultTab={tabs[0]?.key} />}
    </NavbarContainer>
  );
};
