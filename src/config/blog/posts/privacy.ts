import { BlogPost } from '../types';

export const PRIVACY_POSTS: BlogPost[] = [
  {
    slug: 'exif-metadata-in-your-photos',
    title: 'What your photos reveal: EXIF metadata and how to remove it',
    description: 'Photos carry GPS coordinates, timestamps, device serial numbers and more. What is stored, which platforms strip it, and how to check your own files.',
    excerpt: 'A photo posted from home can contain the coordinates of the room it was taken in, accurate to a few metres, in a field nobody thinks to look at.',
    category: 'security',
    tags: ['exif', 'metadata', 'photos', 'gps'],
    published: '2026-09-09',
    relatedTools: ['image-metadata', 'image-convert', 'image-compressor', 'pdf-metadata'],
    takeaways: [
      'A photo can carry GPS coordinates, a timestamp, the device model and even the camera body serial number.',
      'The embedded thumbnail is not always regenerated when the main image is edited, so a cropped photo can still contain the original.',
      'Platforms strip metadata inconsistently, and stripping on upload does not help a file you send directly.',
      'Documents carry the same problem in a different place: author names, revision counts and editing time.',
    ],
    words: 707,
  },

];
