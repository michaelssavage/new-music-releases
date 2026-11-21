import type { ReactNode } from "react";

interface NavIconProps {
  children: ReactNode;
}

const NavIcon = ({ children }: NavIconProps) => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const PlaylistIcon = () => (
  <NavIcon>
    <path d="M4 6h10" />
    <path d="M4 12h10" />
    <path d="M4 18h6" />
    <path d="M18 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    <path d="M21 17v-11" />
  </NavIcon>
);

export const ArtistsIcon = () => (
  <NavIcon>
    <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </NavIcon>
);

export const FollowedIcon = () => (
  <NavIcon>
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
    <path d="M16 19h6" />
    <path d="M19 16v6" />
  </NavIcon>
);

export const TicketIcon = () => (
  <NavIcon>
    <path d="M15 5l0 2" />
    <path d="M15 11l0 2" />
    <path d="M15 17l0 2" />
    <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2" />
  </NavIcon>
);

export const SlidersIcon = () => (
  <NavIcon>
    <path d="M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M6 4v4" />
    <path d="M6 12v8" />
    <path d="M10 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M12 4v10" />
    <path d="M12 18v2" />
    <path d="M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M18 4v1" />
    <path d="M18 9v11" />
  </NavIcon>
);

export const LogoutIcon = () => (
  <NavIcon>
    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
    <path d="M9 12h12l-3 -3" />
    <path d="M18 15l3 -3" />
  </NavIcon>
);

export const SidebarToggleIcon = () => (
  <NavIcon>
    <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
    <path d="M9 4v16" />
  </NavIcon>
);
