import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Módulo para formularios reactivos
    RouterModule         // Módulo para usar routerLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup; // Usamos '!' para indicar que se inicializará en el constructor.
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Es una buena práctica inicializar el formulario en ngOnInit.
    this.loginForm = this.fb.group({
      // El primer argumento es el valor inicial, el segundo son los validadores.
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  /**
   * Método que se ejecuta al enviar el formulario.
   */
  onSubmit(): void {
    // Marcar todos los campos como "tocados" para mostrar los mensajes de error si es necesario.
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return; // Si el formulario no es válido, no hacemos nada.
    }

    // Limpiamos el mensaje de error previo.
    this.errorMessage = '';

    // Llamamos al servicio de autenticación.
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // Si el login es exitoso, navegamos al dashboard correspondiente.
        this.navigateToDashboard();
      },
      error: (err) => {
        // Si el backend devuelve un error, lo mostramos.
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'El correo o la contraseña son incorrectos.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
        }
        console.error('Error de autenticación:', err);
      }
    });
  }

  /**
   * Navega al dashboard correspondiente según el rol del usuario.
   */
  private navigateToDashboard(): void {
    const user = this.authService.currentUserValue;
    if (!user) {
      this.router.navigate(['/']); // Ruta por defecto si no se encuentra el usuario.
      return;
    }

    // Comprobamos los roles. Es importante buscar el rol completo 'ROLE_ADMIN'.
    if (user.roles.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin']);
    } else if (user.roles.includes('ROLE_WORKER')) {
      this.router.navigate(['/worker']);
    } else {
      this.router.navigate(['/']); // Los clientes van a la página principal.
    }
  }
}