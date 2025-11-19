import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { ReportService, SalesReport } from '../../../core/services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    CurrencyPipe, 
    DatePipe, 
    BaseChartDirective // Componente para renderizar el gráfico
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [
    provideCharts(withDefaultRegisterables()) // Proveedor necesario para ng2-charts
  ]
})
export class ReportsComponent implements OnInit {
  filterForm!: FormGroup;
  report: SalesReport | null = null;
  isLoading = false;
  errorMessage = '';

  // --- Configuración para el Gráfico de Barras (Ventas por Día) ---
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: {}, y: { min: 0 } },
    plugins: { legend: { display: true, position: 'top' } }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  // --- Configuración para el Gráfico de Pastel (Top Productos) ---
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'right' } }
  };
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  constructor(private fb: FormBuilder, private reportService: ReportService) {}

  ngOnInit(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30); // Reporte inicial de los últimos 30 días

    this.filterForm = this.fb.group({
      startDate: [this.formatDate(startDate), Validators.required],
      endDate: [this.formatDate(endDate), Validators.required]
    });
    
    // Generar el reporte inicial al cargar la página
    this.generateReport();
  }

  generateReport(): void {
    this.filterForm.markAllAsTouched();
    if (this.filterForm.invalid) return;

    this.isLoading = true;
    this.report = null;
    this.errorMessage = '';
    const { startDate, endDate } = this.filterForm.value;

    if (new Date(startDate) > new Date(endDate)) {
      this.errorMessage = 'La fecha de inicio no puede ser posterior a la fecha de fin.';
      this.isLoading = false;
      return;
    }

    this.reportService.getSalesReport(startDate, endDate).subscribe({
      next: (data) => {
        this.report = data;
        this.setupCharts(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudo generar el reporte. Inténtalo de nuevo más tarde.';
        this.isLoading = false;
        console.error('Error al generar el reporte:', err);
      }
    });
  }

  private setupCharts(reportData: SalesReport): void {
    // Configurar datos para el gráfico de barras
    this.barChartData = {
      labels: reportData.ventasPorDia.map(d => d.date),
      datasets: [
        { 
          data: reportData.ventasPorDia.map(d => d.total), 
          label: 'Ventas Diarias (S/.)',
          backgroundColor: 'rgba(79, 70, 229, 0.8)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1
        }
      ]
    };

    // Configurar datos para el gráfico de pastel (Top 5 productos por cantidad vendida)
    const top5Products = [...reportData.topProductosVendidos]
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 5);
        
    this.pieChartData = {
      labels: top5Products.map(p => p.productName),
      datasets: [{ 
        data: top5Products.map(p => p.quantitySold),
        backgroundColor: [ // Paleta de colores atractiva
            '#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'
        ],
        hoverBackgroundColor: [
            '#4338CA', '#059669', '#D97706', '#2563EB', '#DC2626'
        ]
      }]
    };
  }
  
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}