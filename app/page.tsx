"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  RefreshCw,
  Download,
  AlertTriangle,
} from "lucide-react";
import CodeEditor from "@/components/code-editor";
import QuestionForm from "@/components/question-form";
import { saveResponse, getAllResponses } from "@/lib/actions";
import { fetchCodeSnippets } from "@/lib/code-snippets";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [snippets, setSnippets] = useState<string[]>([]);
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [formData, setFormData] = useState({
    vulnerability: "",
    exploitability: "",
    compilationStatus: "",
    suitableForTraining: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [repoUrl, setRepoUrl] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    loadSnippets();
  });

  const loadSnippets = async () => {
    try {
      setLoading(true);
      setError(null);
      const snippetList = await fetchCodeSnippets();

      setSnippets(snippetList);
      if (snippetList.length > 0) {
        await loadSnippet(snippetList[0]);
      } else {
        setLoading(false);
        toast({
          title: "No snippets found",
          description:
            "Please add code snippets to the public/code-snippets directory.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to load code snippets:", error);
      setError(
        "Failed to load code snippets. Please check the console for details."
      );
      toast({
        title: "Error",
        description: "Failed to load code snippets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSnippet = async (path: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/code-snippets?path=${encodeURIComponent(path)}`
      );

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ||
            `Failed to fetch code snippet (${response.status})`
        );
      }

      const data = await response.json();
      setCode(data.content);
      setFileName(path.split("/").pop() || "");

      // Reset form data for new snippet
      setFormData({
        vulnerability: "",
        exploitability: "",
        compilationStatus: "",
        suitableForTraining: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error loading snippet:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error loading snippet"
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load code snippet. Please try again.",
        variant: "destructive",
      });

      // Keep existing code if there was an error loading the new snippet
      if (!code) {
        setCode("// Error loading code snippet");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentSnippetIndex > 0) {
      const newIndex = currentSnippetIndex - 1;
      setCurrentSnippetIndex(newIndex);
      loadSnippet(snippets[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentSnippetIndex < snippets.length - 1) {
      const newIndex = currentSnippetIndex + 1;
      setCurrentSnippetIndex(newIndex);
      loadSnippet(snippets[newIndex]);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCurrentAssessment = async () => {
    try {
      setSaveLoading(true);
      setError(null);

      // Validation
      if (!fileName) {
        throw new Error("No file loaded to assess");
      }

      if (!formData.vulnerability) {
        throw new Error("Please select a vulnerability level");
      }

      if (!formData.exploitability) {
        throw new Error("Please select an exploitability level");
      }

      await saveResponse({
        fileName,
        ...formData,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Your assessment has been saved.",
      });
      return true;
    } catch (error) {
      console.error("Error saving assessment:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unknown error saving assessment"
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save your assessment. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSubmit = async () => {
    const saved = await handleSaveCurrentAssessment();
    if (saved) {
      handleNext();
    }
  };

  const handleRepoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feature not available",
      description:
        "GitHub repository loading is not available in this version. Please add code snippets directly to the public/code-snippets directory.",
    });
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloadLoading(true);
      setError(null);

      const responses = await getAllResponses();

      if (responses.length === 0) {
        toast({
          title: "No data to download",
          description: "You haven't saved any assessments yet.",
          variant: "destructive",
        });
        setDownloadLoading(false);
        return;
      }

      // Use the API endpoint for downloading instead of client-side processing
      const response = await fetch("/api/download-csv");

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `Failed to download CSV (${response.status})`
        );
      }

      // Get the CSV content from the response
      const csvContent = await response.text();

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `security-assessments-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up to avoid memory leaks

      toast({
        title: "Download complete",
        description:
          "Your security assessments have been downloaded as a CSV file.",
      });
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error downloading CSV"
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to download CSV file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-3 px-2 md:px-3">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">Code Security Review</h1>
        <Button
          onClick={handleDownloadCSV}
          disabled={downloadLoading}
          size="sm"
        >
          {downloadLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Download className="h-4 w-4 mr-1" />
          )}
          Download CSV
        </Button>
      </div>

      <Card className="mb-3">
        <CardContent className="p-3">
          <form onSubmit={handleRepoSubmit} className="flex gap-2">
            <Input
              placeholder="GitHub repository URL (e.g., https://github.com/username/repo)"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Load from GitHub"
              )}
            </Button>
          </form>
          <div className="mt-2 text-sm text-muted-foreground">
            <p>
              Note: GitHub loading is not available in this version. Please add
              code snippets to the <code>public/code-snippets</code> directory.
            </p>
          </div>
        </CardContent>
      </Card>
      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <Card className="col-span-1 lg:col-span-3 h-[calc(100vh-220px)] flex flex-col">
          <CardHeader className="py-2 px-3">
            <CardTitle className="flex justify-between items-center text-lg">
              <span>Code Editor</span>
              <span className="text-sm font-normal text-muted-foreground">
                {fileName}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden p-0">
            <CodeEditor
              code={code}
              language={fileName.split(".").pop() || "javascript"}
            />
          </CardContent>
          <CardFooter className="border-t py-2 px-3">
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentSnippetIndex === 0 || loading}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                {currentSnippetIndex + 1} of {snippets.length}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={
                  currentSnippetIndex === snippets.length - 1 || loading
                }
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="col-span-1 h-[calc(100vh-220px)] flex flex-col">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-lg">Security Assessment</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto py-2 px-3">
            <QuestionForm formData={formData} onChange={handleFormChange} />
          </CardContent>
          <CardFooter className="border-t py-2 px-3">
            <div className="flex justify-end w-full">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={loading || saveLoading}
              >
                {saveLoading ? (
                  <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-1 h-4 w-4" />
                )}
                Submit & Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
