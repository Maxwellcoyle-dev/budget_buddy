import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-west-2",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const STATEMENTS_TABLE = process.env.STATEMENTS_TABLE;

const getStatement = async (path, body) => {
  try {
    console.log("Getting statement for path:", path);

    // Extract jobId from path
    const jobId = path.split("/").pop();

    if (!jobId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing jobId parameter",
        }),
      };
    }

    // Get the statement from DynamoDB
    const getCommand = new GetCommand({
      TableName: STATEMENTS_TABLE,
      Key: {
        jobId: jobId,
      },
    });

    const result = await docClient.send(getCommand);
    const statement = result.Item;

    if (!statement) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Statement not found",
          jobId: jobId,
        }),
      };
    }

    console.log("Retrieved statement:", statement);

    return {
      statusCode: 200,
      body: JSON.stringify(statement),
    };
  } catch (error) {
    console.error("Error getting statement:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to get statement",
        error: error.message,
      }),
    };
  }
};

export default getStatement;
