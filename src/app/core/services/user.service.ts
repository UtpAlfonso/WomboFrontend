import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaz para la respuesta de la API (lo que se muestra en la tabla)
export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[];
}

// Interfaz para la petición de CREACIÓN (payload que se envía)
export interface UserCreateRequest {
  nombre: string;
  apellido: string;
  email: string;
  password?: string; // Es opcional aquí, pero requerido por el validador en el form
  roles: string[];
}

// Interfaz para la petición de ACTUALIZACIÓN (payload que se envía)
export interface UserUpdateRequest {
  nombre: string;
  apellido: string;
  email: string;
  password?: string; // Es opcional, para no forzar el cambio de contraseña
  roles: string[];
}

export interface ProfileUpdateRequest {
  nombre: string;
  apellido: string;
  password?: string;
}


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
  
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
  
  createUser(userData: UserCreateRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }
  
  updateUser(id: number, userData: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateProfile(profileData: ProfileUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, profileData);
  }
}