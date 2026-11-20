import styled from "@emotion/styled";
import { Link } from "@tanstack/react-router";
import { SearchBox } from "./SearchBox";

const NavbarContainer = styled.header`
  padding: 1rem 2rem;
  background-color: #eaecf1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Navbar = () => (
  <NavbarContainer>
    <Link to="/">
      <img src="/cookie-jar.png" alt="Cookie Jar" width="36px" />
    </Link>

    <h1>Cookie Jar</h1>

    <SearchBox />
  </NavbarContainer>
);
