import styled from "@emotion/styled";

export const ConfigCard = styled.section`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.5rem;
  width: 100%;
  max-width: 900px;
`;

export const ConfigCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    font-size: 1rem;
  }
`;
