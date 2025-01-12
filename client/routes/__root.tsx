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
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	useEffect(() => {
		setupAuthRefresh();
	}, []);

	const { userId, updateSavedArtists, fetchedArtists, setFetchedArtists } =
		useAppStore();

	const { refetch: refetchArtists } = useQuery<Array<Artist>>({
		queryKey: ["root", userId],
		queryFn: () => {
			console.log("!!!root");
			return getSavedArtists(userId);
		},
		enabled: false,
	});

	useEffect(() => {
		const userId = useAppStore.getState().userId;

		if (userId && !fetchedArtists) {
			refetchArtists().then((result) => {
				if (result.data) {
					updateSavedArtists(result.data);
					setFetchedArtists(true);
				}
			});
		}
	}, [fetchedArtists, setFetchedArtists, refetchArtists, updateSavedArtists]);

	return (
		<TabsContextProvider>
			<Global styles={globalStyles()} />
			<Toaster position="top-right" reverseOrder />
			<Navbar />
			<ErrorBoundary>
				<Outlet />
			</ErrorBoundary>
			<TanStackRouterDevtools position="bottom-right" />
		</TabsContextProvider>
	);
}
