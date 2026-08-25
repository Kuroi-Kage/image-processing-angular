import { Component, Input, Output, EventEmitter} from '@angular/core';
import { LucideAngularModule, Eye, MousePointer2, ZoomIn, ZoomOut, LoaderCircle, BarChart3 } from 'lucide-angular';
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

  @Output() comparaisonBasculee = new EventEmitter<void>();

  zoom = 100;

  readonly Eye = Eye;
  readonly MousePointer2 = MousePointer2;
  readonly ZoomIn = ZoomIn;
  readonly ZoomOut = ZoomOut;
  readonly LoaderCircle = LoaderCircle;
  readonly BarChart3 = BarChart3;

  zoomArriere() {
    this.zoom = Math.max(50, this.zoom - 10);
  }

  zoomAvant() {
    this.zoom = Math.min(200, this.zoom + 10);
  }
}
