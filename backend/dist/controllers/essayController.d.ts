import { Request, Response } from 'express';
export declare const getEssays: (req: Request, res: Response) => Promise<void>;
export declare const getEssayById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createEssay: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateEssay: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteEssay: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=essayController.d.ts.map