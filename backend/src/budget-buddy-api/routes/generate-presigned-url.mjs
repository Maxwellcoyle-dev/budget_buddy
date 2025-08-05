import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-west-2",
});
const STATEMENTS_TABLE = process.env.STATEMENTS_TABLE;
const S3_BUCKET = process.env.S3_BUCKET;

const generatePresignedUrl = async (path, body) => {
  try {
    console.log("Generating presigned URL for path:", path);
    console.log("Request body:", body);

    // Parse the request body
    const requestBody = body ? JSON.parse(body) : {};
    const { fileName, fileSize, contentType } = requestBody;

    if (!fileName || !fileSize || !contentType) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required fields: fileName, fileSize, contentType",
        }),
      };
    }

    // Generate a unique job ID and S3 key
    const jobId = uuidv4();
    const s3Key = `statements/${jobId}/${fileName}`;

    // Create the PutObject command
    const putObjectCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      ContentType: contentType,
    });

    // Generate presigned URL for S3 upload
    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 300, // URL expires in 5 minutes
    });

    console.log("Generated presigned URL:", presignedUrl);
    console.log("S3 Key:", s3Key);
    console.log("Job ID:", jobId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: presignedUrl,
        jobId: jobId,
        s3Key: s3Key,
        message: "Presigned URL generated successfully",
      }),
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to generate presigned URL",
        error: error.message,
      }),
    };
  }
};

export default generatePresignedUrl;
