import { Category } from './category';
export interface Product {
    name?: string;
    barcode?: string;
    description?: string;
    qty?: number;
    qty_type?: 'gramm' | 'milliliter' | 'pieces';
    imgurl?: string;
    category?: string;
    nutrient?: {
        nutrientbase?: string,
        carbs?: number,
        carbs_sugar?: number,
        energy_kcal?: number,
        fat?: number,
        fat_saturated?: number,
        fiber?: number,
        natrium?: number,
        protein?: number,
        salt?: number
    };
}
