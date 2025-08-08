import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface para os dados do produto mais vendido
export interface ProdutoMaisVendido {
  nome: string;
  quantidadeVendida: number;
  faturamentoGerado: number;
}

// Interface para os dados de vendas por categoria
export interface VendasPorCategoria {
  nome: string;
  totalVendido: number;
}

// Interface principal que representa a resposta da nossa API
export interface DashboardData {
  faturamentoTotal: number;
  totalDePedidos: number;
  ticketMedio: number;
  produtosMaisVendidos: ProdutoMaisVendido[];
  vendasPorCategoria: VendasPorCategoria[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8080/api/analytics/dashboard';

  constructor(private http: HttpClient) { }

  // Método para buscar todos os dados do dashboard de uma só vez
  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
  }
}