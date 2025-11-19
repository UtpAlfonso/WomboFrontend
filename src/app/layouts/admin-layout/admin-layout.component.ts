import { Component, signal } from '@angular/core'; // <-- 1. Importa 'signal'
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  
  // --- CAMBIOS CLAVE AQUÍ ---

  // 2. Creamos una señal 'isSidebarVisible' con un valor inicial de 'false'.
  // Una señal es un contenedor de valor que notifica a Angular cuando su valor cambia.
  public isSidebarVisible = signal(false);

  /**
   * Método para cambiar el estado de la señal.
   * Usa el método 'update' para cambiar el valor basado en su estado anterior.
   */
  public toggleSidebar(): void {
    this.isSidebarVisible.update(value => !value);
  }

  /**
   * Método para cerrar el sidebar.
   * Usa el método 'set' para establecer un valor específico.
   */
  public closeSidebar(): void {
    this.isSidebarVisible.set(false);
  }
}