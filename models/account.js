const {
  requireInteger,
  requireNonNegativeInteger,
  requireDate,
  requireOneOf,
  requireArrayOf,
} = require('./Validate');
const { Transaction } = require('./transaction');

const ACCOUNT_TYPES = ['checking', 'savings'];

class Account {
  /**
   * @param {number} id
   * @param {number} userId             // links to User.id
   * @param {string} type               // "checking" | "savings"
   * @param {number} balanceCents       // integer, e.g. 12050 = 120.50
   * @param {Date}   createdAt
   * @param {Transaction[]} transactions // history, oldest first
   */
  constructor(id, userId, type, balanceCents = 0, createdAt = new Date(), transactions = []) {
    requireInteger(id, 'id');
    requireInteger(userId, 'userId');
    requireOneOf(type, ACCOUNT_TYPES, 'type');
    requireNonNegativeInteger(balanceCents, 'balanceCents');
    requireDate(createdAt, 'createdAt');
    requireArrayOf(transactions, Transaction, 'transactions');

    this.id = id;
    this.userId = userId;
    this.type = type;
    this.balanceCents = balanceCents;
    this.createdAt = createdAt;
    this.transactions = [...transactions];
  }

  // Records a transaction in this account's history.
  // It does NOT change the balance, only add to history
  addTransaction(transaction) {
    if (!(transaction instanceof Transaction)) {
      throw new TypeError('transaction must be a Transaction object');
    }
    if (transaction.accountId !== this.id) {
      throw new TypeError('transaction.accountId must match this account id');
    }
    this.transactions.push(transaction);
  }
}

module.exports = { Account, ACCOUNT_TYPES };