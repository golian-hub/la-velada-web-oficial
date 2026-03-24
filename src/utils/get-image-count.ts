import galleryCounts from '../fighter-gallery-counts.json';

type FighterGalleryCounts = Record<string, number>;

export function fighterGallery(id: string): number {
    const counts = galleryCounts as FighterGalleryCounts;
    return counts[id] || 0;
}