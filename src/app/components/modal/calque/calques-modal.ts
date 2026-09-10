import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Eye, EyeOff, Plus, Trash2, ArrowUp, ArrowDown, Layers3 } from 'lucide-angular';

import { Calque } from '../../../models/image';

@Component({
  selector: 'app-calques-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './calques-modal.html',
  styleUrl: './calques-modal.scss',
})
export class CalquesModal {
  @Input() calques: Calque[] = [];
  @Input() imageBase64: string | null = null;

  @Output() fermer = new EventEmitter<void>();
  @Output() ajouterCalque = new EventEmitter<void>();
  @Output() supprimerCalque = new EventEmitter<string>();
  @Output() reglerCalque = new EventEmitter<{ id: string; reglages: Partial<Calque> }>();
  @Output() deplacerCalque = new EventEmitter<{ id: string; direction: 'haut' | 'bas' }>();
  @Output() fusionner = new EventEmitter<void>();

  readonly X = X;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly ArrowUp = ArrowUp;
  readonly ArrowDown = ArrowDown;
  readonly Layers3 = Layers3;

  readonly modesFusion = ['normal', 'multiplier', 'ecran', 'superposition'];

  onToggleVisibilite(calque: Calque) {
    this.reglerCalque.emit({ id: calque.id, reglages: { visible: !calque.visible } });
  }

  onChangeOpacite(calque: Calque, valeur: number) {
    this.reglerCalque.emit({ id: calque.id, reglages: { opacite: valeur } });
  }

  onChangeMode(calque: Calque, mode: string) {
    this.reglerCalque.emit({ id: calque.id, reglages: { mode_fusion: mode as Calque['mode_fusion'] } });
  }
}