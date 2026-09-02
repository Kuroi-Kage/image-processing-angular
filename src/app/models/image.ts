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
| 'niveau_de_gris'
| 'binarisation'
| 'filtrage'
| 'contours';

export interface InstructionsRequete {
    instructions: string;
}

export interface InstructionsResponse {
    image: string;
    traitements_appliques: string[]
}

