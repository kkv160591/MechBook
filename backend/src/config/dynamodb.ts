
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

const region = process.env.AWS_REGION || "ap-south-1"
const endpoint = process.env.DYNAMODB_ENDPOINT

const client = new DynamoDBClient({
  region,

  // Local DynamoDB only. In AWS, omit the endpoint
  // and credentials so Lambda uses its IAM execution role.
  ...(endpoint
    ? {
        endpoint,
        credentials: {
          accessKeyId: "local",
          secretAccessKey: "local",
        },
      }
    : {}),
})

export const db = DynamoDBDocumentClient.from(client)