import {
	type ReactNode,
	createContext,
	useContext,
	useMemo,
	useState,
} from "react";

interface TabsContextI {
	showStatus: boolean;
	activeTab: string;
	setShowStatus: (value: boolean) => void;
	setActiveTab: (value: string) => void;
}

export const TabsContext = createContext<TabsContextI>({
	showStatus: false,
	activeTab: "overview",
	setShowStatus: () => undefined,
	setActiveTab: () => undefined,
});

export const TabsContextProvider = ({ children }: { children: ReactNode }) => {
	const [showStatus, setShowStatus] = useState(false);
	const [activeTab, setActiveTab] = useState("overview");

	const value = useMemo(
		() => ({
			showStatus,
			activeTab,
			setShowStatus,
			setActiveTab,
		}),
		[showStatus, activeTab],
	);

	return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
};

export const useTabs = () => {
	const context = useContext(TabsContext);

	if (!context) {
		throw new Error("useTabs must be used within a TabsContextProvider");
	}

	return context;
};
