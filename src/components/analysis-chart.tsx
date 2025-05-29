"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProcessedData } from "../lib/types";

interface AnalysisChartProps {
  data: ProcessedData[];
  title: string;
}

interface ChartData {
  range: string;
  count: number;
  color: string;
}

export function AnalysisChart({ data, title }: AnalysisChartProps) {
  const getBarColor = (count: number, maxCount: number): string => {
    if (maxCount === 0) return "#3b82f6"; // blue default
    const intensity = count / maxCount;
    if (intensity > 0.8) return "#ef4444"; // red
    if (intensity > 0.6) return "#f97316"; // orange
    if (intensity > 0.4) return "#eab308"; // yellow
    if (intensity > 0.2) return "#22c55e"; // green
    return "#3b82f6"; // blue
  };

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    try {
      // Create histogram bins
      const daysDiffs = data.map(d => d.daysDiff).filter(d => typeof d === 'number' && !isNaN(d));
      
      if (daysDiffs.length === 0) return [];
      
      // const maxDays = Math.max(...daysDiffs); // Original
      // const minDays = Math.min(...daysDiffs); // Original

      // Safer way to calculate max and min for large arrays
      const maxDays = daysDiffs.reduce((max, current) => current > max ? current : max, -Infinity);
      const minDays = daysDiffs.reduce((min, current) => current < min ? current : min, Infinity);
      
      // Determine bin size based on data range
      let binSize = 1;
      if (maxDays > 100) binSize = 7; // Weekly bins for large ranges
      else if (maxDays > 50) binSize = 5; // 5-day bins
      else if (maxDays > 20) binSize = 2; // 2-day bins

      const bins: { [key: string]: number } = {};
      
      for (const days of daysDiffs) {
        const binStart = Math.floor(days / binSize) * binSize;
        const binEnd = binStart + binSize - 1;
        const binKey = binSize === 1 ? `${binStart}` : `${binStart}-${binEnd}`;
        bins[binKey] = (bins[binKey] || 0) + 1;
      }

      const binValues = Object.values(bins);
      // const maxCount = binValues.length > 0 ? Math.max(...binValues) : 1; // Original
      const maxCount = binValues.length > 0 ? binValues.reduce((max, current) => current > max ? current : max, -Infinity) : 1; // Safer calculation

      // Convert to chart data format
      const chartEntries = Object.entries(bins)
        .map(([range, count]) => ({
          range,
          count,
          color: getBarColor(count, maxCount),
        }))
        .sort((a, b) => {
          // Sort by the first number in the range
          const aStart = parseInt(a.range.split('-')[0]) || 0;
          const bStart = parseInt(b.range.split('-')[0]) || 0;
          return aStart - bStart;
        });

      return chartEntries;
    } catch (error) {
      console.error('Error creating chart data:', error);
      return [];
    }
  }, [data, getBarColor]);

  const downloadChart = () => {
    // Create CSV data for download
    const csvContent = [
      ["Days Range", "Number of Requests"],
      ...chartData.map(item => [item.range, item.count.toString()])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}_analysis.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Days to Close: ${label}`}</p>
          <p className="text-primary">
            {`Requests: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>
            Please select a service type that contains data.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Days to Close Distribution</CardTitle>
            <CardDescription>
              {title} • {data.length} requests analyzed
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={downloadChart}>
            <Download className="w-4 h-4 mr-2" />
            Download Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis 
                dataKey="range" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                label={{ value: "Number of Requests", angle: -90, position: "insideLeft" }}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Chart shows the distribution of time taken to close service requests. 
            Color intensity indicates frequency - darker colors represent higher request volumes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}