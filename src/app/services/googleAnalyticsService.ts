import { Injectable } from '@angular/core';
import { CartItem } from './cart';

// Declara a função gtag para o TypeScript saber que ela existe globalmente
declare var gtag: Function;

interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService { // <-- NOME CORRIGIDO

  constructor() { }

  /**
   * Envia um evento de compra (purchase) para o Google Analytics 4.
   * @param transactionId O ID único do pedido.
   * @param totalValue O valor total da compra.
   * @param cartItems
   * @param click_get_directions 
   */
  public reportarCompra(transactionId: string, totalValue: number, items: AnalyticsItem[]): void {
    if (typeof gtag === 'function') {
      console.log(`Reportando compra para o Google Analytics: ID ${transactionId}`);


      gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: totalValue,
        currency: 'BRL',
        items: items})

    } else {
      console.warn('Google Analytics (gtag) não encontrado. Compra não reportada.');
    }
  }

public reportarEventoPersonalizado(eventName: string): void {
  if (typeof gtag === 'function') {
    console.log(`Reportando evento para o Google Analytics: ${eventName}`);
    gtag('event', eventName);
  } else {
    console.warn(`Google Analytics (gtag) não encontrado. Evento "${eventName}" não reportado.`);
  }
}
}