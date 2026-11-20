import ErrorBoundary from "@client/components/ErrorBoundary";
import { getSavedArtists } from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { globalStyles } from "@client/styles/global.styled";
import { setupAuthRefresh } from "@client/utils/auth";
import { Global } from "@emotion/react";
import type { SavedArtistI } from "@model/spotify";
import { useQuery } from "@tanstack/react-query";
import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Toaster } from "react-hot-toast";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { userId, setSavedArtists, setRefetchArtists } = useAppStore();

  useEffect(() => {
    setupAuthRefresh();
  }, []);

  const { data, refetch } = useQuery<Array<SavedArtistI>>({
    queryKey: ["root", userId],
    queryFn: () => getSavedArtists(userId),
    enabled: userId !== null,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (data) {
      setSavedArtists(data);
      setRefetchArtists(refetch);
    }
  }, [data, setSavedArtists, setRefetchArtists, refetch]);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      <Global styles={globalStyles()} />
      {createPortal(
        <Toaster position="top-right" reverseOrder />,
        document.body,
      )}
      <ErrorBoundary key={pathname}>
        <Outlet />
      </ErrorBoundary>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
