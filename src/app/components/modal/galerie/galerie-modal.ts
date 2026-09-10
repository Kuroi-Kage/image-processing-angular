import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

export interface ItemGalerie {
  sessionId: string;
  nomFichier: string;
  miniature: string;
}

@Component({
  selector: 'app-galerie-modal',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './galerie-modal.html',
  styleUrl: './galerie-modal.scss',
})
export class GalerieModal {
  @Input() items: ItemGalerie[] = [];
  @Input() sessionActive: string | null = null;

  @Output() fermer = new EventEmitter<void>();
  @Output() selectionner = new EventEmitter<string>();

  readonly X = X;
}