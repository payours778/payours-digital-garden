import { Request, Response } from 'express';
import { uploadImage, deleteFile } from '../utils/oss';
import { getFolderPath } from '../utils/ossFolders';

export const uploadImageToOSS = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }

    const { buffer, originalname } = req.file;
    
    let folder = (req.query.folder as string) || '';
    
    if (!folder) {
      const module = (req.query.module as string) || '';
      folder = module ? getFolderPath(module) : 'blog';
    }
    
    const url = await uploadImage(buffer, originalname, folder);

    res.json({ success: true, url, folder });
  } catch (error: any) {
    console.error('上传图片失败:', error);
    res.status(500).json({ error: `上传图片失败: ${error.message}` });
  }
};

export const deleteImageFromOSS = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: '请提供图片 URL' });
    }

    await deleteFile(url);
    res.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    console.error('删除图片失败:', error);
    res.status(500).json({ error: `删除图片失败: ${error.message}` });
  }
};