import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-west-2",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const STATEMENTS_TABLE = process.env.STATEMENTS_TABLE;

const listStatements = async (path, body) => {
  try {
    console.log("Listing statements for path:", path);

    // Scan the DynamoDB table to get all statements
    const scanCommand = new ScanCommand({
      TableName: STATEMENTS_TABLE,
      // You can add filters here if needed
      // FilterExpression: "userId = :userId",
      // ExpressionAttributeValues: { ":userId": "default" }
    });

    const result = await docClient.send(scanCommand);
    const statements = result.Items || [];

    console.log(`Found ${statements.length} statements`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        statements: statements,
        message: "Statements retrieved successfully",
      }),
    };
  } catch (error) {
    console.error("Error listing statements:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to list statements",
        error: error.message,
      }),
    };
  }
};

export default listStatements;
