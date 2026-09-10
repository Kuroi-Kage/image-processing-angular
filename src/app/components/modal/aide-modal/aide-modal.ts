import { Component, EventEmitter, Output } from "@angular/core";
import { Download, LucideAngularModule, MousePointer2, Upload, Wand, Wand2, X } from "lucide-angular";

@Component({
  selector: 'app-aide-modal',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './aide-modal.html',
  styleUrl: './aide-modal.scss',
})

export class AideModal {
    @Output() fermer = new EventEmitter<void>();

    readonly X = X;
    readonly Upload = Upload;
    readonly MousePointer2 = MousePointer2;
    readonly Wand2 = Wand2
    readonly Download = Download

   readonly etapes = [
  {
    icon: this.Upload,
    titre: 'Importer une image',
    texte: 'Importez une image depuis votre appareil ou glissez-déposez simplement un fichier dans la zone prévue à cet effet.',
  },
  {
    icon: this.MousePointer2,
    titre: 'Appliquer un traitement',
    texte: 'Explorez les traitements disponibles : niveaux de gris, binarisation, filtrage, détection de contours ou égalisation. Ajustez les paramètres selon vos besoins avant de les appliquer.',
  },
  {
    icon: this.Wand2,
    titre: 'Retoucher votre image',
    texte: 'Utilisez l’outil Sélection pour définir une zone, puis recadrez ou effacez les éléments souhaités. Le mode Améliorer permet d’affiner la luminosité, le contraste, la saturation et bien plus.',
  },
  {
    icon: this.Download,
    titre: 'Exporter le résultat',
    texte: 'Lorsque votre image est prête, cliquez sur Exporter pour télécharger votre résultat.',
  },
];
}
