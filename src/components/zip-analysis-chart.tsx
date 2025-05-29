"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Download, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZipData } from "../lib/types";
import { useMemo } from "react";

interface ZipAnalysisChartProps {
  zipData: ZipData[];
  title: string;
}

interface ChartData {
  zipCode: string;
  mean: number;
  median: number;
  count: number;
  color: string;
}

export function ZipAnalysisChart({ zipData, title }: ZipAnalysisChartProps) {
  const getBarColor = (value: number, maxValue: number): string => {
    if (maxValue === 0) return "#8884d8"; // Default color
    const intensity = value / maxValue;
    if (intensity > 0.8) return "#ef4444"; // red
    if (intensity > 0.6) return "#f97316"; // orange
    if (intensity > 0.4) return "#eab308"; // yellow
    if (intensity > 0.2) return "#22c55e"; // green
    return "#3b82f6"; // blue
  };

  const chartData = useMemo(() => {
    if (!zipData || zipData.length === 0) return [];
    const maxMedian = Math.max(...zipData.map(d => d.median), 0);
    return zipData
      .filter(d => d.zipCode !== 'N/A' && d.count > 0) // Exclude N/A and zero count ZIPs from chart
      .slice(0, 20) // Show top 20 ZIP codes by count
      .map(d => ({
        ...d,
        color: getBarColor(d.median, maxMedian)
      })).sort((a,b) => a.median - b.median); // Sort by median ascending for chart display
  }, [zipData]);

  const downloadChart = () => {
    const csvContent = [
      ["ZIP Code", "Mean Days to Close", "Median Days to Close", "Request Count"],
      ...zipData.map(item => [
        item.zipCode,
        item.mean.toString(),
        item.median.toString(),
        item.count.toString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}_zip_analysis.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-lg">ZIP Code: {label}</p>
          <p className="text-sm">Median Days to Close: <span className="font-bold text-primary">{payload[0].payload.median}</span></p>
          <p className="text-sm">Mean Days to Close: <span className="font-bold">{payload[0].payload.mean}</span></p>
          <p className="text-sm">Total Requests: <span className="font-bold">{payload[0].payload.count}</span></p>
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="shadow-sm border-muted-foreground/10">
        <CardHeader>
          <CardTitle>No ZIP Code Data Available</CardTitle>
          <CardDescription>
            Ensure your CSV has a ZIP_CODE column and data for analysis, or try a different service type.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-muted-foreground/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Median Days to Close by ZIP Code
            </CardTitle>
            <CardDescription>
              {title} • Top {chartData.length} ZIP codes by request volume (sorted by median days)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={downloadChart}>
            <Download className="w-4 h-4 mr-2" />
            Download Full Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis type="number" label={{ value: "Median Days to Close", position: 'insideBottom', offset: -10, fontSize: 12 }} fontSize={12} />
              <YAxis dataKey="zipCode" type="category" width={80} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="median" name="Median Days to Close" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Chart displays median time to close service requests for the top 20 ZIP codes by volume.
            Color intensity indicates median days - darker colors represent higher median days to close.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 