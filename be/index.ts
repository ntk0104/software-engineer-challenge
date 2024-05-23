import express, { Request, Response } from "express";
import axios from "axios";
import cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());
const port = 3001;

app.use(express.json());

// Type definitions for the extracted table data
interface TableRow {
  [key: string]: string;
}

/**
 * Extracts the first number in meters from the input string.
 *
 * This function searches for the first occurrence of a number followed by the character 'm'
 * (representing meters) in the input string. The number can be an integer or a decimal.
 * If a valid number followed by 'm' is found, it returns the number as a string.
 * If no such pattern is found, the function returns undefined.
 *
 * @param {string|null|undefined} input - The input string to search. It can also be null or undefined.
 * @returns {string|undefined} - The extracted number as a string, or undefined if no valid pattern is found.
 *
 * @example
 * // Returns '12.5'
 * extractMeters("The length is 12.5 m");
 */
function extractMeters(input: string | null | undefined): string | undefined {
  if (input === null || input === undefined) {
    return undefined;
  }
  const regex = /(\d+(\.\d+)?)\s*m/;
  const match = input.match(regex);
  return match ? match[1] : undefined;
}

/**
 * Finds numeric properties in the array of objects.
 * This function takes an array of objects as input and identifies properties
 * (keys) that contain numeric values across all objects. It utilizes the
 * extractMeters function to determine if a property value is numeric.
 * If a property contains numeric values in all objects, it is considered a
 * numeric property and included in the result.
 *
 * @param {Array<Object>} data - An array of objects to search for numeric properties.
 * @returns {Array<string>} - An array containing the names of numeric properties.
 *
 * @example
 * // Returns ['height', 'width']
 * findNumericProperties([{ height: '12m', width: '7m' }, { height: '8m', width: '10m' }]);
 */
function findNumericProperties(data: TableRow[]): string[] {
  if (data.length === 0) {
    return [];
  }
  // get all columns of table
  const keys = Object.keys(data[0]);
  const numericProperties = keys.filter((key) => {
    return data.every((obj) => !isNaN(Number(extractMeters(obj[key]))));
  });
  return numericProperties;
}

/**
 * Concatenates non-numeric properties and extracts the first numeric property.
 *
 * This function takes an array of objects and processes each object to:
 * 1. Identify the first property that contains a numeric value using the `extractMeters` function.
 * 2. Concatenate the values of the other properties into a single string.
 * It returns an array of objects where each object has two properties:
 * - `value`: The numeric value extracted from the first numeric property.
 * - `name`: A string concatenation of all other property values.
 *
 * @param {Array<Object>} data - An array of objects to process.
 * @returns {Array<Object>} - An array of objects with `value` and `name` properties.
 *
 * @example
 * // Returns [{ value: 12, name: 'height width' }]
 * concatPropertiesWithNumber([{ height: '10m', width: '15' }]);
 */
function concatPropertiesWithNumber(
  data: TableRow[]
): { value: number | undefined; name: string }[] {
  return data.map((obj) => {
    let numberProp: string | null = null;
    const otherProps: string[] = [];
    Object.keys(obj).forEach((key) => {
      if (
        obj[key] != null &&
        !isNaN(Number(extractMeters(obj[key]))) &&
        numberProp === null
      ) {
        numberProp = obj[key];
      } else {
        otherProps.push(obj[key]);
      }
    });
    // I assumed that the label would be the first column of the other columns. In our example, this is the name of the athlete because we do not have the logic to determine which column it belongs to.
    const concatenated = otherProps[0]
    // const concatenated = otherProps.join(" ");
    return { value: Number(extractMeters(numberProp)), name: concatenated };
  });
}
app.post("/scan-url", async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== "object" || !("url" in req.body)) {
    return res.status(400).json({ error: "URL is required" });
  }

  const { url } = req.body as { url: string };
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  try {
    // Fetch the HTML content of the provided URL using axios
    const response = await axios.get(url);
    const html = response.data;
    // Load the HTML content into cheerio for parsing
    const $ = cheerio.load(html);
    // Select all tables in the HTML
    const tables = $("table");
    // Initialize arrays to hold the converted tables and the final result table
    let convertedTable: Array<Record<string, string>>[] = [];
    let resultTable: Record<string, string>[] = [];
    // Iterate over each table found in the HTML
    tables.each((i, table) => {
      // Find all header cells (th) and rows (tr) in the current table
      const headRows = $(table).find("th");
      const rows = $(table).find("tr");
      // Extract and trim text content of each header cell
      const headerTable: string[] = headRows
        .map((j, hr) => {
          return $(hr).text().trim();
        })
        .get();
      // Initialize an array to hold row data
      let tableData: Array<Record<string, string>> = [];
      // Iterate over each row to extract cell data
      rows.each((j, row) => {
        const cells = $(row).find("td");
        let rowData: Record<string, string> = {};
        // Iterate over each cell in the row to extract and trim text content
        cells.each((k, cell) => {
          const cellText = $(cell).text().trim();
          // Assign cell text to the corresponding header key in rowData
          rowData[headerTable[k]] = cellText;
        });
        // Only push non-empty rows
        if (Object.keys(rowData).length > 0) {
          tableData.push(rowData);
        }
      });
      // Filter out empty rows (null or empty objects)
      let notNullTable = tableData.filter(
        (d) => d !== null && JSON.stringify(d) !== "{}"
      );
      // If the filtered table has data, add it to convertedTable
      if (notNullTable.length > 0) {
        convertedTable.push(notNullTable);
      }
    });
    // If there are any converted tables
    if (convertedTable.length > 0) {
      convertedTable.some((table) => {
        // Check if the table has numeric properties
        if (findNumericProperties(table).length > 0) {
          // If a table with numeric properties is found, set it as the result table
          resultTable = table;
          return true;
        }
        return false;
      });
      // Respond with the result table after processing it with concatPropertiesWithNumber
      return res.json({ table: concatPropertiesWithNumber(resultTable) });
    } else {
      return res.json({ message: "No numeric column found in any table." });
    }
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({ error: "Error fetching the URL" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
