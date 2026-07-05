import { useTabs } from "@client/context/tabs.context";
import styled from "@emotion/styled";
import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { Loader } from "./Loader";

export interface Tab {
  key: string;
  tab: string | ReactNode;
  panel: string | ReactNode;
  visible?: boolean;
}

interface TabListProps {
  data: Array<Tab>;
  defaultTab?: string;
}

interface TabPanelProps {
  data: Array<Tab>;
  loading?: boolean;
}

export const List = styled.div`
  border: 1px solid #4e6db0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  overflow: hidden;

  [role="tab"] {
    border: none;
    padding: 0.25rem 1rem;
    cursor: pointer;
    background-color: #1ed4b6;
    &:hover {
      background-color: #1abda2;
    }

    &[aria-selected="true"] {
      cursor: auto;
      color: #eff3f2;
      background-color: #4e6db0;
      font-weight: bold;
      &:hover {
        color: #eff3f2;
        background-color: #4e6db0;
      }
    }

    &:focus {
      outline: none;
      box-shadow: none;
    }
    &:focus-visible {
      outline: 1px solid #1e1e1e;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.75);
      transition: none;
    }
  }
`;

const Panel = styled.div`
  padding: 1.5rem 0rem;
`;

export const TabList = ({ data, defaultTab }: TabListProps) => {
  const tabsRef = useRef<Array<null | HTMLButtonElement>>([]);
  const { activeTab, setActiveTab } = useTabs();

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab, setActiveTab]);

  const onKeyDown = ({ code }: KeyboardEvent) => {
    let index = data.findIndex(({ key }) => key === activeTab);

    if (["ArrowRight", "ArrowDown"].includes(code)) {
      index = (index + 1) % data.length;
    } else if (["ArrowLeft", "ArrowUp"].includes(code)) {
      index = (index - 1 + data.length) % data.length;
    }

    tabsRef.current[index]?.focus();
    setActiveTab(data[index].key);
  };

  return (
    <List role="tablist">
      {data.map(({ key, tab }, index) => {
        const isActive = key === activeTab;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            tabIndex={isActive ? 0 : -1}
            ref={(el) => {
              tabsRef.current[index] = el;
            }}
            aria-selected={isActive}
            onClick={() => setActiveTab(key)}
            onKeyDown={onKeyDown}
          >
            {tab}
          </button>
        );
      })}
    </List>
  );
};

export const TabPanel = ({ data, loading = false }: TabPanelProps) => {
  const nodeRef = useRef(null);
  const { activeTab } = useTabs();
  const activePanel = data.find(({ key }) => key === activeTab);

  if (loading) return <Loader />;

  return (
    <SwitchTransition>
      <CSSTransition
        classNames="fade"
        timeout={200}
        key={activeTab}
        nodeRef={nodeRef}
        exit={false}
      >
        <Panel ref={nodeRef} role="tabpanel">
          {activePanel?.panel}
        </Panel>
      </CSSTransition>
    </SwitchTransition>
  );
};
