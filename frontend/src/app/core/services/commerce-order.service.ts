import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  CreateOrderResponse,
  Invoice,
  OrderPreviewRequest,
  OrderPreviewResponse,
  PlaceOrderRequest
} from '../../models/order.models';

@Injectable({ providedIn: 'root' })
export class CommerceOrderService {
  constructor(private readonly api: ApiService) {}

  preview(request: OrderPreviewRequest): Promise<OrderPreviewResponse> {
    return this.api.post<OrderPreviewResponse>('/api/orders/preview', request);
  }

  create(request: PlaceOrderRequest, token: string): Promise<CreateOrderResponse> {
    return this.api.post<CreateOrderResponse>('/api/orders', request, token);
  }

  getInvoice(orderId: string, token: string): Promise<Invoice> {
    return this.api.get<Invoice>(`/api/orders/${orderId}/invoice`, token);
  }
}
