import ErrorBoundary from "@client/components/ErrorBoundary";
import { Navbar } from "@client/components/Navbar";
import { TabsContextProvider } from "@client/context/tabs.context";
import { getSavedArtists } from "@client/lib/spotify";
import { useAppStore } from "@client/store/appStore";
import { globalStyles } from "@client/styles/global.styled";
import { setupAuthRefresh } from "@client/utils/auth";
import { Global } from "@emotion/react";
import type { Artist } from "@model/spotify/search";
import { useQuery } from "@tanstack/react-query";
import { Outlet, createRootRoute, useMatch } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	const { userId, setSavedArtists, setRefetchArtists } = useAppStore();

	useEffect(() => {
		setupAuthRefresh();
	}, []);

	const { data, refetch } = useQuery<Array<Artist>>({
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

	const isLoginRoute = useMatch({ from: "/login", shouldThrow: false });

	return (
		<TabsContextProvider>
			<Global styles={globalStyles()} />
			<Toaster position="top-right" reverseOrder />
			{!isLoginRoute && <Navbar />}
			<ErrorBoundary>
				<Outlet />
			</ErrorBoundary>
			<TanStackRouterDevtools position="bottom-right" />
		</TabsContextProvider>
	);
}
