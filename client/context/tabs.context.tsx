import type { Tab } from "@client/components/Tabs";
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
  tabs: Array<Tab>;
  setShowStatus: (value: boolean) => void;
  setActiveTab: (value: string) => void;
  setTabs: (value: Array<Tab>) => void;
}

export const TabsContext = createContext<TabsContextI>({
  showStatus: false,
  activeTab: "playlist",
  tabs: [],
  setShowStatus: () => undefined,
  setActiveTab: () => undefined,
  setTabs: () => undefined,
});

export const TabsContextProvider = ({ children }: { children: ReactNode }) => {
  const [showStatus, setShowStatus] = useState(false);
  const [activeTab, setActiveTab] = useState("playlist");
  const [tabs, setTabs] = useState<Array<Tab>>([]);

  const value = useMemo(
    () => ({
      showStatus,
      activeTab,
      tabs,
      setShowStatus,
      setActiveTab,
      setTabs,
    }),
    [showStatus, activeTab, tabs],
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
