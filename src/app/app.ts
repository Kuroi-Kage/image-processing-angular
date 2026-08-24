import { ImageService } from "./services/image-service";
import { Viewer } from "./components/image-viewer/viewer/viewer";
import { Histogram } from "./components/histogram/histogram/histogram";
import { Toolbar } from "./components/toolbar/toolbar/toolbar";
import { NomTraitement, ParametreRequete } from "./models/image";
import { Component, signal } from "@angular/core";


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
  imports: [Viewer, Histogram, Toolbar],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})

export class App {
  sessionId = signal<string | null>(null);
  imageActuelle = signal<string | null>(null);
  imageOriginale = signal<string | null>(null);
  histogramme = signal<number[][] | null>(null);
  historique = signal<string[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);
  vueComparaison = signal(false);


  constructor(private imageService: ImageService) {}


  onImageImportee(fichier: File) {
    this.chargement.set(true);
    this.erreur.set(null);
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
    if (!this.sessionId()) {
      this.erreur.set(
        "Importer une image avant d'appliquer un traitement"
      );
      return;
    }

    this.chargement.set(true);
    this.erreur.set(null);
    this.imageService
      .appliquerTraitement(this.sessionId()!, nom)
      .subscribe({
        next: (reponse) => {
          this.imageActuelle.set(reponse.image);
          this.historique.update(historique => [
            ...historique,
            LIBELLES_TRAITEMENT[nom]
          ]);
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


  onParametreModifie(requete: ParametreRequete) {
    if (!this.sessionId()) return;
    this.imageService
      .configurerParametre(this.sessionId()!, requete)
      .subscribe({
        error: () => this.erreur.set(
          "Impossible de mettre à jour ce paramètre."
        ),
      });
  }


  onAnnulerDemande() {
    if (!this.sessionId()) return;
    this.chargement.set(true);
    this.imageService
      .annulerTraitement(this.sessionId()!)
      .subscribe({
        next: (reponse) => {
          this.imageActuelle.set(reponse.image);
          this.historique.update(historique =>
            historique.slice(0, -1)
          );
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
    if (!this.sessionId()) return;
    this.imageService
      .exporterImage(this.sessionId()!)
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
    if (!this.sessionId()) {
      return;
    }
    this.imageService
      .obtenirHistogramme(this.sessionId()!)
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