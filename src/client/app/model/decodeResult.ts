import { factory } from '@toei-jp/cinerino-api-javascript-client';

export interface IDecodeResult extends factory.ownershipInfo.IOwnershipInfo<factory.chevre.reservation.IReservation> {
    iat: number;
}
