import { Injectable } from '@angular/core';

// Declara a função gtag para o TypeScript saber que ela existe globalmente
declare var gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleAdsService {

  constructor() { }

  // Função que será chamada para reportar uma conversão de compra
  public reportarConversao(valor: number, transacaoId: string): void {
    // Verifica se a função gtag do Google existe na página
    if (typeof gtag === 'function') {
      console.log(`Reportando conversão para o Google Ads: ID ${transacaoId}, Valor ${valor}`);
      
      gtag('event', 'conversion', {
        'send_to': 'AW-SEU_ID_DE_CONVERSAO', // <-- SUBSTITUA PELO SEU ID
        'value': valor,
        'currency': 'BRL',
        'transaction_id': transacaoId
      });
    } else {
      console.warn('Google Ads (gtag) não encontrado. A conversão não foi reportada.');
    }
  }
}