import { Button } from "@client/components/Button";
import { SortIcon } from "@client/components/Icons/Sort";
import { displayDate } from "@client/utils/dates";
import styled from "@emotion/styled";
import {
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type ChangeEvent, useState } from "react";
import { SortableHeader, TableContainer, TableWrapper } from "./Table.styled";

export interface ArtistRow {
  id: string;
  name: string;
  createdDate?: Date;
}

const COLUMN_LABELS: Record<string, string> = {
  name: "Name",
  created_date: "Created",
};

const TR = styled.tr`
  &:hover {
    background-color: #f9fafb;
  }
`;

const ArtistName = styled.div`
  font-weight: 500;
`;

const SearchContainer = styled.div`
  margin-bottom: 1rem;

  input {
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    width: 100%;
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
  }
`;

const nameFilter: FilterFn<ArtistRow> = (row, columnId, filterValue) => {
  const value = row.getValue<string>(columnId);
  return value.toLowerCase().includes((filterValue as string).toLowerCase());
};

const columnHelper = createColumnHelper<ArtistRow>();

interface ArtistTableI {
  artists: Array<ArtistRow>;
  showCreatedDate?: boolean;
  onSelect: (id: string) => void;
}

export const ArtistTable = ({
  artists,
  showCreatedDate = false,
  onSelect,
}: ArtistTableI) => {
  const [sorting, setSorting] = useState<SortingState>(
    showCreatedDate ? [{ id: "created_date", desc: true }] : [],
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColumnFilters(value ? [{ id: "name", value }] : []);
  };

  const nameColumn = columnHelper.accessor("name", {
    id: "name",
    header: ({ column }) => (
      <SortableHeader onClick={column.getToggleSortingHandler()}>
        Name
        <SortIcon direction={column.getIsSorted()} />
      </SortableHeader>
    ),
    cell: (info) => <ArtistName>{info.getValue()}</ArtistName>,
    filterFn: nameFilter,
  });

  const createdDateColumn = columnHelper.accessor("createdDate", {
    id: "created_date",
    header: ({ column }) => (
      <SortableHeader onClick={column.getToggleSortingHandler()}>
        Created Date
        <SortIcon direction={column.getIsSorted()} />
      </SortableHeader>
    ),
    cell: (info) => (
      <ArtistName>{displayDate(String(info.getValue()))}</ArtistName>
    ),
  });

  const actionsColumn = columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => (
      <Button
        onClick={() => onSelect(info.row.original.id)}
        text="View Artist"
      />
    ),
  });

  const table = useReactTable({
    data: artists,
    columns: [
      nameColumn,
      ...(showCreatedDate ? [createdDateColumn] : []),
      actionsColumn,
    ],
    getCoreRowModel: getCoreRowModel<ArtistRow>(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  });

  const searchValue =
    (columnFilters.find(({ id }) => id === "name")?.value as string) || "";

  return (
    <TableContainer>
      <SearchContainer>
        <input
          type="text"
          placeholder="Filter by name..."
          value={searchValue}
          onChange={handleSearchChange}
        />
      </SearchContainer>
      <TableWrapper stackedOnPhone>
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <TR key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} data-label={COLUMN_LABELS[cell.column.id]}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </TR>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </TableContainer>
  );
};
