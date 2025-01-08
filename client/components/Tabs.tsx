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

interface TabsProps {
	data: Tab[];
	defaultTab?: string;
	loading?: boolean;
}

const TabWrapper = styled.div`
	margin: 1rem 0;
`;

const List = styled.div`
  display: flex;
  gap: 0.1rem;
  border-bottom: solid 2px #c4c4c4;
  flex-wrap: wrap;

  [role="tab"] {
    border: none;
		border-radius: 4px;
    margin-bottom: -2px;
    padding: 0.25rem 1rem;
    cursor: pointer;
    border-bottom: solid 2px #c4c4c4;
		background-color: #1ed4b6;
		&:hover {
			color: #eff3f2;
			background-color: #0d6153;
		}

    &[aria-selected="true"] {
      cursor: auto;
			color: #eff3f2;
			background-color: #4e6db0;
      border-bottom-color: #4e6db0;
      font-weight: bold;
			&:hover {
				color: #eff3f2;
				background-color: #4e6db0;
				border-bottom-color: #4e6db0;
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

export const Tabs = ({ data, defaultTab, loading = false }: TabsProps) => {
	const tabsRef = useRef<Array<null | HTMLButtonElement>>([]);
	const nodeRef = useRef(null);

	const { activeTab, setActiveTab } = useTabs();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (defaultTab) setActiveTab(defaultTab);
	}, [defaultTab]);

	const onKeyDown = ({ code }: KeyboardEvent) => {
		let index = data.findIndex(({ key }) => key === activeTab);

		if (["ArrowRight", "ArrowDown"].includes(code)) {
			index++;
			if (index > data.length - 1) index = 0;
		} else if (["ArrowLeft", "ArrowUp"].includes(code)) {
			index--;
			if (index < 0) index = data.length - 1;
		}

		tabsRef.current[index]?.focus();
		setActiveTab(data[index].key);
	};

	const changeTab = (index: number, el: HTMLButtonElement | null) => {
		tabsRef.current[index] = el;
	};

	const renderTab = (
		key: string,
		tab: ReactNode,
		isActive: boolean,
		index: number,
	) => {
		return (
			<button
				key={key}
				type="button"
				role="tab"
				tabIndex={isActive ? 0 : -1}
				ref={(el) => changeTab(index, el)}
				aria-selected={isActive}
				onClick={() => setActiveTab(key)}
				onKeyDown={onKeyDown}
			>
				{tab}
			</button>
		);
	};

	const activePanel = data.find(({ key }) => key === activeTab);

	return (
		<TabWrapper>
			<List role="tablist">
				{data.map(({ key, tab }, index) => {
					const isActive = key === activeTab;
					return renderTab(key, tab, isActive, index);
				})}
			</List>
			{loading ? (
				<Loader />
			) : (
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
			)}
		</TabWrapper>
	);
};
