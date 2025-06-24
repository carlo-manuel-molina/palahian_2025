import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

async function testS3() {
  try {
    const result = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 5 }));
    console.log('✅ S3 credentials and config are working!');
    console.log('Sample objects:', result.Contents?.map(obj => obj.Key));
  } catch (err) {
    console.error('❌ S3 test failed:', err);
  }
}

testS3(); 