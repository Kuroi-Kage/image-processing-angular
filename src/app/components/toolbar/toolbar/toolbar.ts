import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { NomTraitement, ParametreRequete } from '../../../models/image';

@Component({
  selector: 'app-toolbar',
  imports: [FormsModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {

  @Input() historique: string[] = [];
  @Input() traitementEnCours = false;

  @Output() imageImportee = new EventEmitter<File>();
  @Output() traitementDemande = new EventEmitter<NomTraitement>();
  @Output() parametreModifie = new EventEmitter<ParametreRequete>();
  @Output() annulerDemande = new EventEmitter<void>();
  @Output() exporterDemande = new EventEmitter<void>();
  @Output() comparaisonBasculee = new EventEmitter<void>();

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

  demanderTraitement(nom: NomTraitement) {
    this.traitementDemande.emit(nom);
  }

  onParametreChange(cle:string, valeur: number) {
    this.parametreModifie.emit({ cle, valeur });
  }


}
