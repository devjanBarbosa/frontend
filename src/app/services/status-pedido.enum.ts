// Em: src/app/services/status-pedido.enum.ts

export enum StatusPedido {
  PENDENTE = 'PENDENTE',
  EM_PREPARACAO = 'EM_PREPARACAO',
  PRONTO_PARA_RETIRADA = 'PRONTO_PARA_RETIRADA',
  SAIU_PARA_ENTREGA = 'SAIU_PARA_ENTREGA',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

// Uma lista para usar nos templates do Angular
export const ListaStatusPedido = Object.values(StatusPedido);