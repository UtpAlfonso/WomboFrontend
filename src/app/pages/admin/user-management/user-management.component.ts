import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, UserCreateRequest, UserUpdateRequest, UserService } from '../../../core/services/user.service';

// Importar el tipo 'Modal' de Bootstrap
declare var bootstrap: any; // Opcional, pero ayuda con el autocompletado si tienes @types/bootstrap

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, AfterViewInit {
  users: User[] = [];
  isLoading = true;
  isEditMode = false;
  selectedUserId: number | null = null;
  userForm!: FormGroup;
  
  availableRoles = ['ROLE_CLIENT', 'ROLE_WORKER', 'ROLE_ADMIN'];

  // Referencia al elemento del modal en el HTML y a su instancia de Bootstrap
  @ViewChild('userModal') userModalElement!: ElementRef;
  private userModal: any; // Aquí guardaremos la instancia del modal

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loadUsers();

    // La lógica de inicialización del formulario no cambia
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      roles: this.fb.group({
        ROLE_ADMIN: [false],
        ROLE_WORKER: [false],
        ROLE_CLIENT: [true]
      })
    });
  }
  
  ngAfterViewInit(): void {
    // Inicializar la instancia del modal de Bootstrap una vez que la vista esté lista
    if (this.userModalElement) {
      this.userModal = new bootstrap.Modal(this.userModalElement.nativeElement);
    }
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.isLoading = false;
    });
  }

  // --- MÉTODOS PARA CONTROLAR EL MODAL DE BOOTSTRAP ---

  openCreateModal(): void {
    this.isEditMode = false;
    this.userForm.reset({ roles: { ROLE_CLIENT: true } });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.userModal?.show();
  }

  openEditModal(user: User): void {
    this.isEditMode = true;
    this.selectedUserId = user.id;
    const rolesFormValue = {
      ROLE_ADMIN: user.roles.includes('ROLE_ADMIN'),
      ROLE_WORKER: user.roles.includes('ROLE_WORKER'),
      ROLE_CLIENT: user.roles.includes('ROLE_CLIENT')
    };
    this.userForm.patchValue({ ...user, roles: rolesFormValue });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userModal?.show();
  }

  closeModal(): void {
    this.userModal?.hide();
  }

  // --- MÉTODOS DE LÓGICA CRUD (sin cambios) ---

  onSubmit(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid) return;

    const selectedRoles = Object.keys(this.userForm.value.roles)
      .filter(role => this.userForm.value.roles[role]);

    const userData = { ...this.userForm.value, roles: selectedRoles };

    if (this.isEditMode) {
      const updateData: UserUpdateRequest = userData;
      if (!updateData.password) delete updateData.password;
      this.userService.updateUser(this.selectedUserId!, updateData).subscribe({
        next: () => this.handleSuccess('actualizado'),
        error: (err) => this.handleError(err)
      });
    } else {
      const createData: UserCreateRequest = userData;
      this.userService.createUser(createData).subscribe({
        next: () => this.handleSuccess('creado'),
        error: (err) => this.handleError(err)
      });
    }
  }

  deleteUser(userId: number): void {
    // Reemplazamos el ConfirmDialog de PrimeNG con el 'confirm' nativo del navegador
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          // Reemplazamos el Toast de PrimeNG con un 'alert' nativo
          alert('Usuario eliminado correctamente');
          this.loadUsers();
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }
  }
  
  private handleSuccess(action: string): void {
    alert(`Usuario ${action} con éxito.`);
    this.closeModal();
    this.loadUsers();
  }

  private handleError(err: any): void {
    console.error('Error al guardar el usuario:', err);
    const errorMessage = err.error?.message || err.error?.error || 'No se pudo completar la operación.';
    alert(`Error: ${errorMessage}`);
  }
}