const {
  DynamoDBClient,
  DescribeTableCommand,
  ScanCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");

const endpoint = "http://localhost:8000";
const region = "ap-south-1";

const tables = [
  "Garages",
  "Workers",
  "Customers",
  "Inventory",
  "ServiceTypes",
  "GarageSettings",
  "Jobs",
  "Subscription",
  "PinRecovery",
  "Notifications",
];

const client = new DynamoDBClient({
  region,
  endpoint,
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

async function clearTable(tableName) {
  console.log(`\nClearing ${tableName}...`);

  const description = await client.send(
    new DescribeTableCommand({
      TableName: tableName,
    }),
  );

  const keyNames = description.Table.KeySchema.map((key) => key.AttributeName);

  let lastKey;
  let deleted = 0;

  do {
    const result = await client.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastKey,
      }),
    );

    for (const item of result.Items || []) {
      const key = {};

      for (const keyName of keyNames) {
        key[keyName] = item[keyName];
      }

      await client.send(
        new DeleteItemCommand({
          TableName: tableName,
          Key: key,
        }),
      );

      deleted++;
    }

    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  console.log(`Cleared ${tableName}: ${deleted} items deleted.`);
}

async function main() {
  console.log("Target: LOCAL DynamoDB at", endpoint);
  console.log("This deletes items, not tables.");

  for (const table of tables) {
    try {
      await clearTable(table);
    } catch (error) {
      console.error(`Failed on ${table}:`, error.message);
      process.exitCode = 1;
      break;
    }
  }

  await client.destroy();
}

main();
