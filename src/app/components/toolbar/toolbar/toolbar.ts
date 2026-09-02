import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { NomTraitement, ParametreRequete } from '../../../models/image';
import {
  LucideAngularModule, MousePointer2, Crop, Eraser, WandSparkles,
  RotateCcw, SlidersHorizontal, Upload,
} from 'lucide-angular';


interface Outil {
  label: string;
  icon: any;
}

interface Traitement {
  label: string;
  key: NomTraitement;
}
@Component({
  selector: 'app-toolbar',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {

  @Input() historique: string[] = [];
  @Input() traitementEnCours = false;

  @Output() imageImportee = new EventEmitter<File>();
  @Output() traitementDemande = new EventEmitter<NomTraitement>();
  @Output() parametreModifie = new EventEmitter<ParametreRequete>();
  @Output() instructionsSoumises = new EventEmitter<string>();
  @Input() outilActif = 'Sélection';
  @Output() outilChoisi = new EventEmitter<string>();
  @Output() recadrerDemande = new EventEmitter<void>();


  readonly RotateCcw = RotateCcw;
  readonly SlidersHorizontal = SlidersHorizontal;
  readonly WandSparkles = WandSparkles;
  readonly Upload = Upload;

  readonly outils: Outil[] = [
    { label: 'Sélection', icon: MousePointer2 },
    { label: 'Recadrer', icon: Crop },
    { label: 'Effacer', icon: Eraser },
    { label: 'Améliorer', icon: WandSparkles },
  ];

  readonly traitements: Traitement[] = [
    { label: 'Niveaux de gris', key: 'niveau_de_gris' },
    { label: 'Égaliser', key: 'egalisation' },
    { label: 'Binariser', key: 'binarisation' },
    { label: 'Filtrer / débruiter', key: 'filtrage' },
    { label: 'Contours', key: 'contours' },
  ];

  instructions = '';

  ongletActif: 'reglages' | 'traitements' = 'traitements'

  seuilBinarisation = 127;
  tailleNoyauFiltre = 3;
  seuilBasContours = 100;
  seuilHautContours = 200;

  onFichierChoisi(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageImportee.emit(input.files[0]);
    }
  }

  choisirOutil(label: string) {
    this.outilChoisi.emit(label);
  }

  reinitialiserOutil() {
    this.outilActif = 'Sélection';
  }

  demanderTraitement(nom: NomTraitement) {
    this.traitementDemande.emit(nom);
  }
  
  onParametreChange(cle:string, valeur: number) {
    this.parametreModifie.emit({ cle, valeur });
  }


}
