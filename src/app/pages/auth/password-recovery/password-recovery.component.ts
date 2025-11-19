import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
@Component({
selector: 'app-password-recovery',
standalone: true,
imports: [CommonModule, ReactiveFormsModule, RouterModule],
templateUrl: './password-recovery.component.html',
styleUrls: ['./password-recovery.component.scss']
})
export class PasswordRecoveryComponent implements OnInit {
recoveryForm!: FormGroup;
message = '';
isSuccess = false;
isLoading = false;
constructor(
private fb: FormBuilder,
private authService: AuthService
) {}
ngOnInit(): void {
this.recoveryForm = this.fb.group({
email: ['', [Validators.required, Validators.email]]
});
}
onSubmit(): void {
this.recoveryForm.markAllAsTouched();
if (this.recoveryForm.invalid) {
return;
}

this.isLoading = true;
this.message = '';
const email = this.recoveryForm.value.email;

this.authService.requestPasswordRecovery(email).subscribe({
  next: () => {
    this.isSuccess = true;
    // Mensaje genérico por seguridad, para no confirmar si un email existe o no.
    this.message = 'Si existe una cuenta asociada a este correo, hemos enviado un enlace para restablecer tu contraseña.';
    this.recoveryForm.disable(); // Deshabilitar el formulario después del envío
  },
  error: (err) => {
    // Aunque el backend siempre devuelve 200 OK, manejamos un error de red por si acaso.
    this.isSuccess = false;
    this.message = 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.';
    console.error('Error en la solicitud de recuperación:', err);
  },
  complete: () => {
    this.isLoading = false;
  }
});
}
}