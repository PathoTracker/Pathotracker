"use client";

import { ColumnDef } from "@tanstack/table-core";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { DataTableColumnDef } from "@/components/ui/data-table/data-table";

export type Estimate = {
  age_group: string;
  age_maximum: number;
  age_minimum: number;
  antibodies: string[];
  assay: string;
  assay_other: null;
  city: string;
  country: string;
  created_at: string;
  id: string;
  inclusion_criteria: string;
  latitude: number;
  longitude: number;
  pathogen: "DENV" | "ZIKV" | "CHIKV" | "YF" | "WNV" | "MAYV" | undefined;
  producer: string;
  producer_other: string;
  same_frame_target_group: string;
  sample_end_date: string;
  sample_frame: string;
  sample_numerator: number;
  sample_size: number;
  sample_start_date: string;
  seroprevalence: number;
  sex: string;
  source_sheet_id: string;
  state: string;
  url: string;
};

export const columns: DataTableColumnDef<Estimate, unknown>[] = [
  {
    accessorKey: "pathogen",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Arbovirus
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "antibodies",
    header: "Antibodies",
  },
  {
    accessorKey: "seroprevalence",
    header: "Seroprevalence",
  },
  {
    accessorKey: "assay",
    header: "Assay",
  },
  {
    accessorKey: "assay_other",
    header: "Assay Other",
  },
  {
    accessorKey: "producer",
    header: "Producer",
  },
  {
    accessorKey: "producer_other",
    header: "Producer Other",
  },
  {
    accessorKey: "same_frame_target_group",
    header: "Same Frame Target Group",
  },
  // {
  //   accessorKey: "sample_end_date",
  //   header: "Sample End Date",
  // },
  {
    accessorKey: "sample_frame",
    header: "Sample Frame",
  },
  {
    accessorKey: "sample_numerator",
    header: "Sample Numerator",
  },
  {
    accessorKey: "sample_size",
    header: "Sample Size",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "latitude",
    header: "Latitude",
  },
  {
    accessorKey: "longitude",
    header: "Longitude",
  },
  // {
  //   accessorKey: "sample_start_date",
  //   header: "Sample Start Date",
  // },
  {
    accessorKey: "sex",
    header: "Sex",
  },
  {
    accessorKey: "age_group",
    header: "Age Group",
  },
  {
    accessorKey: "age_maximum",
    header: "Age Maximum",
  },
  {
    accessorKey: "age_minimum",
    header: "Age Minimum",
  },
  // {
  //   accessorKey: "url",
  //   header: "URL",
  // },
];
