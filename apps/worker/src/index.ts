import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const queueUrl = process.env.SQS_URL || 'http://localhost/queue-dev';
const client = new SQSClient({ region: process.env.AWS_REGION || 'eu-central-1' });

async function poll() {
  const resp = await client.send(new ReceiveMessageCommand({
    QueueUrl: queueUrl, MaxNumberOfMessages: 5, WaitTimeSeconds: 10, VisibilityTimeout: 30
  }));
  if (!resp.Messages?.length) return;

  for (const m of resp.Messages) {
    try {
      console.log('Processing message', m.MessageId);
      // TODO: route by message type (zip2csv, etc.)
      // Simulate work
      await new Promise(r => setTimeout(r, 500));
      await client.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: m.ReceiptHandle! }));
      console.log('Done', m.MessageId);
    } catch (e) {
      console.error('Failed', m.MessageId, e);
    }
  }
}

async function main() {
  console.log('Worker started. Polling SQS...');
  while (true) { await poll(); }
}

main().catch(err => { console.error(err); process.exit(1); });
