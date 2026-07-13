import OSS from 'ali-oss';
import dotenv from 'dotenv';
import { getAllFolders } from '../src/utils/ossFolders';

dotenv.config();

const { ACCESS_KEY_ID, ACCESS_KEY_SECRET, OSS_REGION, OSS_BUCKET } = process.env;

if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET || !OSS_REGION || !OSS_BUCKET) {
  console.error('OSS configuration is missing.');
  process.exit(1);
}

const client = new OSS({
  region: OSS_REGION,
  accessKeyId: ACCESS_KEY_ID,
  accessKeySecret: ACCESS_KEY_SECRET,
  bucket: OSS_BUCKET,
});

const createFolder = async (folder: string): Promise<void> => {
  try {
    const folderKey = folder + '/';
    await client.put(folderKey, Buffer.from(''));
    console.log(`✅ 创建文件夹: ${folder}`);
  } catch (error: any) {
    console.log(`⚠️ 文件夹 ${folder} 已存在或创建失败: ${error.message}`);
  }
};

const initFolders = async () => {
  console.log(`\n🚀 开始在 OSS Bucket "${OSS_BUCKET}" 中创建文件夹...\n`);
  
  const folders = getAllFolders();
  
  for (const folder of folders) {
    await createFolder(folder);
  }
  
  console.log(`\n🎉 文件夹初始化完成！共 ${folders.length} 个文件夹。\n`);
  console.log('📁 OSS 文件夹结构:');
  console.log('------------------');
  folders.forEach(folder => {
    console.log(`  - ${folder}/`);
  });
};

initFolders().catch((error) => {
  console.error('❌ 初始化失败:', error);
  process.exit(1);
});