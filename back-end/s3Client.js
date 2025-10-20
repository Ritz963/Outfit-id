import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();
const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.BUCKET_NAME;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({ region: REGION, credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY }});

export async function uploadToS3(buffer, key, contentType) {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType, ACL: 'public-read' }));
  return `https://${BUCKET}.s3.amazonaws.com/${encodeURIComponent(key)}`;
}