
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface ImageFile {
  file: File;
  preview: string;
}

export interface GeneratedImage {
  src: string;
  alt: string;
}
