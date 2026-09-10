import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ImportResponse,
  TraitementResponse,
  AnnulerResponse, 
  HistogrammeResponse, 
  NomTraitement, 
  ParametreRequete, 
  InstructionsResponse, 
  InstructionsRequete, 
  RetablirResponse, 
  EtatSessionResponse, AjouterCalqueResponse, ReglageCalqueRequete
} from '../models/image';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  importerImage(fichier: File): Observable<ImportResponse> {
    const formData = new FormData();
    formData.append('fichier', fichier);
    return this.http.post<ImportResponse>(`${this.baseUrl}/images`, formData);
  }

  appliquerTraitement(session_id: string, nom: NomTraitement): Observable<TraitementResponse> {
    return this.http.post<TraitementResponse>(
       `${this.baseUrl}/images/${session_id}/traitements/${nom}`,
      {}
    );
  }


  annulerTraitement(session_id: string): Observable<AnnulerResponse> {
    return this.http.post<AnnulerResponse>(`${this.baseUrl}/images/${session_id}/annuler`, {});
  }

  obtenirHistogramme(session_id: string): Observable<HistogrammeResponse> {
    return this.http.get<HistogrammeResponse>(`${this.baseUrl}/images/${session_id}/histogramme`);
  }

  configurerParametre(session_id: string, requete: ParametreRequete): Observable<{ok: boolean}> {
    return this.http.post<{ ok: boolean }>(
      `${this.baseUrl}/images/${session_id}/parametres`,
      requete
    );
  }


  exporterImage(session_id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/images/${session_id}/export`, {
      responseType: 'blob',
    });
  }

  interpreterInstructions(sessionId: string, requete: InstructionsRequete): Observable<InstructionsResponse> {
    return this.http.post<InstructionsResponse>(
      `${this.baseUrl}/images/${sessionId}/instructions`,
      requete
    );
  }

  obtenirEtatSession(sessionId: string): Observable<EtatSessionResponse> {
    return this.http.get<EtatSessionResponse>(`${this.baseUrl}/images/${sessionId}`);
  }

  retablirTraitement(session_id: string): Observable<RetablirResponse> {
    return this.http.post<RetablirResponse>(`${this.baseUrl}/images/${session_id}/retablir`, {});
  }

  ajouterCalque(sessionId: string): Observable<AjouterCalqueResponse> {
    return this.http.post<AjouterCalqueResponse>(`${this.baseUrl}/images/${sessionId}/calques`, {});
  }

  supprimerCalque(sessionId: string, calqueId: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.baseUrl}/images/${sessionId}/calques/${calqueId}`);
  }

  reglerCalque(sessionId: string, calqueId: string, reglages: ReglageCalqueRequete): Observable<{ ok: boolean }> {
    return this.http.patch<{ ok: boolean }>(`${this.baseUrl}/images/${sessionId}/calques/${calqueId}`, reglages);
  }

  reordonnerCalques(sessionId: string, ordre: string[]): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.baseUrl}/images/${sessionId}/calques/ordre`, { ordre });
  }

  fusionnerCalques(sessionId: string): Observable<TraitementResponse> {
    return this.http.post<TraitementResponse>(`${this.baseUrl}/images/${sessionId}/calques/fusionner`, {});
  }

}


