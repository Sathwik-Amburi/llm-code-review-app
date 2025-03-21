import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { promises as fsPromises } from "fs"
import { rateLimit } from "@/lib/rate-limit"

// Define the directory where code snippets are stored
const SNIPPETS_DIR = path.join(process.cwd(), "public", "code-snippets")

// Maximum file size to read (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const limiter = await rateLimit(request)
    if (!limiter.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: limiter.headers })
    }

    const searchParams = request.nextUrl.searchParams
    const snippetPath = searchParams.get("path")

    if (!snippetPath) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 })
    }

    // Sanitize the path to prevent path traversal attacks
    const sanitizedPath = snippetPath.replace(/\.\./g, "").replace(/[/\\]{2,}/g, "/")

    // Ensure the path is within the snippets directory to prevent directory traversal
    const fullPath = path.join(SNIPPETS_DIR, sanitizedPath)
    if (!fullPath.startsWith(SNIPPETS_DIR)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Check file size before reading
    const stats = await fsPromises.stat(fullPath)
    if (stats.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 })
    }

    // Read file content
    const content = await fsPromises.readFile(fullPath, "utf-8")

    // Return response with cache headers
    return NextResponse.json(
      { content },
      {
        headers: {
          "Cache-Control": "public, max-age=300",
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching code snippet:", error)
    return NextResponse.json({ error: "Failed to fetch code snippet" }, { status: 500 })
  }
}

