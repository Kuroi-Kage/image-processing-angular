import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-histogram',
  imports: [],
  templateUrl: './histogram.html',
  styleUrl: './histogram.scss',
})
export class Histogram implements AfterViewInit, OnChanges{
  @Input() canaux: number[][] | null = null;

  @ViewChild('canvasHisto') canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
      this.dessiner();
  }

  ngOnChanges(): void {
      this.dessiner();
  }

  private dessiner() {
    if (!this.canvasRef || !this.canaux) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const couleurs = ['#e74c3c', '#2ecc71', '#3498db'];

    this.canaux.forEach((valeurs, indexCanal) => {
      const max = Math.max(...valeurs, 1);
      ctx.strokeStyle = this.canaux!.length === 1 ? '#888' : couleurs[indexCanal]
      ctx.beginPath()
      valeurs.forEach((valeur, x) => {
        const y = canvas.height - (valeur / max) * canvas.height;
        const xPos = (x / valeurs.length) * canvas.width;
        x === 0 ? ctx.moveTo(xPos, y) : ctx.lineTo(xPos, y);
      });
      ctx.stroke();
   });
  }
}
