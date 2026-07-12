import { Request, Response } from 'express';
export declare const getAlbums: (req: Request, res: Response) => Promise<void>;
export declare const getAlbumById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createAlbum: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAlbum: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteAlbum: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addPhotos: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePhoto: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllPhotos: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=photoController.d.ts.map