import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Transforma una URL (string) en una SafeUrl en la que Angular confía.
   * Maneja de forma segura los valores nulos o indefinidos.
   * @param url La URL a procesar, que puede ser un string, null o undefined.
   * @returns Un objeto SafeUrl, o null si la entrada era nula.
   */
  transform(url: string | null | undefined): SafeUrl | null {
    if (!url) {
      return null; // Si la URL es nula o vacía, devolvemos null
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}