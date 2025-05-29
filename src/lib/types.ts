export interface CSVRow {
  SR_NUMBER: string;
  SR_TYPE: string;
  CREATED_DATE: string;
  CLOSED_DATE: string;
  [key: string]: string;
}

export interface ProcessedData {
  srType: string;
  daysDiff: number;
  createdDate: Date;
  closedDate: Date | null;
  createdHour: number;
  zipCode: string;
}

export interface HourData {
  hour: number;
  count: number;
}

export interface ZipData {
  zipCode: string;
  mean: number;
  median: number;
  count: number;
}

export interface AnalysisResults {
  data: ProcessedData[];
  hourData: HourData[];
  zipData?: ZipData[];
  statistics: {
    mean: number;
    median: number;
    total: number;
  };
  serviceTypes: string[];
  fileHash: string;
} 