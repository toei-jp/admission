import { factory } from '@cinerino/api-javascript-client';

export interface IReservation {
    id: string;
    reservationStatus: factory.chevre.reservationStatusType;
    reservedTicket: factory.chevre.reservation.ITicket<factory.chevre.reservationType.EventReservation>;
}

// tslint:disable-next-line:max-line-length
export interface IDecodeResult extends factory.ownershipInfo.IOwnershipInfo<factory.chevre.reservation.IReservation<factory.chevre.reservationType.EventReservation>> {
    iat: number;
    exp: number;
}
