// Define the Statement type here since the slice doesn't exist yet
interface Statement {
  jobId: string;
  companyName: string;
  jobType: string;
  tenantName: string;
  totalItemsProcessed: number;
  totalInvalidItems: number;
  jobTimestamp: string;
  s3ObjectKey: string;
}

// Types for file upload
export interface UploadFileRequest {
  fileName: string;
  fileSize: number;
  file: File;
}

export interface UploadFileResponse {
  jobId: string;
  status: "processing" | "completed" | "failed";
  message: string;
}

// Types for presigned URL requests
export interface PresignedUrlRequest {
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  jobId: string;
  s3Key: string;
}

// Types for statement data
export interface ProcessedStatementData {
  accountNumber: string;
  statementPeriod: {
    startDate: string;
    endDate: string;
  };
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
    type: "debit" | "credit";
    category?: string;
  }>;
  summary: {
    totalDebits: number;
    totalCredits: number;
    balance: number;
  };
}

export interface StatementWithData extends Statement {
  processedData?: ProcessedStatementData;
}

// API base URL
const API_BASE_URL =
  "https://pqfvt433uc.execute-api.us-west-2.amazonaws.com/budget-buddy-backend";

/**
 * Get a presigned URL for uploading a file to S3
 * This is the first step in the upload process
 */
export const getPresignedUrl = async (
  request: PresignedUrlRequest
): Promise<PresignedUrlResponse> => {
  try {
    console.log("Requesting presigned URL for:", request.fileName);

    const response = await fetch(`${API_BASE_URL}/statements/upload-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get presigned URL: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Received presigned URL:", data);

    return data;
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get presigned URL"
    );
  }
};

/**
 * Upload a file directly to S3 using a presigned URL
 * This is the second step in the upload process
 */
export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File
): Promise<void> => {
  try {
    console.log("Uploading file to S3:", file.name);

    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to upload to S3: ${response.status} - ${response.statusText}`
      );
    }

    console.log("File uploaded to S3 successfully");
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload file to S3"
    );
  }
};

/**
 * Complete file upload process (get presigned URL + upload to S3)
 * This combines both steps for convenience
 */
export const uploadFile = async (
  request: UploadFileRequest
): Promise<UploadFileResponse> => {
  try {
    console.log("Starting file upload process:", request.fileName);

    // Step 1: Get presigned URL
    const presignedUrlData = await getPresignedUrl({
      fileName: request.fileName,
      fileSize: request.fileSize,
      contentType: request.file.type,
    });

    // Step 2: Upload file to S3
    await uploadFileToS3(presignedUrlData.uploadUrl, request.file);

    console.log("File upload completed successfully");

    return {
      jobId: presignedUrlData.jobId,
      status: "processing",
      message: "File uploaded successfully. Processing will begin shortly.",
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload file to server"
    );
  }
};

/**
 * Fetch all processed statements from the backend
 * This gets the list of jobs/statements that have been processed
 */
export const getStatements = async (): Promise<Statement[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/statements`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch statements: ${response.status} - ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching statements:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch statements from server"
    );
  }
};

/**
 * Fetch a specific statement by job ID
 * This gets the detailed data for a processed statement
 */
export const getStatementById = async (
  jobId: string
): Promise<StatementWithData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/statements/${jobId}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch statement: ${response.status} - ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching statement:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch statement from server"
    );
  }
};
