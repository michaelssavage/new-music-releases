import styled from "@emotion/styled";
import { Link } from "@tanstack/react-router";
import { SearchBox } from "./SearchBox";

const NavbarContainer = styled.header`
  padding: 1rem 2rem;
  background-color: #eaecf1;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;

  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.5rem;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;

  @media screen and (min-width: 601px) {
    justify-self: start;
  }
`;

export const Navbar = () => (
  <NavbarContainer>
    <Brand>
      <Link to="/">
        <img src="/cookie-jar.png" alt="Cookie Jar" width="36px" />
      </Link>

      <h1>Cookie Jar</h1>
    </Brand>

    <SearchBox />
  </NavbarContainer>
);
