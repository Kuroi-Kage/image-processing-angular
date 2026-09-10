export interface ImportResponse {
    session_id: string;
    image: string
}

export interface TraitementResponse {
    image: string;
}

export interface AnnulerResponse {
    annule: boolean;
    image: string;
}

export interface HistogrammeResponse {
    canaux: number[][];
} 

export interface ParametreRequete {
    cle: string;
    valeur: number;
}


export type NomTraitement = 
| 'egalisation' 
| 'niveaux_de_gris'
| 'binarisation'
| 'filtrage'
| 'contours'
| 'rotation'
| 'recadrage'
| 'redimensionnement'
| 'effacement'
| 'amelioration';


export interface InstructionsRequete {
    instructions: string;
}

export interface InstructionsResponse {
    image: string;
    traitements_appliques: string[]
}

export interface TraitementResponse {
  image: string;
  avertissements?: string[];
}

export interface RetablirResponse {
    retabli: boolean;
    image: string;
}

export interface EtatSessionResponse {
    image: string;
    image_original: string;
}

export interface Calque {
  id: string;
  image: string;
  visible: boolean;
  opacite: number;
  mode_fusion: 'normal' | 'multiplier' | 'ecran' | 'superposition';
}

export interface AjouterCalqueResponse {
  id: string;
  image: string;
}

export interface ReglageCalqueRequete {
  visible?: boolean;
  opacite?: number;
  mode_fusion?: string;
}

