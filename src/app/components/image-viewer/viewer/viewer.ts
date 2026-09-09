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
