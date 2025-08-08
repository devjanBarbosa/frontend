import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js/auto'; // Importação direta do Chart.js

import Swal from 'sweetalert2';
import { AnalyticsService } from '../../../services/analytics';
import { DashboardData } from '../../../services/analytics';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe], // Apenas CommonModule e CurrencyPipe são necessários
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pieChartCanvas') private pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartCanvas') private barChartCanvas!: ElementRef<HTMLCanvasElement>;

  isLoading = true;
  dashboardData: DashboardData | null = null;
  
  private pieChart?: Chart;
  private barChart?: Chart;

  constructor(private analyticsService: AnalyticsService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.carregarDadosDashboard();
  }

  ngAfterViewInit(): void {
    if (this.dashboardData) {
      this.createCharts();
    }
  }

  ngOnDestroy(): void {
    this.pieChart?.destroy();
    this.barChart?.destroy();
  }

  carregarDadosDashboard(): void {
    this.isLoading = true;
    this.analyticsService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        if (this.pieChartCanvas && this.barChartCanvas) {
          this.createCharts();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do dashboard:', err);
        this.isLoading = false;
        Swal.fire('Erro!', 'Não foi possível carregar os dados do dashboard.', 'error');
      }
    });
  }

  private createCharts(): void {
    if (!this.dashboardData) return;
    
    this.createPieChart(this.dashboardData);
    this.createBarChart(this.dashboardData);
  }

  private createPieChart(data: DashboardData): void {
    this.pieChart?.destroy();
    const canvas = this.pieChartCanvas.nativeElement;
    this.pieChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: data.vendasPorCategoria.map(c => c.nome),
        datasets: [{
          data: data.vendasPorCategoria.map(c => c.totalVendido),
          backgroundColor: ['#c7a4b1', '#3498db', '#e67e22', '#27ae60', '#6c757d', '#f1c40f', '#9b59b6'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Vendas por Categoria' }
        }
      }
    });
  }

  private createBarChart(data: DashboardData): void {
    this.barChart?.destroy();
    const canvas = this.barChartCanvas.nativeElement;
    this.barChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.produtosMaisVendidos.map(p => p.nome),
        datasets: [{
          label: 'Unidades Vendidas',
          data: data.produtosMaisVendidos.map(p => p.quantidadeVendida),
          backgroundColor: '#c7a4b1'
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true }
        },
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Top 5 Produtos Mais Vendidos' }
        }
      }
    });
  }
}