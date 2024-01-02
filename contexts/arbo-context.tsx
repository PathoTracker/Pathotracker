"use client";

import React, {
  createContext,
  useReducer,
  useEffect
} from "react";
import { MapProvider, MapRef, useMap } from "react-map-gl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Hydrate as RQHydrate, HydrateProps } from "@tanstack/react-query";
import {
  CountryBoundingBox,
  combineCountryBoundingBoxes,
  getBoundingBoxFromCountryName,
} from "@/lib/country-bounding-boxes";
import useArboData from "@/hooks/useArboData";
import { parseISO, isAfter, isBefore } from "date-fns";

export interface ArboContextType extends ArboStateType {
  dispatch: React.Dispatch<ArboAction>;
}
interface ArboStateType {
  filteredData: any[];
  selectedFilters: { [key: string]: string[] };
  dataFiltered: boolean;
}
interface ArboAction {
  type: ArboActionType;
  payload: any;
}
export enum ArboActionType {
  UPDATE_FILTER = "UPDATE_FILTER",
  INITIAL_DATA_FETCH = "INITIAL_DATA_FETCH",
  ADD_FILTERS_TO_MAP = "ADD_FILTERS_TO_MAP",
  RESET_FILTERS = "RESET_FILTERS",
}

export const initialState: ArboStateType = {
  filteredData: [],
  selectedFilters: {
    ["pathogen"]: ["DENV", "ZIKV", "CHIKV", "YF", "WNV", "MAYV"],
  },
  dataFiltered: false,
};

function filterData(data: any[], filters: { [key: string]: string[] }): any[] {
  const filterKeys = Object.keys(filters);

  return data.filter((item: any) => {
    return filterKeys.every((key: string) => {
      if (!filters[key].length) return true;

      if (key === "end_date") {
        const filterEndDate = new Date(filters["end_date"][0]);

        if (isNaN(filterEndDate.getTime())) {
          return true; // Handle invalid date
        }

        const itemStartDate = new Date(item.sample_start_date);
        const itemEndDate = new Date(item.sample_end_date);

        // Check for any overlap in the sampling period
        return !(itemEndDate < filterEndDate && itemStartDate < filterEndDate);
      }

      if (key === "start_date") {
        const filterStartDate = new Date(filters["start_date"][0]);

        if (isNaN(filterStartDate.getTime())) {
          return true; // Handle invalid date
        }

        const itemStartDate = new Date(item.sample_start_date);
        const itemEndDate = new Date(item.sample_end_date);

        // Check for any overlap in the sampling period
        return !(
          itemStartDate > filterStartDate && itemEndDate > filterStartDate
        );
      }
      if (key === "antibody") {
        return item["antibodies"].some((element: string) =>
          filters[key].includes(element)
        );
      } else {
        if (Array.isArray(item[key])) {
          // If item[key] is an array, check if any element of item[key] is included in filters[key]
          return item[key].some((element: string) =>
            filters[key].includes(element)
          );
        } else {
          // If item[key] is a string, check if it's included in filters[key]
          return filters[key].includes(item[key]);
        }
      }
    });
  });
}

export const arboReducer = (
  state: ArboStateType,
  action: ArboAction,
  map: MapRef | undefined
) => {
  switch (action.type) {
    case ArboActionType.UPDATE_FILTER:
      const selectedFilters = {
        ...state.selectedFilters,
        [action.payload.filter]: action.payload.value,
      };

      if (map) {
        adjustMapPositionIfCountryFilterHasChanged(action, map);
      }
      return {
        ...state,
        filteredData: filterData(action.payload.data, selectedFilters),
        selectedFilters: selectedFilters,
        dataFiltered: true,
      };
    case ArboActionType.INITIAL_DATA_FETCH:
      return {
        ...state,
        filteredData: action.payload.data,
        selectedFilters: initialState.selectedFilters,
        dataFiltered: false,
      };
    case ArboActionType.RESET_FILTERS:
      return {
        ...state,
        filteredData: filterData(action.payload.data, {}),
        selectedFilters: initialState.selectedFilters,
        dataFiltered: false,
      };

    default:
      return state;
  }
};

const adjustMapPositionIfCountryFilterHasChanged = (
  action: ArboAction,
  map: MapRef
): void => {
  if (action.payload.filter === "country") {
    const allSelectedCountryBoundingBoxes = action.payload.value
      .map((countryName: string) => getBoundingBoxFromCountryName(countryName))
      .filter((boundingBox: CountryBoundingBox) => !!boundingBox);

    if (allSelectedCountryBoundingBoxes.length === 0) {
      map.fitBounds([-180, -90, 180, 90]);

      return;
    }

    const boundingBoxToMoveMapTo = combineCountryBoundingBoxes(
      allSelectedCountryBoundingBoxes
    );

    map.fitBounds(boundingBoxToMoveMapTo);
  }
};

export const ArboContext = createContext<ArboContextType>({
  ...initialState,
  dispatch: (obj) => {
    console.debug("dispatch not initialized", obj);
  },
});

export const ArboProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        cacheTime: Infinity,
      },
    },
  });

  return (
    <MapProvider>
      <QueryClientProvider client={queryClient}>
        <FilteredDataProvider>{children}</FilteredDataProvider>
      </QueryClientProvider>
    </MapProvider>
  );
};

const FilteredDataProvider = ({ children }: { children: React.ReactNode }) => {
  const { arboMap } = useMap();
  const [state, dispatch] = useReducer(
    (state: ArboStateType, action: ArboAction) =>
      arboReducer(state, action, arboMap),
    initialState
  );
  const dataQuery = useArboData();

  useEffect(() => {
    if (
      state.filteredData.length === 0 &&
      !state.dataFiltered &&
      "data" in dataQuery &&
      !!dataQuery.data &&
      typeof dataQuery.data === "object" &&
      "records" in dataQuery.data &&
      Array.isArray(dataQuery.data.records) &&
      dataQuery.data.records.length > 0
    ) {
      dispatch({
        type: ArboActionType.INITIAL_DATA_FETCH,
        payload: { data: dataQuery.data.records },
      });
    }
  }, [dataQuery]);

  return (
    <ArboContext.Provider value={{ ...state, dispatch: dispatch }}>
      {children}
    </ArboContext.Provider>
  );
};

export function Hydrate(props: HydrateProps) {
  return <RQHydrate {...props} />;
}
