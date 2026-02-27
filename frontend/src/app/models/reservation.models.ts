export interface TableDto {
  id: string;
  name: string;
  capacity: number;
  status: string;
  isActive: boolean;
}

export interface CreateReservationRequest {
  tableId: string;
  reservationAtUtc: string;
  partySize: number;
  notes: string;
}
