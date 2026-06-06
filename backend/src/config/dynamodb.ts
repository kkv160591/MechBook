import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local"
  }
})

export const db =
  DynamoDBDocumentClient.from(client)