import { DataTableColumnDef } from "./data-table";

interface useDataStylesInput<TData, TValue> {
  columns: DataTableColumnDef<TData, TValue>[];
}

interface GenerateClassnameForHeaderInput {
  columnId: string;
}

interface GenerateClassnameForCellInput {
  columnId: string;
}

export const useDataTableStyles = <TData, TValue>(input: useDataStylesInput<TData, TValue>) => {
  const { columns } = input;

  const generateClassnameForHeader = (input: GenerateClassnameForHeaderInput) => {
    const { columnId } = input;

    const baseClassnameForHeader = "border-b bg-white";
    const classnameForLeftColumnFixation = "sticky left-0 border-r";

    const columnDefinition = columns.find((column) => column.accessorKey === columnId);

    if (!columnDefinition || columnDefinition.fixed !== true) {
      return baseClassnameForHeader;
    }

    return baseClassnameForHeader
      .concat(" ")
      .concat(classnameForLeftColumnFixation);
  };

  const generateClassnameForCell = (input: GenerateClassnameForCellInput) => {
    const { columnId } = input;

    const baseClassnameForHeader = "border-b bg-white group-hover:bg-zinc-100";
    const classnameForLeftColumnFixation = "sticky left-0 border-r";

    const columnDefinition = columns.find((column) => column.accessorKey === columnId);

    if (!columnDefinition || columnDefinition.fixed !== true) {
      return baseClassnameForHeader;
    }

    return baseClassnameForHeader
      .concat(" ")
      .concat(classnameForLeftColumnFixation);
  };

  return {
    generateClassnameForHeader,
    generateClassnameForCell
  };
};
