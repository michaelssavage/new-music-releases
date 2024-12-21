import { Global } from "@emotion/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { TabsContextProvider } from "./context/tabs.context.tsx";
import { App } from "./pages/App.tsx";
import { globalStyles } from "./styles/global.styled.ts";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

const queryClient = new QueryClient();

root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<TabsContextProvider>
				<Global styles={globalStyles()} />
				<App />
			</TabsContextProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
