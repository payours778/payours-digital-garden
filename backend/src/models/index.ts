export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  cover: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Moment {
  id: number;
  content: string;
  images: string[];
  likes: number;
  created_at: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  cover?: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  cover?: string;
}

export interface CreateMomentRequest {
  content: string;
  images?: string[];
}

export interface UpdateMomentRequest {
  content?: string;
  images?: string[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
  tech: string[];
  link: string;
  stars: number;
  created_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  tech?: string[];
  link?: string;
  stars?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  tech?: string[];
  link?: string;
  stars?: number;
}

export interface Album {
  id: number;
  name: string;
  description: string;
  cover_url: string;
  photo_count?: number;
  created_at: string;
}

export interface Photo {
  id: number;
  album_id: number;
  url: string;
  description: string;
  created_at: string;
}

export interface CreateAlbumRequest {
  name: string;
  description?: string;
  cover_url?: string;
}

export interface UpdateAlbumRequest {
  name?: string;
  description?: string;
  cover_url?: string;
}

export interface Music {
  id: number;
  title: string;
  artist: string;
  url: string;
  cover: string;
  created_at: string;
}

export interface CreateMusicRequest {
  title: string;
  artist?: string;
  url: string;
  cover?: string;
}

export interface UpdateMusicRequest {
  title?: string;
  artist?: string;
  url?: string;
  cover?: string;
}
