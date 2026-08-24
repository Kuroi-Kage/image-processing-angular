import { ImageService } from "./services/image-service";
import { Viewer } from "./components/image-viewer/viewer/viewer";
import { Histogram } from "./components/histogram/histogram/histogram";
import { Toolbar } from "./components/toolbar/toolbar/toolbar";
import { NomTraitement, ParametreRequete } from "./models/image";
import { Component } from "@angular/core";


const LIBELLES_TRAITEMENT: Record<NomTraitement, string> = {
  egalisation: 'Égalisation de l\'histogramme',
  niveau_de_gris: 'Conversion en niveau de gris',
  binarisation: 'Binarisation',
  filtrage: 'Filtrage / débruitage',
  contours: 'Détection de contours',
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Viewer, Histogram, Toolbar],
  templateUrl: './app.html',
})

export class App {
  sessionId: string | null = null;
  imageActuelle: string | null = null;
  imageOriginale: string | null = null;
  histogramme: number[][] | null = null;
  historique: string[] = [];

  chargement = false;
  erreur: string | null = null;
  vueComparaison = false;

  constructor(private imageService: ImageService) {}

  onImageImportee(fichier: File) {
    this.chargement = true;
    this.erreur = null;

    this.imageService.importerImage(fichier).subscribe({
      next: (Response) => {
        this.sessionId = Response.session_id;
        this.imageActuelle = Response.image;
        this.imageOriginale = Response.image;
        this.historique = [];
        this.rafraichirHistograme();
        this.chargement = false;
      },
      error: () => {
        this.erreur = "Impossible d'importrt cette image. Vérifier le format du fichier"
        this.chargement = false;
      }
    });
  }

  onTraitementDemande(nom: NomTraitement) {
    if (!this.sessionId) {
      this.erreur = 'Importer une iage avant d\'appliquerun traitement';
      return;
    }

    this.chargement = true;
    this.erreur = null;

    this.imageService.appliquerTraitement(this.sessionId, nom).subscribe({
      next: (reponse) => {
        this.imageActuelle = reponse.image;
        this.historique = [...this.historique, LIBELLES_TRAITEMENT[nom]];
        this.rafraichirHistograme();
        this.chargement = false;
      },
      error: () => {
        this.erreur = 'Le traitement a échoué, Réessaie.';
        this.chargement = false;
      },
    });
  }

  onParametreModifie(requete: ParametreRequete) {
    if (!this.sessionId) return;
    this.imageService.configurerParametre(this.sessionId, requete).subscribe({
      error: () => (this.erreur = 'Impossible de mettre à jour ce paramètre.'),
    });
  }

  onAnnulerDemande() {
    if (!this.sessionId) return;
    this.chargement = true;

    this.imageService.annulerTraitement(this.sessionId).subscribe({
      next: (reponse) => {
        this.imageActuelle = reponse.image;
        this.historique = this.historique.slice(0, -1);
        this.rafraichirHistograme();
        this.chargement = false;
      },
      error: () => {
        this.erreur = "Impossible d'annuler.";
        this.chargement = false;
      },
    });
  }

  onExporterDemande() {
    if (!this.sessionId) return;

    this.imageService.exporterImage(this.sessionId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = 'image_exportee.png';
        lien.click();
        URL.revokeObjectURL(url);
      },
      error: () => (this.erreur = "Échec de l'export."),
    });
  }

  onComparaisonBasculee() {
    this.vueComparaison = !this.vueComparaison;
  }


  private rafraichirHistograme(): void {
    if (!this.sessionId) {
      return;
    }

    this.imageService.obtenirHistogramme(this.sessionId).subscribe({
      next: (Response) => {
        this.histogramme = Response.canaux;
      },
      error: () => {
        this.erreur= "Impossible de recuperer l'histograme"
      }
    })
  }
}