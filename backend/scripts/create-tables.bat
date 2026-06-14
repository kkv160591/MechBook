aws dynamodb create-table ^
--table-name Garages ^
--attribute-definitions AttributeName=garageId,AttributeType=S ^
--key-schema AttributeName=garageId,KeyType=HASH ^
--billing-mode PAY_PER_REQUEST ^
--endpoint-url http://localhost:8000

aws dynamodb create-table ^
--table-name Workers ^
--attribute-definitions AttributeName=workerId,AttributeType=S ^
--key-schema AttributeName=workerId,KeyType=HASH ^
--billing-mode PAY_PER_REQUEST ^
--endpoint-url http://localhost:8000

aws dynamodb create-table ^
--table-name Customers ^
--attribute-definitions ^
AttributeName=customerId,AttributeType=S ^
--key-schema ^
AttributeName=customerId,KeyType=HASH ^
--billing-mode PAY_PER_REQUEST ^
--endpoint-url http://localhost:8000

aws dynamodb create-table ^
--table-name Inventory ^
--attribute-definitions AttributeName=partId,AttributeType=S ^
--key-schema AttributeName=partId,KeyType=HASH ^
--billing-mode PAY_PER_REQUEST ^
--endpoint-url http://localhost:8000