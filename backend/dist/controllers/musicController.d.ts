import { Request, Response } from 'express';
export declare const getMusicList: (req: Request, res: Response) => Promise<void>;
export declare const getMusicById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createMusic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateMusic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteMusic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=musicController.d.ts.map