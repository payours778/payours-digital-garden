import { Request, Response } from 'express';
export declare const getProjects: (req: Request, res: Response) => Promise<void>;
export declare const getProjectById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProjectStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=projectController.d.ts.map