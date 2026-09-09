import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Check, X } from 'lucide-angular';

export interface ReglagesAmelioration {
  luminosite: number; contraste: number; saturation: number; exposition: number;
  temperature: number; teinte: number; nettete: number; flou: number;
}

@Component({
  selector: 'app-amelioration-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './amelioration-modal.html',
  styleUrl: './amelioration-modal.scss',
})
export class AmeliorationModal {
  @Input() imageBase64: string | null = null;

  @Output() valider = new EventEmitter<ReglagesAmelioration>();
  @Output() annuler = new EventEmitter<void>();
  @Input() suggestionInitiale: { reglage: string; valeur: number } | null = null;

  ngOnInit() {
    if (this.suggestionInitiale) {
      (this as any)[this.suggestionInitiale.reglage] = this.suggestionInitiale.valeur;
    }
  }

  readonly Check = Check;
  readonly X = X;

  luminosite = 0;
  contraste = 0;
  saturation = 0;
  exposition = 0;
  temperature = 0;
  teinte = 0;
  nettete = 0;
  flou = 0;

  get filtreApercu(): string {
    return [
      `brightness(${1 + this.luminosite / 100})`,
      `contrast(${1 + this.contraste / 100})`,
      `saturate(${1 + this.saturation / 100})`,
      `hue-rotate(${this.teinte}deg)`,
      `blur(${this.flou}px)`,
    ].join(' ');
  }

  onValider() {
    this.valider.emit({
      luminosite: this.luminosite, contraste: this.contraste, saturation: this.saturation,
      exposition: this.exposition, temperature: this.temperature, teinte: this.teinte,
      nettete: this.nettete, flou: this.flou,
    });
  }
}