import ErrorBoundary from "client/components/ErrorBoundary.tsx";
import { Navbar } from "client/components/Navbar.tsx";
import { TabsContextProvider } from "client/context/tabs.context.tsx";
import { globalStyles } from "client/styles/global.styled.ts";
import { setupAuthRefresh } from "client/utils/auth.ts";
import { Global } from "@emotion/react";
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
