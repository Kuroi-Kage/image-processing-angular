import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-viewer',
  imports: [],
  templateUrl: './viewer.html',
  styleUrl: './viewer.scss',
})
export class Viewer {
  @Input() imageBase64: string | null = null;

  @Input() imageOriginaleBase64: string | null = null;

  @Input() vueComparaison = false;
}
