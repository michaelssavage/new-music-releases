import { forPhoneOnly } from "@client/styles/abstracts/mixins.styled";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

export const TableContainer = styled.div`
  width: 100%;
  min-width: 0;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  ${forPhoneOnly("padding: 0.75rem;")}
`;

const stackedRowsOnPhone = forPhoneOnly(css`
  thead tr {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;

    ${forPhoneOnly("gap: 0.25rem;")}
  }

  th {
    padding: 0.25rem 0;
  }

  tbody tr {
    display: block;
    padding: 0.5rem 0;
    border-top: 1px solid #e5e7eb;
  }

  td {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.25rem 0;
    border-top: none;

    &[data-label]::before {
      content: attr(data-label);
      flex: 0 0 5.5rem;
      font-size: 0.75rem;
      color: #6b7280;
    }
  }
`);

export const TableWrapper = styled.div`
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;

    th {
      padding: 0.5rem 1rem;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(15, 16, 18);

      ${forPhoneOnly("padding: 0.25rem 0.5rem;")}
    }

    td {
      padding: 0.5rem 1rem;
      border-top: 1px solid #e5e7eb;
    }

    tr:hover {
      background-color: #f9fafb;
    }

    ${stackedRowsOnPhone}
  }
`;

export const SortableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  &:hover {
    color: #4b5563;
  }
`;
