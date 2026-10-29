const { requireInteger, requirePositiveInteger, requireNonNegativeNumber, requireOneOf } = require('./Validate');

export const LOAN_STATUSES = ['pending', 'approved', 'paid'];

export class Loan {
  /**
   * @param {number} id
   * @param {number} userId        // links to User.id
   * @param {number} amountCents   // integer, always positive
   * @param {number} interestRate  // yearly percent, e.g. 4.5
   * @param {string} status        // "pending" | "approved" | "paid"
   */
  constructor(id, userId, amountCents, interestRate, status = 'pending') {
    requireInteger(id, 'id');
    requireInteger(userId, 'userId');
    requirePositiveInteger(amountCents, 'amountCents');
    requireNonNegativeNumber(interestRate, 'interestRate');
    requireOneOf(status, LOAN_STATUSES, 'status');

    this.id = id;
    this.userId = userId;
    this.amountCents = amountCents;
    this.interestRate = interestRate;
    this.status = status;
  }
}