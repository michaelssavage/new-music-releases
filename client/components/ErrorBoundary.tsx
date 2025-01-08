import styled from "@emotion/styled";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	message: string;
}

const Wrapper = styled.div`
  padding: 3rem 2rem;
  background-color: #8090c0;

  h1 {
    color: #fafafa;
  }
`;

const Message = styled.div`
  padding: 1rem;
  
`;

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, message: "" };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught an error: ", error, errorInfo);
		this.setState({ hasError: true, message: error.message });
	}

	render() {
		if (this.state.hasError) {
			return (
				<div>
					<Wrapper>
						<h1>An error occurred</h1>
					</Wrapper>
					{this.state.message && <Message>{this.state.message}</Message>}
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
