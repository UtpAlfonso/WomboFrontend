import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product, ProductRequest, ProductService } from '../../../core/services/product.service';
import { finalize } from 'rxjs/internal/operators/finalize';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.scss']
})
export class InventoryManagementComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;
  isModalOpen = false;
  isEditMode = false;
  selectedProductId: number | null = null;
  productForm!: FormGroup;

  // --- Propiedades para la subida de archivos ---
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isDragging = false; // Para el efecto visual de arrastrar y soltar
  isSubmitting = false;

  categories = [{ id: 1, nombre: 'Educativos' }, { id: 2, nombre: 'Colección' }];

  constructor(private productService: ProductService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadProducts();
    this.productForm = this.fb.group({
      sku: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      umbralAlerta: [10, [Validators.required, Validators.min(0)]],
      categoriaId: [null, Validators.required],
      proveedorId: [null]
      // Ya no necesitamos el campo 'imageUrl' en el formulario
    });
  }

  loadProducts(): void {
    this.isLoading = true; // 1. Activa el indicador de carga
    console.log('Iniciando carga de productos...'); // Log para depuración

    this.productService.getProducts().pipe(
      // 2. El bloque finalize() se ejecutará SIEMPRE, al final de la operación,
      //    tanto si la petición tuvo éxito (next) como si falló (error).
      finalize(() => {
        this.isLoading = false; // 3. Desactiva el indicador de carga en cualquier escenario
        console.log('La petición de productos ha finalizado.'); // Log para depuración
      })
    ).subscribe({
      // 4. Se ejecuta si la petición HTTP devuelve una respuesta exitosa (código 2xx)
      next: (data) => {
        console.log('Productos recibidos exitosamente:', data); // Log para ver los datos
        this.products = data; // Asigna los datos recibidos a la variable local
      },
      // 5. Se ejecuta si la petición HTTP falla (código 4xx o 5xx)
      error: (err) => {
        console.error('Ha ocurrido un error al cargar los productos:', err);
        // Opcional: mostrar un mensaje de error al usuario
        alert('No se pudieron cargar los productos. Por favor, revisa la consola del navegador para más detalles.');
      }
    });
  }

  // --- MÉTODOS DE MANEJO DEL MODAL ---
  openCreateModal(): void {
    this.isEditMode = false;
    this.productForm.reset({ stock: 0, umbralAlerta: 10 });
    this.resetImageState();
    this.isModalOpen = true;
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.selectedProductId = product.id;
    this.resetImageState();
    
    const categoria = this.categories.find(c => c.nombre === product.categoriaNombre);
    
    this.productForm.patchValue({
      ...product,
      categoriaId: categoria ? categoria.id : null
    });

    if (product.imageUrl) {
      this.imagePreview = product.imageUrl; // Mostrar la imagen actual del producto
    }
    
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  // --- MÉTODOS DE MANEJO DE ARCHIVOS ---
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file: File): void {
    // Validar tipo de archivo (opcional pero recomendado)
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona solo archivos de imagen.');
      return;
    }
    
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result;
    reader.readAsDataURL(file);
  }
  
  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  private resetImageState(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.isSubmitting = false;
  }

  // --- MÉTODO DE ENVÍO DEL FORMULARIO ---
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    // En modo creación, la imagen es obligatoria
    if (!this.isEditMode && !this.selectedFile) {
      alert('Debes seleccionar una imagen para el nuevo producto.');
      return;
    }

    this.isSubmitting = true;
    const productData: ProductRequest = this.productForm.value;

    const operation = this.isEditMode
      ? this.productService.updateProduct(this.selectedProductId!, productData, this.selectedFile ?? undefined)
      : this.productService.createProduct(productData, this.selectedFile!);

    operation.subscribe({
      next: () => {
        alert(`Producto ${this.isEditMode ? 'actualizado' : 'creado'} con éxito.`);
        this.closeModal();
        this.loadProducts();
      },
      error: (err) => {
        alert('Ocurrió un error al guardar el producto.');
        console.error(err);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        alert('Producto eliminado.');
        this.loadProducts();
      });
    }
  }
}