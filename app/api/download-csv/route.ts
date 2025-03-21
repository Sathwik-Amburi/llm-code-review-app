import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { promises as fsPromises } from "fs"
import { rateLimit } from "@/lib/rate-limit"

// Path to the CSV file
const CSV_PATH = path.join(process.cwd(), "data", "responses.csv")

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const limiter = await rateLimit(request)
    if (!limiter.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: limiter.headers })
    }

    // Check if the file exists
    if (!fs.existsSync(CSV_PATH)) {
      return NextResponse.json({ error: "No data available" }, { status: 404 })
    }

    // Read the CSV file
    const csvContent = await fsPromises.readFile(CSV_PATH, "utf-8")

    // Generate a secure filename
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `security-assessments-${timestamp}.csv`

    // Return the CSV content with appropriate headers
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error downloading CSV:", error)
    return NextResponse.json({ error: "Failed to download CSV" }, { status: 500 })
  }
}

