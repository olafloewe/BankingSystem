import { requireInteger, requirePositiveInteger, requireDate, requireOneOf } from './Validate.js';

export const TRANSACTION_TYPES = ['deposit', 'withdrawal', 'transfer'];

export class Transaction {
  /**
   * @param {number} id
   * @param {number} accountId             // account the money moves in or out of
   * @param {string} type                  // "deposit" | "withdrawal" | "transfer"
   * @param {number} amountCents           // integer, always positive
   * @param {number|null} targetAccountId  // required for transfers, otherwise null
   * @param {Date}   createdAt
   * @param {string} description
   */
  constructor(id, accountId, type, amountCents, targetAccountId = null, createdAt = new Date(), description = '') {
    requireInteger(id, 'id');
    requireInteger(accountId, 'accountId');
    requireOneOf(type, TRANSACTION_TYPES, 'type');
    requirePositiveInteger(amountCents, 'amountCents');

    if (type === 'transfer') {
      requireInteger(targetAccountId, 'targetAccountId');
      if (targetAccountId === accountId) throw new TypeError('targetAccountId must differ from accountId');
    } else if (targetAccountId !== null) {
      throw new TypeError('targetAccountId must be null unless type is "transfer"');
    }

    requireDate(createdAt, 'createdAt');
    if (typeof description !== 'string') throw new TypeError('description must be a string');

    this.id = id;
    this.accountId = accountId;
    this.type = type;
    this.amountCents = amountCents;
    this.targetAccountId = targetAccountId;
    this.createdAt = createdAt;
    this.description = description;
  }
}