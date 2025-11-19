import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Order, OrderService, ReturnRequest} from '../../../core/services/order.service';

@Component({
  selector: 'app-returns-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './returns-management.component.html',
  styleUrls: ['./returns-management.component.scss']
})
export class ReturnsManagementComponent {
  searchControl = new FormControl('', [Validators.required, Validators.min(1)]);
  searchedOrder: Order | null = null;
  isLoading = false;
  errorMessage = '';

  returnForm!: FormGroup;

  constructor(private orderService: OrderService, private fb: FormBuilder) {}

  searchOrder(): void {
    if (this.searchControl.invalid) return;
    
    this.isLoading = true;
    this.searchedOrder = null;
    this.errorMessage = '';

    const orderIdString = this.searchControl.value;
    
    // 2. Lo convertimos a un número.
    const orderIdNumber = parseInt(this.searchControl.value!, 10);

  // Verificación adicional por si algo sale mal (buena práctica)
  if (isNaN(orderIdNumber)) {
      this.errorMessage = "El ID del pedido debe ser un número.";
      this.isLoading = false;
      return;
  }


    this.orderService.getOrderById(orderIdNumber).subscribe({
      next: (order) => {
        if (order.estado !== 'ENTREGADO') {
            this.errorMessage = `No se puede procesar una devolución para este pedido. Estado actual: ${order.estado}`;
            this.isLoading = false;
            return;
        }
        this.searchedOrder = order;
        this.buildReturnForm(order);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se encontró ningún pedido con ese ID.';
        this.isLoading = false;
      }
    });
  }

   buildReturnForm(order: Order): void {
    this.returnForm = this.fb.group({
      devolverAlStock: [true],
      items: this.fb.array(order.detalles.map(detalle => this.fb.group({
        detallePedidoId: [detalle.id], // Ahora 'detalle.id' existe y se guarda en el form
        productoNombre: [detalle.productoNombre],
        cantidadComprada: [detalle.cantidad],
        cantidadADevolver: [0, [Validators.required, Validators.min(0), Validators.max(detalle.cantidad)]],
        // --- CORRECCIÓN DE VALIDACIÓN ---
        // Hacemos que el motivo sea opcional en el frontend
        motivo: [''] 
      })))
    });
  }
  get returnItems(): FormArray {
    return this.returnForm.get('items') as FormArray;
  }

  submitReturn(): void {
    this.returnForm.markAllAsTouched();
    if (this.returnForm.invalid) return;

    const formValue = this.returnForm.value;
    const itemsToReturn = formValue.items.filter((item: any) => item.cantidadADevolver > 0);

    if (itemsToReturn.length === 0) {
      alert('Debes especificar una cantidad a devolver para al menos un producto.');
      return;
    }

    // --- LÓGICA DE ENVÍO CORREGIDA ---
    const returnData: ReturnRequest = {
      pedidoId: this.searchedOrder!.id,
      devolverAlStock: formValue.devolverAlStock,
      items: itemsToReturn.map((item: any) => {
        // Validación para asegurar que si hay cantidad, haya motivo
        if (item.cantidadADevolver > 0 && (!item.motivo || item.motivo.trim() === '')) {
          throw new Error(`Debes especificar un motivo para devolver "${item.productoNombre}".`);
        }
        return {
          detallePedidoId: item.detallePedidoId,
          cantidadADevolver: item.cantidadADevolver,
          motivo: item.motivo
        };
      })
    };

    // Usar un try-catch por si la validación de arriba falla
    try {
      this.orderService.processReturn(returnData).subscribe({
        next: () => {
          alert('Devolución procesada con éxito.');
          this.searchedOrder = null;
          this.searchControl.reset();
        },
        error: (err) => {
          alert(`Error al procesar la devolución: ${err.error.message || 'Error desconocido'}`);
        }
      });
    } catch (e: any) {
      alert(e.message);
    }
  }
}