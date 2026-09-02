import { ImageService } from "./services/image-service";
import { Viewer } from "./components/image-viewer/viewer/viewer";
import { Toolbar } from "./components/toolbar/toolbar/toolbar";
import { NomTraitement, ParametreRequete } from "./models/image";
import { Component, signal } from "@angular/core";

import {
  LucideAngularModule, ImagePlus, FileImage, Layers3, Grid2X2,
  CircleHelp, ChevronDown, Undo2, Redo2, Download,
} from 'lucide-angular';
import { forkJoin } from "rxjs";



const LIBELLES_TRAITEMENT: Record<NomTraitement, string> = {
  egalisation: "Égalisation de l'histogramme",
  niveau_de_gris: "Conversion en niveau de gris",
  binarisation: "Binarisation",
  filtrage: "Filtrage / débruitage",
  contours: "Détection de contours",
};


@Component({
  selector: "app-root",
  standalone: true,
  imports: [LucideAngularModule, Viewer, Toolbar],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})

export class App {
  readonly ImagePlus = ImagePlus;
  readonly FileImage = FileImage;
  readonly Layers3 = Layers3;
  readonly Grid2X2 = Grid2X2;
  readonly CircleHelp = CircleHelp;
  readonly ChevronDown = ChevronDown;
  readonly Undo2 = Undo2;
  readonly Redo2 = Redo2;
  readonly Download = Download;


  sessionId = signal<string | null>(null);
  imageActuelle = signal<string | null>(null);
  imageOriginale = signal<string | null>(null);
  histogramme = signal<number[][] | null>(null);
  historique = signal<string[]>([]);
  nomFichier = signal<string | null>(null);

  chargement = signal(false);
  erreur = signal<string | null>(null);
  vueComparaison = signal(true);

  outilActif = signal('Sélection');
  selectionActuelle = signal<{x: number; y: number; largeur: number; hauteur: number} | null >(null);



  constructor(private imageService: ImageService) {}

  onOutilChoisi(outil: string) {
    this.outilActif.set(outil);
  }

  onSelectionChange(selection: {x: number; y: number; largeur: number; hauteur: number} | null) {
    this.selectionActuelle.set(selection);
  }

  onRecadrerDemande() {
    const id = this.sessionId();
    const zone = this.selectionActuelle();
    if (!id || !zone) {
      this.erreur.set("Dessine d'abord une zone à recadrer avec l'outil Sélection")
      return;
    }
    this.chargement.set(true);

    const parametres: ParametreRequete[] = [
      { cle: 'crop_x', valeur: zone.x },
      { cle: 'crop_y', valeur: zone.y },
      { cle: 'crop_largeur', valeur: zone.largeur },
      { cle: 'crop_hauteur', valeur: zone.hauteur },
    ];

    forkJoin(parametres.map((p) => this.imageService.configurerParametre(id, p))).subscribe({
      next: () => this.onTraitementDemande('recadrage' as NomTraitement),
      error: () => {
        this.erreur.set("Impossible d'envoyer la zone de recadrage");
        this.chargement.set(false);
      },
    });
  }


  onImageImportee(fichier: File) {
    this.chargement.set(true);
    this.erreur.set(null);
    this.nomFichier.set(fichier.name);

    this.imageService.importerImage(fichier).subscribe({
      next: (response) => {
        this.sessionId.set(response.session_id);
        this.imageActuelle.set(response.image);
        this.imageOriginale.set(response.image);
        this.historique.set([]);
        this.rafraichirHistograme();
        this.chargement.set(false);
      },

      error: () => {
        this.erreur.set(
          "Impossible d'importer cette image. Vérifiez le format du fichier."
        );
        this.chargement.set(false);

      }
    });
  }


  onTraitementDemande(nom: NomTraitement) {
    const id = this.sessionId();
    if (!id) {
      this.erreur.set(
        "Importer une image avant d'appliquer un traitement"
      );
      return;
    }

    this.chargement.set(true);
    this.erreur.set(null);
    
    this.imageService
      .appliquerTraitement(id, nom)
      .subscribe({
        next: (reponse) => {
          this.imageActuelle.set(reponse.image);
          this.historique.update((h) => [LIBELLES_TRAITEMENT[nom], ...h].slice(0, 6));
          this.rafraichirHistograme();
          this.chargement.set(false);
        },

        error: () => {
          this.erreur.set(
            "Le traitement a échoué, Réessaie."
          );
          this.chargement.set(false);
        },
      });
  }

    onInstructionsSoumises(instructions: string) {
    const id = this.sessionId();
    if (!id) {
      this.erreur.set("Importe une image avant d'envoyer des instructions.");
      return;
    }
    this.chargement.set(true);
    this.erreur.set(null);

    this.imageService.interpreterInstructions(id, { instructions }).subscribe({
      next: (reponse) => {
        this.imageActuelle.set(reponse.image);
        const labels = reponse.traitements_appliques.map((nom) => LIBELLES_TRAITEMENT[nom as NomTraitement]);
        this.historique.update((h) => [...labels.reverse(), ...h].slice(0, 6));
        this.rafraichirHistograme();
        this.chargement.set(false);
      },
      error: (err) => {
        this.erreur.set(
          err.status === 422
            ? "Aucun traitement reconnu dans cette instruction."
            : "Le service d'interprétation est momentanément indisponible."
        );
        this.chargement.set(false);
      },
    });
  }

  onParametreModifie(requete: ParametreRequete) {
    const id = this.sessionId();
    if (!id) return;
    this.imageService
      .configurerParametre(id, requete)
      .subscribe({
        error: () => this.erreur.set(
          "Impossible de mettre à jour ce paramètre."
        ),
      });
  }


  onAnnulerDemande() {
    const id = this.sessionId();
    if (!id) return;
    this.chargement.set(true);
    this.imageService
      .annulerTraitement(id)
      .subscribe({
        next: (reponse) => {
          this.imageActuelle.set(reponse.image);
          this.historique.update((h) => h.slice(1));
          this.rafraichirHistograme();
          this.chargement.set(false);
        },

        error: () => {
          this.erreur.set("Impossible d'annuler.");
          this.chargement.set(false);
        },
      });
  }


  onExporterDemande() {
    const id = this.sessionId();
    if (!id) return;

    this.imageService
      .exporterImage(id)
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const lien = document.createElement("a");
          lien.href = url;
          lien.download = "image_exportee.png";
          lien.click();
          URL.revokeObjectURL(url);
        },
        error: () => this.erreur.set(
          "Échec de l'export."
        ),
      });
  }


  onComparaisonBasculee() {
    this.vueComparaison.update(value => !value);
  }
  private rafraichirHistograme(): void {
    const id = this.sessionId();
    if (!id) return;
    this.imageService
      .obtenirHistogramme(id)
      .subscribe({
        next: (response) => {
          this.histogramme.set(response.canaux);
        },

        error: () => {
          this.erreur.set(
            "Impossible de recuperer l'histograme"
          );
        }
      });
  }
}