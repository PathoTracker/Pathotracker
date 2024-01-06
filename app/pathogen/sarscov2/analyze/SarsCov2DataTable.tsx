"use client";

import { columns } from "@/app/pathogen/sarscov2/analyze/columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import React, { useContext } from "react";
import { SarsCov2Context } from "@/contexts/sarscov2-context";
import useSarsCov2Data from "@/hooks/useSarsCov2Data";

export default function SarsCov2DataTable() {
  const dataQuery = useSarsCov2Data();
  const state = useContext(SarsCov2Context);
  if(state.filteredData.length > 0 || (dataQuery.isSuccess && dataQuery.data)) {
    return <DataTable
      columns={columns}
      data={state.filteredData}
      expandFilters={() => console.error("Expanding and minimizing filters is not implemented for the Sars Cov 2 dashboard.")}
      minimizeFilters={() => console.error("Expanding and minimizing filters is not implemented for the Sars Cov 2 dashboard.")}
      areFiltersExpanded={true}
    />;
  } else {
    return <>Loading Data ...</>
  }
}
