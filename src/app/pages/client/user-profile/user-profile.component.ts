import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService, UserProfile } from '../../../core/services/auth.service';
import { UserService, ProfileUpdateRequest } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  currentUser$: Observable<UserProfile | null>;
  profileForm!: FormGroup;
  
  // Variable para controlar la visibilidad del modal
  isModalOpen = false;

  constructor(
    public authService: AuthService, // Lo hacemos público para usarlo en el template
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      password: ['', [Validators.minLength(6)]] // La contraseña es opcional
    });
  }

  /**
   * Abre el modal para editar el perfil, rellenando el formulario
   * con los datos actuales del usuario.
   */
  openEditModal(user: UserProfile): void {
    this.profileForm.patchValue({
      nombre: (user as any).nombre ?? '',
      apellido: (user as any).apellido ?? '',
      password: '' // Limpiar el campo de contraseña por seguridad
    });
    this.isModalOpen = true;
  }

  /**
   * Cierra el modal.
   */
  closeModal(): void {
    this.isModalOpen = false;
  }

  /**
   * Se ejecuta al enviar el formulario del modal.
   */
  onSubmit(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) return;

    const profileData: ProfileUpdateRequest = this.profileForm.value;
    
    // Si la contraseña está vacía, la eliminamos del objeto para no enviarla al backend.
    if (!profileData.password?.trim()) {
      delete profileData.password;
    }

    this.userService.updateProfile(profileData).subscribe({
      next: () => {
        alert('Perfil actualizado con éxito. Los cambios se reflejarán completamente la próxima vez que inicies sesión.');
        this.closeModal();
        // Para ver el nombre actualizado inmediatamente, se podría forzar un logout y login,
        // o que el backend devuelva un nuevo token y lo actualicemos aquí.
        // Por simplicidad, por ahora solo cerramos el modal.
      },
      error: (err) => {
        alert('Error al actualizar el perfil.');
        console.error(err);
      }
    });
  }
}