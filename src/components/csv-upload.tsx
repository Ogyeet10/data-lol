"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CSVUploadProps {
  onFileUpload: (file: File) => void;
}

export function CSVUpload({ onFileUpload }: CSVUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "text/csv") {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  return (
    <Card className="w-full shadow-sm border-muted-foreground/10">
      <CardHeader className="text-center">
        <CardTitle>Upload Your CSV File</CardTitle>
        <CardDescription>
          Drag and drop your CSV file here, or click to browse. Maximum file size: 2GB
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer",
            "hover:border-primary/50 hover:bg-primary/5",
            isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
              isDragActive ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              {isDragActive ? (
                <Upload className="w-8 h-8" />
              ) : (
                <FileText className="w-8 h-8" />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? "Drop your CSV file here" : "Upload CSV File"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports files up to 2GB with service request data
              </p>
            </div>

            <Button onClick={open} variant={isDragActive ? "secondary" : "default"}>
              Choose File
            </Button>
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">CSV Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li><strong>CREATED_DATE</strong> - Date when the service request was created</li>
                <li><strong>CLOSED_DATE</strong> - Date when the service request was closed</li>
                <li><strong>SR_TYPE</strong> - Type of service request</li>
                <li>Dates should be in ISO format (YYYY-MM-DD) or MM/DD/YYYY format</li>
                <li>File must be in CSV format with headers</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}