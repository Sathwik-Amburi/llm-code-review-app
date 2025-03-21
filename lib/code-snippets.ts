"use server"

import fs from "fs"
import path from "path"
import { promises as fsPromises } from "fs"

// Define the directory where code snippets are stored
const SNIPPETS_DIR = path.join(process.cwd(), "public", "code-snippets")

// Sample code snippets to create if none exist
const SAMPLE_SNIPPETS = {
  "vulnerable.js": `// JavaScript example with eval() vulnerability
function processUserInput(userInput) {
  // SECURITY ISSUE: Using eval on user input is dangerous
  // as it can lead to code injection attacks
  return eval(userInput);
}

// Example usage
const userInput = "console.log('User input'); alert('XSS attack')";
const result = processUserInput(userInput);
console.log(result);`,

  "sql_injection.py": `# Python example with SQL injection vulnerability
import sqlite3

def get_user(username):
    # SECURITY ISSUE: String concatenation in SQL queries
    # can lead to SQL injection attacks
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Vulnerable code
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    cursor.execute(query)
    
    return cursor.fetchone()

# Example usage
user_input = "admin' OR '1'='1"  # Malicious input
user = get_user(user_input)
print(user)`,

  "buffer_overflow.c": `// C example with buffer overflow vulnerability
#include <stdio.h>
#include <string.h>

void processInput(const char* input) {
    // SECURITY ISSUE: Fixed-size buffer with unchecked strcpy
    // can lead to buffer overflow attacks
    char buffer[10];
    
    // Vulnerable code
    strcpy(buffer, input);  // No bounds checking
    
    printf("Processed: %s\\n", buffer);
}

int main() {
    // Example usage with malicious input
    const char* userInput = "This string is way too long and will overflow the buffer";
    processInput(userInput);
    
    return 0;
}`,
}

// Add better error handling and validation in fetchCodeSnippets
export async function fetchCodeSnippets() {
  try {
    // Create the directory if it doesn't exist
    if (!fs.existsSync(SNIPPETS_DIR)) {
      await fsPromises.mkdir(SNIPPETS_DIR, { recursive: true })

      // Create sample snippets if directory is empty
      for (const [filename, content] of Object.entries(SAMPLE_SNIPPETS)) {
        await fsPromises.writeFile(path.join(SNIPPETS_DIR, filename), content)
      }
    } else {
      // Check if directory is empty and add samples if needed
      const files = await fsPromises.readdir(SNIPPETS_DIR)
      if (files.length === 0) {
        for (const [filename, content] of Object.entries(SAMPLE_SNIPPETS)) {
          await fsPromises.writeFile(path.join(SNIPPETS_DIR, filename), content)
        }
      }
    }

    // Get all files recursively with timeout protection
    let snippets: string[] = []
    try {
      // Add a timeout for file operations to prevent hanging
      snippets = (await Promise.race([
        getAllFiles(SNIPPETS_DIR),
        new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error("File scanning timed out")), 10000)),
      ])) as string[]
    } catch (timeoutError) {
      console.error("Error in file scanning:", timeoutError)
      // Return what we have so far or an empty array
      return []
    }

    // Return relative paths
    return snippets.map((file) => path.relative(SNIPPETS_DIR, file))
  } catch (error) {
    console.error("Error fetching code snippets:", error)
    throw new Error(`Failed to fetch code snippets: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Improved getAllFiles function with better error handling
async function getAllFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fsPromises.readdir(dir, { withFileTypes: true })

    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name)
        try {
          return entry.isDirectory() ? getAllFiles(fullPath) : fullPath
        } catch (error) {
          console.error(`Error processing ${fullPath}:`, error)
          // Return empty array for this entry instead of failing completely
          return []
        }
      }),
    )

    return files.flat()
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
    return []
  }
}

