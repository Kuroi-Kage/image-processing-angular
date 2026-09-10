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
import { AmeliorationModal, ReglagesAmelioration } from "./components/modal/amelioration-modal";
import { AideModal } from "./components/modal/aide-modal/aide-modal";
import { GalerieModal } from "./components/modal/galerie/galerie-modal";



const LIBELLES_TRAITEMENT: Record<NomTraitement, string> = {
  egalisation: "Égalisation de l'histogramme",
  niveaux_de_gris: "Conversion en niveau de gris",
  binarisation: "Binarisation",
  filtrage: "Filtrage / débruitage",
  contours: "Détection de contours",
  rotation: "Rotation",
  recadrage: "Recadrage",
  redimensionnement: "Redimensionnement",
  effacement: "Effacement",
  amelioration: "Amélioration",
};


@Component({
  selector: "app-root",
  standalone: true,
  imports: [LucideAngularModule, Viewer, Toolbar, AmeliorationModal, AideModal, GalerieModal],
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
  modalAmeliorationOuvert = signal(false);

  outilActif = signal('Sélection');
  selectionActuelle = signal<{ x: number; y: number; largeur: number; hauteur: number } | null>(null);
  suggestionInitiale = signal<{ reglage: string; valeur: number } | null>(null);
  avertissement = signal<string | null>(null);
  modalAideOuvert = signal(false);
  galerie = signal<{ sessionId: string; nomFichier: string; miniature: string }[]>([]);
  modalGalerieOuvert = signal(false);

  constructor(private imageService: ImageService) { }

  onOutilChoisi(outil: string) {
    this.outilActif.set(outil);

    if (outil === 'Sélection') {
      this.vueComparaison.set(false);
    }
  }

  onSelectionChange(selection: { x: number; y: number; largeur: number; hauteur: number } | null) {
    this.selectionActuelle.set(selection);
  }

  private envoyerZoneEtAppliquer(nomTraitement: NomTraitement) {
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
      next: () => this.onTraitementDemande(nomTraitement),
      error: () => {
        this.erreur.set("Impossible d'envoyer la zone de recadrage");
        this.chargement.set(false);
      },
    });
  }

  onRecadrerDemande() {
    this.envoyerZoneEtAppliquer('recadrage' as NomTraitement);
  }

  onEffacerDemande() {
    this.envoyerZoneEtAppliquer('effacement' as NomTraitement);
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
        this.galerie.update((g) => [
          ...g,
          { sessionId: response.session_id, nomFichier: fichier.name, miniature: response.image },
        ]);
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
    this.avertissement.set(null);

    this.imageService
      .appliquerTraitement(id, nom)
      .subscribe({
        next: (reponse) => {
          this.imageActuelle.set(reponse.image);
          this.historique.update((h) => [LIBELLES_TRAITEMENT[nom], ...h].slice(0, 6));
          if (reponse.avertissements && reponse.avertissements.length > 0) {
            this.avertissement.set(reponse.avertissements.join('.'));
          }
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

    onRetablirDemande() {
    const id = this.sessionId();
    if (!id) return;
    this.chargement.set(true);

    this.imageService.retablirTraitement(id).subscribe({
      next: (reponse) => {
        this.imageActuelle.set(reponse.image);
        this.rafraichirHistograme();
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Impossible de rétablir.");
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
          lien.download = this.construireNomExport();
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

  onRenommer(event: FocusEvent) {
    if (!this.imageActuelle()) return;
    const nouveauNom = (event.target as HTMLElement).innerText.trim();
    if (nouveauNom) {
      this.nomFichier.set(nouveauNom);
    } else {
      (event.target as HTMLElement).innerText = this.nomFichier() ?? '';
    }
  }

  onAmeliorerDemande(reglages: ReglagesAmelioration) {
    this.modalAmeliorationOuvert.set(false);
    const id = this.sessionId();
    if (!id) {
      this.erreur.set("Importe une image avant d'appliquer une amélioration.");
      return;
    }
    this.chargement.set(true);

    const parametres: ParametreRequete[] = Object.entries(reglages).map(([cle, valeur]) => ({ cle, valeur }));

    forkJoin(parametres.map((p) => this.imageService.configurerParametre(id, p))).subscribe({
      next: () => this.onTraitementDemande('amelioration' as NomTraitement),
      error: () => {
        this.erreur.set("Impossible d'envoyer les réglages d'amélioration.");
        this.chargement.set(false);
      },
    });
  }

  onOuvrirAmelioration(suggestion: { reglage: string; valeur: number } | null) {
    this.suggestionInitiale.set(suggestion);
    this.modalAmeliorationOuvert.set(true);
  }

    onSelectionnerGalerie(sessionId: string) {
    this.chargement.set(true);
    this.imageService.obtenirEtatSession(sessionId).subscribe({
      next: (reponse) => {
        this.sessionId.set(sessionId);
        this.imageActuelle.set(reponse.image);
        this.imageOriginale.set(reponse.image_original);
        this.historique.set([]); 
        this.rafraichirHistograme();
        this.modalGalerieOuvert.set(false);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger cette image.');
        this.chargement.set(false);
      },
    });
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

  private construireNomExport(): string {
    const original = this.nomFichier();
    if (!original) return "image_exportee.png";

    const sansExtension = original.replace(/\.[^/.]+/, "");
    return `${sansExtension}_modifiee.png`;
  }
}