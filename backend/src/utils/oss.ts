import OSS from 'ali-oss';
import dotenv from 'dotenv';

dotenv.config();

const { ACCESS_KEY_ID, ACCESS_KEY_SECRET, OSS_REGION, OSS_BUCKET } = process.env;

if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET || !OSS_REGION || !OSS_BUCKET) {
  throw new Error('OSS configuration is missing. Please set ACCESS_KEY_ID, ACCESS_KEY_SECRET, OSS_REGION, OSS_BUCKET in .env file.');
}

const client = new OSS({
  region: OSS_REGION,
  accessKeyId: ACCESS_KEY_ID,
  accessKeySecret: ACCESS_KEY_SECRET,
  bucket: OSS_BUCKET,
});

export const uploadFile = async (file: Buffer, filename: string, contentType?: string, folder: string = 'blog'): Promise<string> => {
  const timestamp = Date.now();
  const extension = filename.split('.').pop() || 'jpg';
  const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_/-]/g, '_');
  const ossFilename = `${sanitizedFolder}/${timestamp}_${Math.random().toString(36).substr(2, 9)}.${extension}`;

  const result = await client.put(ossFilename, file, {
    headers: contentType ? { 'Content-Type': contentType } : {},
  });

  return result.url;
};

export const uploadImage = async (file: Buffer, filename: string, folder: string = 'blog'): Promise<string> => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const contentTypeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
  };

  const contentType = contentTypeMap[extension || ''] || 'image/jpeg';
  return uploadFile(file, filename, contentType, folder);
};

export const deleteFile = async (url: string): Promise<void> => {
  const objectKey = url.replace(`https://${OSS_BUCKET}.${OSS_REGION}.aliyuncs.com/`, '');
  await client.delete(objectKey);
};

export default client;