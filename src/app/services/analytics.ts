import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// A interface será expandida para incluir os novos dados
export interface DashboardData {
  faturamentoTotal: number;
  totalDePedidos: number;
  ticketMedio: number;
  produtosMaisVendidos: { nome: string; quantidadeVendida: number }[];
  vendasPorCategoria: { nome: string; totalVendido: number }[];
  // NOVOS DADOS
  vendasDiarias: { data: string; total: number }[];
  ultimosPedidos: { id: string; nomeCliente: string; valorTotal: number; status: string }[];
  produtosComEstoqueBaixo: { id: string; nome: string; estoque: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly apiUrl = 'http://localhost:8080/api/analytics/dashboard';

  constructor(private http: HttpClient) { }

  // Método atualizado para aceitar um período
  getDashboardData(periodo: 'dia' | 'semana' | 'mes' = 'mes'): Observable<DashboardData> {
    const params = new HttpParams().set('periodo', periodo);
    return this.http.get<DashboardData>(this.apiUrl, { params });
  }
}