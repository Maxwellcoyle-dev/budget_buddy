import generatePresignedUrl from "./routes/generate-presigned-url.mjs";
import listStatements from "./routes/list-statements.mjs";
import getStatement from "./routes/get-statement.mjs";

const router = {
  get: (path, handler) => {
    console.log("GET request to:", path);

    if (path.includes("jobId=")) {
      return getStatement(path, handler);
    } else {
      return listStatements(path, handler);
    }
  },
  post: (path, handler) => {
    console.log("POST request to:", path);

    if (path.includes("upload-url")) {
      console.log("Generating presigned URL");
      return generatePresignedUrl(path, handler);
    }

    // Default response for unknown POST routes
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Route not found",
        path: path,
      }),
    };
  },
};

export default router;
