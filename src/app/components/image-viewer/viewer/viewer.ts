import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule, Eye, MousePointer2, ZoomIn, ZoomOut, LoaderCircle, BarChart3, RotateCcw, Upload } from 'lucide-angular';
import { Histogram } from '../../histogram/histogram/histogram';

@Component({
  selector: 'app-viewer',
  imports: [LucideAngularModule, Histogram],
  templateUrl: './viewer.html',
  styleUrl: './viewer.scss',
})
export class Viewer {
  @Input() imageBase64: string | null = null;

  @Input() imageOriginaleBase64: string | null = null;
  @Input() vueComparaison = true;

  @Input() chargement = false;
  @Input() histogramme: number[][] | null = null;
  @Input() outilActif = 'Selection';

  @Output() comparaisonBasculee = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<{ x: number; y: number; largeur: number; hauteur: number } | null>();

  debutSelection: { x: number; y: number } | null = null;
  selectionCourante: { x: number; y: number; largeur: number; hauteur: number } | null = null;
  @Output() imageImportee = new EventEmitter<File>();
  @Output() ouvrirAmelioration = new EventEmitter<{ reglage: string; valeur: number } | null>();


  zoom = 100;

  readonly Eye = Eye;
  readonly MousePointer2 = MousePointer2;
  readonly ZoomIn = ZoomIn;
  readonly ZoomOut = ZoomOut;
  readonly LoaderCircle = LoaderCircle;
  readonly BarChart3 = BarChart3;
  readonly RotateCcw = RotateCcw;
  readonly Upload = Upload;



  onFichierChoisi(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageImportee.emit(input.files[0]);
    }
  }

  zoomArriere() {
    this.zoom = Math.max(50, this.zoom - 10);
  }

  zoomAvant() {
    this.zoom = Math.min(200, this.zoom + 10);
  }

  reinitialiserZoom() {
    this.zoom = 100;
  }

  onMouseMove(event: MouseEvent, imageEl: HTMLImageElement) {
    if (!this.debutSelection) return;
    const rect = imageEl.getBoundingClientRect();
    const xActuel = event.clientX - rect.left;
    const yActuel = event.clientY - rect.top;
    this.selectionCourante = {
      x: Math.min(this.debutSelection.x, xActuel),
      y: Math.min(this.debutSelection.y, yActuel),
      largeur: Math.abs(xActuel - this.debutSelection.x),
      hauteur: Math.abs(yActuel - this.debutSelection.y),
    };
  }

  onMouseDown(event: MouseEvent, imageEl: HTMLImageElement) {
    if (this.outilActif !== 'Sélection') return;
    const rect = imageEl.getBoundingClientRect();
    this.debutSelection = { x: event.clientX - rect.left, y: event.clientY - rect.top };

  }

  onMouseUp(imageEl: HTMLImageElement) {
    if (!this.selectionCourante) return
    this.debutSelection = null;

    const { largeurAffichee, hauteurAffichee, decalageX, decalageY } = this.getZoneAffichee(imageEl);

    const ratioX = imageEl.naturalWidth / largeurAffichee;
    const ratioY = imageEl.naturalHeight / hauteurAffichee;

    const x = Math.min(Math.max(0, this.selectionCourante.x - decalageX), largeurAffichee);
    const y = Math.min(Math.max(0, this.selectionCourante.y - decalageY), hauteurAffichee);
    const largeur = Math.min(this.selectionCourante.largeur, largeurAffichee - x);
    const hauteur = Math.min(this.selectionCourante.hauteur, hauteurAffichee - y);

    this.selectionChange.emit({
      x: Math.round(x * ratioX),
      y: Math.round(y * ratioY),
      largeur: Math.round(largeur * ratioX),
      hauteur: Math.round(hauteur * ratioY),
    });

  }

  get suggestionAmelioration(): { texte: string; reglage: string; valeur: number } | null {
    const stats = this.statistiquesHistogramme;
    if (!stats) return null;

    if (stats.moyenne < 85) {
      const valeur = Math.min(40, Math.round((100 - stats.moyenne) / 2));
      return { texte: 'Image plutôt sombre — augmenter la luminosité pourrait aider.', reglage: 'luminosite', valeur };
    }
    if (stats.moyenne > 170) {
      const valeur = -Math.min(40, Math.round((stats.moyenne - 155) / 2));
      return { texte: 'Image plutôt claire — réduire légèrement la luminosité pourrait aider.', reglage: 'luminosite', valeur };
    }
    if (stats.ecartType < 30) {
      return { texte: 'Faible contraste — augmenter le contraste pourrait faire ressortir les détails.', reglage: 'contraste', valeur: 30 };
    }
    return null;
  }


  get statistiquesHistogramme(): { moyenne: number; ecartType: number; contraste: string } | null {
  if (!this.histogramme || this.histogramme.length < 3) return null;

  const [r, g, b] = this.histogramme;
  const poids = [0.299, 0.587, 0.114];
  const nbIntensites = r.length;
  const canalLuminance: number[] = new Array(nbIntensites).fill(0);

  [r, g, b].forEach((canal, idxCanal) => {
    canal.forEach((frequence, intensite) => {
      canalLuminance[intensite] += frequence * poids[idxCanal];
    });
  });

  const total = canalLuminance.reduce((s, f) => s + f, 0);
  if (total === 0) return null;

  const moyenne = canalLuminance.reduce((s, f, i) => s + f * i, 0) / total;
  const variance = canalLuminance.reduce((s, f, i) => s + f * Math.pow(i - moyenne, 2), 0) / total;
  const ecartType = Math.sqrt(variance);

  const contraste = ecartType < 30
    ? 'Contraste faible'
    : ecartType > 70
      ? 'Contraste élevé'
      : 'Contraste normal';

  return {
    moyenne: Math.round(moyenne),
    ecartType: Math.round(ecartType),
    contraste,
  };
}


  private getZoneAffichee(imageEl: HTMLImageElement) {
    const rect = imageEl.getBoundingClientRect();
    const ratioNaturel = imageEl.naturalWidth / imageEl.naturalHeight;
    const ratioBoite = rect.width / rect.height;

    let largeurAffichee: number;
    let hauteurAffichee: number;
    let decalageX: number;
    let decalageY: number;

    if (ratioNaturel > ratioBoite) {

      largeurAffichee = rect.width;
      hauteurAffichee = rect.width / ratioNaturel;
      decalageX = 0;
      decalageY = (rect.height - hauteurAffichee) / 2;
    } else {
      hauteurAffichee = rect.height;
      largeurAffichee = rect.height * ratioNaturel;
      decalageY = 0;
      decalageX = (rect.width - largeurAffichee) / 2;
    }

    return { largeurAffichee, hauteurAffichee, decalageX, decalageY };
  }
}
