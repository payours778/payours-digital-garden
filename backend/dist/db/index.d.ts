import { Database } from 'sql.js';
export declare function getCache(key: string): any | null;
export declare function setCache(key: string, data: any): void;
export declare function invalidateCache(pattern?: string): void;
export declare function getDb(): Promise<Database>;
export declare function saveDb(): Promise<void>;
export default getDb;
//# sourceMappingURL=index.d.ts.map