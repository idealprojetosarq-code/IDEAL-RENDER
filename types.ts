
export interface RenderHistory {
  id: string;
  original: string;
  rendered: string;
  prompt: string;
  timestamp: number;
}

export enum RenderStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type DesignTheme = 'Industrial' | 'Natural' | 'Amadeirado' | 'Moderno' | 'Minimalista' | 'Mediterrâneo' | 'Escandinavo' | 'Brutalista';
export type FurniturePolicy = 'Manter Original' | 'Adicionar Mobília (IA)' | 'Remover Mobília';
export type LandscapingPolicy = 'Manter Original' | 'Adicionar Paisagismo (IA)' | 'Remover Paisagismo';
export type TimeOfDay = 'Nascer do Sol (Suave)' | 'Meio-dia (Sol Pleno)' | 'Hora Dourada (Quente)' | 'Nublado (Céu Dramático)' | 'Noite (Luz Artificial)' | 'Crepúsculo (Blue Hour)';

export type WatermarkCorner = 'Top Left' | 'Top Right' | 'Bottom Left' | 'Bottom Right';
export type WatermarkSize = 'Small' | 'Medium' | 'Large';
export type WatermarkOpacity = 'Low' | 'Medium' | 'High';

export interface WatermarkSettings {
  enabled: boolean;
  corner: WatermarkCorner;
  size: WatermarkSize;
  opacity: WatermarkOpacity;
}

export interface RenderingSettings {
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  designTheme: DesignTheme;
  baseColor: string;
  palette: string[]; // 3 tons gerados: [Base, Light, Dark]
  creativityLevel: number; 
  furniturePolicy: FurniturePolicy;
  landscapingPolicy: LandscapingPolicy;
  timeOfDay: TimeOfDay;
  designObservations: string;
  watermark: WatermarkSettings;
}
