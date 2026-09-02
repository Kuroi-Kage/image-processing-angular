import { Component, Input, Output, EventEmitter} from '@angular/core';
import { LucideAngularModule, Eye, MousePointer2, ZoomIn, ZoomOut, LoaderCircle, BarChart3, RotateCcw } from 'lucide-angular';
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
  @Output() selectionChange = new EventEmitter<{x: number; y: number; largeur: number; hauteur: number} | null>();

  debutSelection: {x: number; y: number } | null = null;
  selectionCourante: { x: number; y: number; largeur: number; hauteur: number} | null = null;


  zoom = 100;

  readonly Eye = Eye;
  readonly MousePointer2 = MousePointer2;
  readonly ZoomIn = ZoomIn;
  readonly ZoomOut = ZoomOut;
  readonly LoaderCircle = LoaderCircle;
  readonly BarChart3 = BarChart3;
  readonly RotateCcw = RotateCcw;

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
    this.debutSelection = { x: event.clientX - rect.left, y: event.clientY - rect.top};

  }

  onMouseUp(imageEl: HTMLImageElement) {
    if (!this.selectionCourante) return
    this.debutSelection = null;

    const ratioX = imageEl.naturalWidth / imageEl.clientWidth;
    const ratioY = imageEl.naturalHeight / imageEl.clientHeight;

    this.selectionChange.emit({
      x: Math.round(this.selectionCourante.x * ratioX),
      y: Math.round(this.selectionCourante.y * ratioX),
      largeur: Math.round(this.selectionCourante.largeur * ratioX),
      hauteur: Math.round(this.selectionCourante.hauteur * ratioY),
    });

  }
}
