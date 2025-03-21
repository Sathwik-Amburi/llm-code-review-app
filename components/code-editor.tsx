"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Define the editor type using the Monaco type
type MonacoEditor = Parameters<OnMount>[0];

interface CodeEditorProps {
  code: string;
  language?: string;
}

export default function CodeEditor({
  code,
  language = "javascript",
}: CodeEditorProps) {
  const editorRef = useRef<MonacoEditor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the onMount callback to prevent unnecessary re-renders
  const handleEditorDidMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      setIsEditorReady(true);
      console.log("isEditorReady", isEditorReady);

      try {
        // Set editor options
        editor.updateOptions({
          readOnly: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          wordWrap: "on",
          wrappingIndent: "same",
          automaticLayout: true,
          renderLineHighlight: "all",
          highlightActiveIndentation: true,
          tabSize: 2,
          scrollbar: {
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12,
          },
          suggest: {
            showIcons: true,
          },
        });

        // Focus on editor content
        editor.revealLinesInCenter(1, 10);
      } catch (err) {
        console.error("Error configuring editor:", err);
        setError(
          "Failed to configure code editor. Please try refreshing the page."
        );
      }
    },
    [isEditorReady]
  );

  // Handle editor loading errors
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      // Check if the error is related to Monaco editor
      if (
        event.message.includes("monaco") ||
        event.filename?.includes("monaco")
      ) {
        console.error("Monaco editor error:", event);
        setError("Failed to load code editor. Please try refreshing the page.");
      }
    };

    // Add global error handler
    window.addEventListener("error", handleWindowError);

    // Cleanup
    return () => {
      window.removeEventListener("error", handleWindowError);
    };
  }, []);

  // Map file extensions to Monaco language identifiers
  const getLanguageFromExtension = useCallback((ext: string): string => {
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      c: "c",
      cpp: "cpp",
      h: "cpp",
      cs: "csharp",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      swift: "swift",
      kt: "kotlin",
      sql: "sql",
      html: "html",
      css: "css",
      json: "json",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
      md: "markdown",
      sh: "shell",
      bash: "shell",
    };

    return languageMap[ext.toLowerCase()] || "plaintext";
  }, []);

  // Handle editor loading state
  const handleEditorBeforeMount = useCallback(() => {
    // Reset error state when editor starts loading
    setError(null);
  }, []);

  return (
    <div className="h-full w-full relative">
      {error && (
        <Alert
          variant="destructive"
          className="absolute top-0 left-0 right-0 z-10 m-4"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Editor
        height="100%"
        language={getLanguageFromExtension(language)}
        value={code}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        beforeMount={handleEditorBeforeMount}
        loading={<Skeleton className="h-full w-full" />}
        options={{
          readOnly: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          wordWrap: "on",
          wrappingIndent: "same",
        }}
      />
    </div>
  );
}
