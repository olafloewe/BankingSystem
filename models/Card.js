import { requireInteger, requireString, requireDate, requireOneOf } from './Validate.js';

export const CARD_STATUSES = ['active', 'blocked'];

export class Card {
  /**
   * @param {number} id
   * @param {string} cardNumber  // string, 16 digits (keeps leading zeros)
   * @param {number} accountId   // links to Account.id
   * @param {Date}   expiry
   * @param {string} status      // "active" | "blocked"
   */
  constructor(id, cardNumber, accountId, expiry, status = 'active') {
    requireInteger(id, 'id');
    requireString(cardNumber, 'cardNumber');
    if (!/^\d{16}$/.test(cardNumber)) throw new TypeError('cardNumber must be 16 digits');
    requireInteger(accountId, 'accountId');
    requireDate(expiry, 'expiry');
    requireOneOf(status, CARD_STATUSES, 'status');

    this.id = id;
    this.cardNumber = cardNumber;
    this.accountId = accountId;
    this.expiry = expiry;
    this.status = status;
  }
}
