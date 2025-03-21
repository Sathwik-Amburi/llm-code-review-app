"use server"

import fs from "fs"
import path from "path"
import { promises as fsPromises } from "fs"

interface ResponseData {
  fileName: string
  vulnerability: string
  exploitability: string
  compilationStatus: string
  suitableForTraining: string
  notes: string
  timestamp: string
}

// Path to the CSV file where responses are stored
const CSV_PATH = path.join(process.cwd(), "data", "responses.csv")

// Update the saveResponse function with better error handling, type safety, and validation
export async function saveResponse(data: ResponseData) {
  try {
    // Validate input data
    if (!data.fileName || typeof data.fileName !== "string") {
      throw new Error("Invalid file name provided")
    }

    const csvDir = path.join(process.cwd(), "data")

    // Create directory if it doesn't exist
    if (!fs.existsSync(csvDir)) {
      await fsPromises.mkdir(csvDir, { recursive: true })
    }

    // Check if file exists to determine if we need to add headers
    const fileExists = fs.existsSync(CSV_PATH)

    // Format data for CSV
    const headers = [
      "fileName",
      "vulnerability",
      "exploitability",
      "compilationStatus",
      "suitableForTraining",
      "notes",
      "timestamp",
    ]

    // Escape any commas or quotes in the notes field
    const escapedNotes = data.notes?.replace(/"/g, '""') || ""

    const values = [
      data.fileName,
      data.vulnerability || "",
      data.exploitability || "",
      data.compilationStatus || "",
      data.suitableForTraining || "",
      `"${escapedNotes}"`,
      data.timestamp || new Date().toISOString(),
    ]

    let csvContent = ""

    if (!fileExists) {
      // Add headers if file doesn't exist
      csvContent = headers.join(",") + "\n"
    }

    // Add the data row
    csvContent += values.join(",") + "\n"

    // Append to file
    await fsPromises.appendFile(CSV_PATH, csvContent)

    return { success: true }
  } catch (error) {
    console.error("Error saving response:", error)
    throw new Error(`Failed to save response: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Update getAllResponses with better error handling
export async function getAllResponses(): Promise<ResponseData[]> {
  try {
    // Check if the file exists
    if (!fs.existsSync(CSV_PATH)) {
      return []
    }

    // Read the CSV file
    const csvContent = await fsPromises.readFile(CSV_PATH, "utf-8")
    const lines = csvContent.split("\n").filter((line) => line.trim() !== "")

    // If file is empty or only has headers, return empty array
    if (lines.length <= 1) {
      return []
    }

    // Skip the header line
    const dataLines = lines.slice(1)

    // Parse each line into a response object
    const responses: ResponseData[] = []

    for (const line of dataLines) {
      try {
        // Handle quoted fields (especially for notes that might contain commas)
        const values: string[] = []
        let currentValue = ""
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]

          if (char === '"') {
            // Toggle quote state
            inQuotes = !inQuotes
            // Add the quote to the value if it's not a closing quote
            if (inQuotes || (i > 0 && line[i - 1] === '"')) {
              currentValue += char
            }
          } else if (char === "," && !inQuotes) {
            // End of field
            values.push(currentValue)
            currentValue = ""
          } else {
            // Add character to current value
            currentValue += char
          }
        }

        // Add the last value
        values.push(currentValue)

        // Create response object
        if (values.length >= 7) {
          responses.push({
            fileName: values[0] || "",
            vulnerability: values[1] || "",
            exploitability: values[2] || "",
            compilationStatus: values[3] || "",
            suitableForTraining: values[4] || "",
            notes: values[5].replace(/^"|"$/g, "").replace(/""/g, '"'), // Remove surrounding quotes and replace double quotes
            timestamp: values[6] || new Date().toISOString(),
          })
        }
      } catch (parseError) {
        console.error("Error parsing CSV line:", parseError, "Line:", line)
        // Continue with next line instead of failing completely
        continue
      }
    }

    return responses
  } catch (error) {
    console.error("Error getting responses:", error)
    throw new Error(`Failed to get responses: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

