const {
  requireInteger,
  requireString,
  requireOneOf,
  requireArrayOf,
} = require('./Validate');
const { ROLES } = require('./Role');
const { Account } = require('./Account');
const { Card } = require('./Card');
const { Loan } = require('./Loan');

export class User {
  /**
   * @param {number} id
   * @param {string} customerId     // login ID, e.g. "1001"
   * @param {string} name
   * @param {string} role           // "customer" | "employee" | "admin"
   * @param {string} email
   * @param {string} passwordHash   // bcrypt hash, never the plain password
   * @param {Account[]} accounts
   * @param {Card[]} cards
   * @param {Loan[]} loans
   */
  constructor(id, customerId, name, role, email, passwordHash, accounts = [], cards = [], loans = []) {
    requireInteger(id, 'id');
    requireString(customerId, 'customerId');
    requireString(name, 'name');
    requireOneOf(role, ROLES, 'role');
    requireString(email, 'email');
    if (!email.includes('@')) throw new TypeError('email must contain "@"');
    requireString(passwordHash, 'passwordHash');
    requireArrayOf(accounts, Account, 'accounts');
    requireArrayOf(cards, Card, 'cards');
    requireArrayOf(loans, Loan, 'loans');

    this.id = id;
    this.customerId = customerId;
    this.name = name;
    this.role = role;
    this.email = email;
    this.passwordHash = passwordHash;
    this.accounts = [...accounts];
    this.cards = [...cards];
    this.loans = [...loans];
  }

  addAccount(account) {
    if (!(account instanceof Account)) throw new TypeError('account must be an Account object');
    if (account.userId !== this.id) throw new TypeError('account.userId must match this user id');
    this.accounts.push(account);
  }

  addCard(card) {
    if (!(card instanceof Card)) throw new TypeError('card must be a Card object');
    if (!this.accounts.some((a) => a.id === card.accountId)) {
      throw new TypeError('card.accountId must belong to one of this user\'s accounts');
    }
    this.cards.push(card);
  }

  addLoan(loan) {
    if (!(loan instanceof Loan)) throw new TypeError('loan must be a Loan object');
    if (loan.userId !== this.id) throw new TypeError('loan.userId must match this user id');
    this.loans.push(loan);
  }
}

module.exports = User;