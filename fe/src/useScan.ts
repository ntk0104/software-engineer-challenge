import axios, { AxiosError } from "axios";
import { useState } from "react";

interface DataResponse {
  name: string;
  value: number;
}

// Interface for the hook return value
interface ScanResult {
  getTableNumeric: (url: string) => void;
  error: AxiosError<any> | undefined;
  tableLabel: string[];
  tableData: number[];
}

// Custom hook definition
const useScan = (): ScanResult => {
  // State variables to manage errors, table labels, and table data
  const [error, setError] = useState<AxiosError<any> | undefined>();
  const [tableLabel, setTableLabel] = useState<string[]>([]);
  const [tableData, setTableData] = useState<number[]>([]);

  // Function to fetch numeric data from a table in the provided URL
  const getTableNumeric = async (url: string) => {
    try {
      // Send a POST request to the server endpoint for table scanning
      const response = await axios.post<{ table: DataResponse[] }>(
        "http://localhost:3001/scan-url",
        { url }
      );
      // Check if the response contains valid table data
      if (response?.data?.table?.length > 0) {
        // Extract table labels and data from the response and update state
        setTableLabel(response.data.table.map((i: DataResponse) => i.name));
        setTableData(response.data.table.map((i: DataResponse) => i.value));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error);
      }
    }
  };

  // Return the hook interface with functions and state variables
  return {
    getTableNumeric,
    error,
    tableLabel,
    tableData,
  };
};

export default useScan;
