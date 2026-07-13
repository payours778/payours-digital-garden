export interface FolderConfig {
  [key: string]: string;
}

export const ossFolders: FolderConfig = {
  posts: 'posts',
  essays: 'essays',
  albums: 'albums',
  projects: 'projects',
  music: 'music',
  moments: 'moments',
  users: 'users',
};

export const getAllFolders = (): string[] => {
  return Object.values(ossFolders);
};

export const getFolderPath = (module: string): string => {
  return ossFolders[module] || 'blog';
};