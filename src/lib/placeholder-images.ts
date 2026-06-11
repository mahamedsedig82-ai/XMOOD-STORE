import data from '@/app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export function getPlaceholderById(id: string): ImagePlaceholder {
  const img = PlaceHolderImages.find(p => p.id === id);
  if (!img) {
    return {
      id: 'default',
      description: 'Default placeholder',
      imageUrl: 'https://picsum.photos/seed/default/800/600',
      imageHint: 'luxury abstract'
    };
  }
  return img;
}
