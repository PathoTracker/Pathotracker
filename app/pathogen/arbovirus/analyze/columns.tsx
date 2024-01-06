"use client";

import { ColumnDef } from "@tanstack/table-core";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { HeaderContext, Row } from "@tanstack/react-table";
import validator from "validator";
import Link from "next/link";
import { TranslateDate } from "@/utils/translate-util/translate-service";
import { DataTableColumnDef } from "@/components/ui/data-table/data-table";

export type Estimate = {
  ageGroup: string;
  ageMaximum: number;
  ageMinimum: number;
  antibodies: string[];
  assay: string;
  assayOther: null;
  city: string;
  country: string;
  createdAt: string;
  id: string;
  inclusionCriteria: string;
  latitude: number;
  longitude: number;
  pathogen: "DENV" | "ZIKV" | "CHIKV" | "YF" | "WNV" | "MAYV" | undefined;
  producer: string;
  producerOther: string;
  sameFrameTargetGroup: string;
  sampleEndDate: string;
  sampleFrame: string;
  sampleNumerator: number;
  sampleSize: number;
  sampleStartDate: string;
  seroprevalence: number;
  sex: string;
  sourceSheetId: string;
  state: string;
  url: string;
};

const get_header = (columnName: string) => {
  const HeaderComponent: React.FC<HeaderContext<Estimate, unknown>> = ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {columnName}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
  return HeaderComponent;
};

export const columns: DataTableColumnDef<Estimate, unknown>[] = [
  {
    accessorKey: "estimateId",
    header: get_header("Estimate ID"),
    cell: ({ row }) => {
      const url: string = row.getValue("url");

      if(url && validator.isURL(url)) {
        return (
          // TODO: Link styling needs to be globalised. 
          <Link className="w-full underline hover:text-blue-400" href={url} rel="noopener noreferrer" target="_blank">
            {row.getValue("estimateId")}
          </Link>
        )
      }

      return <p> {row.getValue("estimateId")} </p>
      
    },
    fixed: true
  },
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
    cell: ({ row }) => {
      const pathogen = row.getValue("pathogen");
      if (typeof pathogen === "string") {
        let color: string = "";
        switch (pathogen) {
          case "DENV":
            color = "bg-denv";
            break;
          case "ZIKV":
            color = "bg-zikv";
            break;
          case "CHIKV":
            color = "bg-chikv";
            break;
          case "YF":
            color = "bg-yf";
            break;
          case "WNV":
            color = "bg-wnv";
            break;
          case "MAYV":
            color = "bg-mayv";
            break;
          default:
            color = "bg-gray-100";
            break;
        }

        return (
          <div className={color + " p-2 rounded-sm text-center"}>{pathogen}</div>
        )

      }
      return "N/A";
    }
  },
  {
    accessorKey: "seroprevalence",
    header: get_header("Seroprevalence"),
    cell: ({ row }) => {
      const seroprevalence = row.getValue("seroprevalence");
      if (typeof seroprevalence === 'number') {
        return `${(seroprevalence * 100).toFixed(1)}%`;
      } else if (typeof seroprevalence === 'string') {
        const seroprevalenceNumber = parseFloat(seroprevalence);
        if (!isNaN(seroprevalenceNumber)) {
          return `${(seroprevalenceNumber * 100).toFixed(1)}%`;
        }
      }
      return 'N/A';
    }
  },
  {
    accessorKey: "antibodies",
    header: get_header("Antibodies"),
    cell: ({ row }) => {
      const antibodies = row.getValue("antibodies");
      if (Array.isArray(antibodies)) {
        return antibodies.sort().map((antibody) => {
          let color: string = ""
          switch (antibody) {
            case "IgG": 
              color = "bg-blue-700 text-white"
              break;
            case "IgM": 
              color = "bg-black text-white"
              break;
            case "IgAM": 
              color = "bg-green-200"
              break;
            case "NAb": 
              color = "bg-yellow-400"
              break;
            default:
              color = "bg-sky-100"
              break;
          }

          return (
            <span className={color + " m-1 p-2 rounded-sm"} key={antibody}>{antibody}</span>
          )
      });
      }
      return 'N/A';
    }
  },
  {
    accessorKey: "sampleStartDate",
    header: ({ column }) => {
      const sortingFn = (rowA: Row<Estimate>, rowB: Row<Estimate>, columnId: string) => {
        if(!rowA.original.sampleStartDate){
          return -1
        }
        if(!rowB.original.sampleStartDate){
          return 1
        }
        const rowASampleStartDate = new Date(rowA.original.sampleStartDate)
        const rowBSampleStartDate = new Date(rowB.original.sampleStartDate)
        if (rowASampleStartDate.getTime() > rowBSampleStartDate.getTime()) {
          return 1
        }
        return -1

      }
      column.columnDef.sortingFn = sortingFn
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sampling Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const start_date = row.original.sampleStartDate;
      if(start_date) {
        return TranslateDate(start_date)
      }
      return 'N/A';
    }
  },
  {
    accessorKey: "sampleEndDate",
    header: ({ column }) => {
      const sortingFn = (rowA: Row<Estimate>, rowB: Row<Estimate>, columnId: string) => {
        if(!rowA.original.sampleEndDate){
          return -1
        }
        if(!rowB.original.sampleEndDate){
          return 1
        }
        const rowASampleEndDate = new Date(rowA.original.sampleEndDate)
        const rowBSampleEndDate = new Date(rowB.original.sampleEndDate)
        if (rowASampleEndDate.getTime() > rowBSampleEndDate.getTime()) {
          return 1
        }
        return -1

      }
      column.columnDef.sortingFn = sortingFn
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sampling End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const end_date = row.original.sampleEndDate;
      if(end_date) {
        return TranslateDate(end_date)
      }
      return 'N/A';
    }
  },
  {
    accessorKey: "whoRegion",
    header: get_header("WHO Region"),
  },
  {
    accessorKey: "assay",
    header: get_header("Assay"),
  },
  {
    accessorKey: "assayOther",
    header: get_header("Assay Other"),
  },
  {
    accessorKey: "producer",
    header: get_header("Producer"),
  },
  {
    accessorKey: "producerOther",
    header: get_header("Producer Other"),
  },
  {
    accessorKey: "sampleFrame",
    header: get_header("Sample Frame"),
  },
  {
    accessorKey: "sampleNumerator",
    header: get_header("Sample Numerator"),
  },
  {
    accessorKey: "sampleSize",
    header: get_header("Sample Size"),
  },
  {
    accessorKey: "city",
    header: get_header("City"),
  },
  {
    accessorKey: "country",
    header: get_header("Country"),
  },
  // {
  //   accessorKey: "sampleStartDate",
  //   header: "Sample Start Date",
  // },
  {
    accessorKey: "sex",
    header: get_header("Sex"),
  },
  {
    accessorKey: "ageGroup",
    header: get_header("Age Group"),
  },
  // {
  //   accessorKey: "ageMaximum",
  //   header: get_header("Age Maximum"),
  // },
  // {
  //   accessorKey: "ageMinimum",
  //   header: get_header("Age Minimum"),
  // },
  {
    accessorKey: "url",
    header: "Source",
    cell: ({ row }) => {
      const url: string = row.getValue("url");

      if(!validator.isURL(url)) {
        return <p> URL unavailable </p>
      }

      return (
        <Button onClick={() => window.open(row.getValue("url"))} className="w-full">
          {new URL(row.getValue("url")).hostname}
        </Button>
      )
    },
  },
];
