import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token: string | null = null;
  message = '';
  isSuccess = false;
  isLoading = false;

  constructor(
    private route: ActivatedRoute, // Para leer parámetros de la URL
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Capturar el token del parámetro 'token' en la URL
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.isSuccess = false;
      this.message = 'El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.';
      this.resetForm.disable();
    }
  }

  onSubmit(): void {
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid || !this.token) {
      return;
    }

    this.isLoading = true;
    this.message = '';
    const newPassword = this.resetForm.value.newPassword;

    this.authService.processResetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = '¡Tu contraseña ha sido restablecida con éxito! Serás redirigido al login en 3 segundos.';
        this.resetForm.disable();
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.isSuccess = false;
        this.message = err.error?.message || 'El enlace es inválido o ha expirado. Por favor, intenta de nuevo.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}