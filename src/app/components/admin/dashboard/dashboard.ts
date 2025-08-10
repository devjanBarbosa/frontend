import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsService, DashboardData } from '../../../services/analytics';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class DashboardComponent implements OnInit {

  isLoading = true;
  dashboardData: DashboardData | null = null;
  periodoAtivo: 'dia' | 'semana' | 'mes' = 'mes';

  // Configuração para o gráfico de linhas (Faturamento)
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Faturamento', fill: true, tension: 0.4, borderColor: '#E91E63', backgroundColor: 'rgba(233, 30, 99, 0.1)' }]
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };
  public lineChartType: ChartType = 'line';

  // --- NOVA CONFIGURAÇÃO PARA O GRÁFICO DE PIZZA ---
  public pieChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom' } }
  };
  public pieChartType: ChartType = 'doughnut'; // Usamos 'doughnut' para um visual mais moderno

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.carregarDados('mes');
  }

  carregarDados(periodo: 'dia' | 'semana' | 'mes'): void {
    this.isLoading = true;
    this.periodoAtivo = periodo;
    this.analyticsService.getDashboardData(periodo).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.prepararGraficoVendas(data);
        this.prepararGraficoCategorias(data); // <-- Adicionamos esta chamada
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do dashboard:', err);
        this.isLoading = false;
        this.dashboardData = null;
      }
    });
  }

  private prepararGraficoVendas(data: DashboardData): void {
    // ... (seu código existente para o gráfico de linhas)
  }

  // --- NOVA FUNÇÃO PARA PREPARAR OS DADOS DO GRÁFICO DE PIZZA ---
  private prepararGraficoCategorias(data: DashboardData): void {
    if (!data?.vendasPorCategoria) return;

    this.pieChartData.labels = data.vendasPorCategoria.map(c => c.nome);
    this.pieChartData.datasets[0].data = data.vendasPorCategoria.map(c => c.totalVendido);
  }
}