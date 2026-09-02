import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ImportResponse, TraitementResponse, AnnulerResponse, HistogrammeResponse, NomTraitement, ParametreRequete, InstructionsResponse, InstructionsRequete } from '../models/image';
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
}

