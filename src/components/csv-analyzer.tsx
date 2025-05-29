"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, Download, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Papa from "papaparse";
import { format, differenceInDays, parseISO } from "date-fns";
import { toast } from "sonner";
import { CSVUpload } from "./csv-upload";
import { AnalysisChart } from "./analysis-chart";
import { StatisticsDisplay } from "./statistics-display";
import { HourAnalysisChart } from "./hour-analysis-chart";
import { ZipAnalysisChart } from "./zip-analysis-chart";
import { CSVRow, ProcessedData, HourData, AnalysisResults, ZipData } from "../lib/types";

export function CSVAnalyzer() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [isTabSwitching, setIsTabSwitching] = useState(false);

  // Generate simple hash from file content
  const generateFileHash = async (file: File): Promise<string> => {
    const text = await file.text();
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `${file.name}_${file.size}_${Math.abs(hash)}`;
  };

  // Cache management
  const getCachedData = (fileHash: string): AnalysisResults | null => {
    try {
      const cached = localStorage.getItem(`csv_analysis_${fileHash}`);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const cacheDate = new Date(data.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      if (cacheDate < weekAgo) {
        localStorage.removeItem(`csv_analysis_${fileHash}`);
        return null;
      }
      
      // Parse dates back from strings
      data.results.data = data.results.data.map((item: any) => ({
        ...item,
        createdDate: new Date(item.createdDate),
        closedDate: item.closedDate ? new Date(item.closedDate) : null,
      }));
      
      return data.results;
    } catch (e) {
      return null;
    }
  };

  const setCachedData = (fileHash: string, results: AnalysisResults) => {
    try {
      const cacheData = {
        timestamp: new Date().toISOString(),
        results: results,
      };
      localStorage.setItem(`csv_analysis_${fileHash}`, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Failed to cache data:', e);
    }
  };

  const processCSVData = useCallback(async (file: File): Promise<AnalysisResults> => {
    return new Promise(async (resolve, reject) => {
      const validData: ProcessedData[] = [];
      const serviceTypes = new Set<string>();
      const hourCounts: { [hour: number]: number } = {};
      let chunkCount = 0;
      const zipCodeData: { [zip: string]: { dayDiffs: number[], count: number } } = {};
      
      // Generate file hash
      const fileHash = await generateFileHash(file);

      const parseDate = (dateStr: string): Date | null => {
        if (!dateStr || dateStr.trim() === '') return null;
        
        // Try various date formats
        const formats: (() => Date | null)[] = [
          // ISO format variations
          () => {
            const date = parseISO(dateStr);
            return !isNaN(date.getTime()) ? date : null;
          },
          // MM/DD/YYYY HH:MM:SS AM/PM format
          () => {
            const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2}):(\d{2}):(\d{2})\s(AM|PM)$/i);
            if (match) {
              const [, month, day, year, hourStr, minute, second, ampm] = match;
              let hour = parseInt(hourStr);
              if (ampm.toUpperCase() === 'PM' && hour < 12) {
                hour += 12;
              } else if (ampm.toUpperCase() === 'AM' && hour === 12) { // Midnight case
                hour = 0;
              }
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, parseInt(minute), parseInt(second));
              return !isNaN(date.getTime()) ? date : null;
            }
            return null;
          },
          // MM/DD/YYYY format (without time)
          () => {
            const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (match) {
              const [, month, day, year] = match;
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              return !isNaN(date.getTime()) ? date : null;
            }
            return null;
          },
          // MM-DD-YYYY format
          () => {
            const match = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
            if (match) {
              const [, month, day, year] = match;
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              return !isNaN(date.getTime()) ? date : null;
            }
            return null;
          },
          // Try native Date parsing as fallback
          () => {
            const date = new Date(dateStr);
            return !isNaN(date.getTime()) ? date : null;
          }
        ];

        for (const parseFunc of formats) {
          try {
            const result = parseFunc();
            if (result && !isNaN(result.getTime())) {
              return result;
            }
          } catch (e) {
            // Continue to next format
          }
        }
        
        return null;
      };

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        chunk: (chunk) => {
          try {
            chunkCount++;
            const rows = chunk.data as CSVRow[];
            
            // Safely filter rows
            const validRows = rows.filter(row => 
              row && typeof row === 'object' && Object.keys(row).length > 0
            );
            
            for (const row of validRows) {
              if (row.CREATED_DATE && row.SR_TYPE) {
                try {
                  const createdDate = parseDate(row.CREATED_DATE);
                  
                  if (createdDate) {
                    const createdHour = createdDate.getHours();
                    hourCounts[createdHour] = (hourCounts[createdHour] || 0) + 1;
                    
                    // Only process date diff if we have both dates
                    let daysDiff = 0;
                    let closedDate: Date | null = null;
                    
                    if (row.CLOSED_DATE) {
                      closedDate = parseDate(row.CLOSED_DATE);
                      if (closedDate) {
                        daysDiff = differenceInDays(closedDate, createdDate);
                      }
                    }
                    
                    const zipCode = row.ZIP_CODE ? row.ZIP_CODE.trim() : 'N/A';
                    
                    if (daysDiff >= 0 || !row.CLOSED_DATE) {
                      validData.push({
                        srType: row.SR_TYPE,
                        daysDiff,
                        createdDate,
                        closedDate,
                        createdHour,
                        zipCode,
                      });
                      serviceTypes.add(row.SR_TYPE);

                      // Aggregate data for ZIP code analysis
                      if (!zipCodeData[zipCode]) {
                        zipCodeData[zipCode] = { dayDiffs: [], count: 0 };
                      }
                      if (closedDate) { // Only include in ZIP analysis if there's a closed date for dayDiff calculation
                        zipCodeData[zipCode].dayDiffs.push(daysDiff);
                      }
                      zipCodeData[zipCode].count++;
                    }
                  }
                } catch (e) {
                  console.warn('Error processing row:', e);
                }
              }
            }
            
            // Simple progress based on chunk count (not precise but safe)
            const estimatedProgress = Math.min(chunkCount * 10, 90);
            setProgress(estimatedProgress);
          } catch (e) {
            console.error('Error in chunk processing:', e);
          }
        },
        complete: () => {
          try {
            console.log(`Processing complete. Valid data: ${validData.length}`);
            setProgress(100);
            
            if (validData.length === 0) {
              const errMsg = `No valid data found. Please ensure your CSV has CREATED_DATE, CLOSED_DATE, and SR_TYPE columns with valid dates.`;
              reject(new Error(errMsg));
              return;
            }

            // Calculate statistics safely (only for records with both dates)
            const daysDiffs = validData
              .filter(d => d.closedDate !== null)
              .map(d => d.daysDiff)
              .sort((a, b) => a - b);
              
            const mean = daysDiffs.length > 0 
              ? daysDiffs.reduce((sum, val) => sum + val, 0) / daysDiffs.length 
              : 0;
            const median = daysDiffs.length > 0 
              ? (daysDiffs.length % 2 === 0 
                ? (daysDiffs[daysDiffs.length / 2 - 1] + daysDiffs[daysDiffs.length / 2]) / 2
                : daysDiffs[Math.floor(daysDiffs.length / 2)])
              : 0;

            // Create hour data array
            const hourData: HourData[] = [];
            for (let hour = 0; hour < 24; hour++) {
              hourData.push({
                hour,
                count: hourCounts[hour] || 0,
              });
            }

            // Create ZIP data array
            const zipAnalysisData: ZipData[] = Object.entries(zipCodeData).map(([zip, data]) => {
              const sortedDiffs = [...data.dayDiffs].sort((a,b) => a - b);
              const zipMean = sortedDiffs.length > 0 ? sortedDiffs.reduce((sum, val) => sum + val, 0) / sortedDiffs.length : 0;
              const zipMedian = sortedDiffs.length > 0 ? (sortedDiffs.length % 2 === 0 ? (sortedDiffs[sortedDiffs.length / 2 - 1] + sortedDiffs[sortedDiffs.length / 2]) / 2 : sortedDiffs[Math.floor(sortedDiffs.length / 2)]) : 0;
              return {
                zipCode: zip,
                mean: Math.round(zipMean * 100) / 100,
                median: Math.round(zipMedian * 100) / 100,
                count: data.count
              };
            }).sort((a,b) => b.count - a.count); // Sort by count descending

            resolve({
              data: validData,
              hourData,
              zipData: zipAnalysisData,
              statistics: {
                mean: Math.round(mean * 100) / 100,
                median: Math.round(median * 100) / 100,
                total: validData.length,
              },
              serviceTypes: Array.from(serviceTypes).sort(),
              fileHash,
            });
          } catch (e) {
            console.error('Error in complete handler:', e);
            reject(new Error('Error finalizing data processing'));
          }
        },
        error: (error) => {
          console.error('Papa Parse error:', error);
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        },
      });
    });
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    console.log('Starting file upload:', file.name, 'Size:', file.size);
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults(null);

    // Basic file validation
    if (!file) {
      setError("No file selected");
      setIsProcessing(false);
      return;
    }

    if (file.size === 0) {
      setError("File is empty");
      setIsProcessing(false);
      return;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB
      setError("File is too large (max 2GB)");
      toast.error("File is too large (max 2GB)");
      setIsProcessing(false);
      return;
    }

    if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
      setError("Please select a CSV file");
      setIsProcessing(false);
      return;
    }

    try {
      // Check cache first
      const fileHash = await generateFileHash(file);
      const cachedResults = getCachedData(fileHash);
      
      if (cachedResults) {
        console.log('Using cached data for file:', file.name);
        setProgress(100);
        setResults(cachedResults);
        setSelectedServiceType("all");
        setIsProcessing(false);
        return;
      }

      // Process file if not cached
      const analysisResults = await processCSVData(file);
      console.log('Analysis complete:', analysisResults);
      
      // Cache the results
      setCachedData(fileHash, analysisResults);
      
      setResults(analysisResults);
      setSelectedServiceType("all");
    } catch (err: any) {
      console.error("Error processing file:", err);
      setError(err.message || "An unknown error occurred during processing.");
      toast.error(err.message || "An unknown error occurred during processing.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [processCSVData, generateFileHash, getCachedData, setCachedData]);

  const getFilteredData = useCallback(() => {
    try {
      if (!results || !results.data) return [];
      if (selectedServiceType === "all") return results.data;
      return results.data.filter(d => d && d.srType === selectedServiceType);
    } catch (error) {
      console.error('Error filtering data:', error);
      return [];
    }
  }, [results, selectedServiceType]);

  const getFilteredStatistics = useCallback(() => {
    try {
      const filteredData = getFilteredData();
      if (!filteredData || filteredData.length === 0) return { mean: 0, median: 0, total: 0 };

      const daysDiffs = filteredData
        .map(d => d.daysDiff)
        .filter(d => typeof d === 'number' && !isNaN(d))
        .sort((a, b) => a - b);
        
      if (daysDiffs.length === 0) return { mean: 0, median: 0, total: 0 };

      const mean = daysDiffs.reduce((sum, val) => sum + val, 0) / daysDiffs.length;
      const median = daysDiffs.length % 2 === 0 
        ? (daysDiffs[daysDiffs.length / 2 - 1] + daysDiffs[daysDiffs.length / 2]) / 2
        : daysDiffs[Math.floor(daysDiffs.length / 2)];

      return {
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        total: filteredData.length,
      };
    } catch (error) {
      console.error('Error calculating filtered statistics:', error);
      return { mean: 0, median: 0, total: 0 };
    }
  }, [getFilteredData]);

  const getFilteredZipData = useCallback(() => {
    try {
      if (!results || !results.zipData) return [];
      if (selectedServiceType === "all") return results.zipData;
      
      // Get filtered data based on service type
      const filteredData = getFilteredData();
      
      // Aggregate ZIP data from filtered records
      const zipCodeData: { [zip: string]: { dayDiffs: number[], count: number } } = {};
      
      for (const record of filteredData) {
        const zipCode = record.zipCode || 'N/A';
        if (!zipCodeData[zipCode]) {
          zipCodeData[zipCode] = { dayDiffs: [], count: 0 };
        }
        if (record.closedDate) { // Only include records with closed dates for dayDiff calculation
          zipCodeData[zipCode].dayDiffs.push(record.daysDiff);
        }
        zipCodeData[zipCode].count++;
      }
      
      // Create filtered ZIP data array
      const filteredZipData: ZipData[] = Object.entries(zipCodeData).map(([zip, data]) => {
        const sortedDiffs = [...data.dayDiffs].sort((a,b) => a - b);
        const zipMean = sortedDiffs.length > 0 ? sortedDiffs.reduce((sum, val) => sum + val, 0) / sortedDiffs.length : 0;
        const zipMedian = sortedDiffs.length > 0 ? (sortedDiffs.length % 2 === 0 ? (sortedDiffs[sortedDiffs.length / 2 - 1] + sortedDiffs[sortedDiffs.length / 2]) / 2 : sortedDiffs[Math.floor(sortedDiffs.length / 2)]) : 0;
        return {
          zipCode: zip,
          mean: Math.round(zipMean * 100) / 100,
          median: Math.round(zipMedian * 100) / 100,
          count: data.count
        };
      }).sort((a,b) => b.count - a.count); // Sort by count descending
      
      return filteredZipData;
    } catch (error) {
      console.error('Error calculating filtered ZIP data:', error);
      return [];
    }
  }, [results, selectedServiceType, getFilteredData]);

  if (!results && !isProcessing) {
    return <CSVUpload onFileUpload={handleFileUpload} />;
  }

  return (
    <div className="space-y-6">
      {isProcessing && (
        <Card className="shadow-sm border-muted-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing CSV File
            </CardTitle>
            <CardDescription>
              Analyzing your data and calculating date differences...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-destructive">Error Processing File</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null);
                setResults(null);
              }}
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {results && (
        <>
          {/* Service Type Filter */}
          <Card className="shadow-sm border-muted-foreground/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                Found {results.statistics.total} valid records across {results.serviceTypes.length} service types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <label htmlFor="service-type" className="text-sm font-medium">
                  Filter by Service Type:
                </label>
                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Service Types</SelectItem>
                    {results.serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary">
                  {getFilteredData().length} records
                </Badge>
              </div>

              <Tabs defaultValue="datediff" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="datediff">Date Difference</TabsTrigger>
                  <TabsTrigger value="hours">Hour Analysis</TabsTrigger>
                  <TabsTrigger value="zip">ZIP Analysis</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="datediff" className="space-y-4">
                  <AnalysisChart 
                    data={getFilteredData()} 
                    title={selectedServiceType === "all" ? "All Service Types" : selectedServiceType}
                  />
                </TabsContent>
                
                <TabsContent value="hours" className="space-y-4">
                  <HourAnalysisChart
                    data={getFilteredData()}
                    hourData={results.hourData}
                    title={selectedServiceType === "all" ? "All Service Types" : selectedServiceType}
                  />
                </TabsContent>
                
                <TabsContent value="zip" className="space-y-4">
                  <ZipAnalysisChart 
                    zipData={getFilteredZipData()} 
                    title={selectedServiceType === "all" ? "All Service Types" : selectedServiceType}
                  />
                </TabsContent>
                
                <TabsContent value="stats" className="space-y-4">
                  <StatisticsDisplay 
                    statistics={getFilteredStatistics()}
                    serviceType={selectedServiceType === "all" ? "All Service Types" : selectedServiceType}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-muted-foreground/10">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setResults(null);
                    setSelectedServiceType("all");
                  }}
                >
                  Upload New File
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}