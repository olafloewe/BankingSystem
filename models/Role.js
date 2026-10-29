import { requireInteger, requireOneOf } from './Validate.js';

export const ROLES = ['customer', 'employee', 'admin'];

export class Role {
  /**
   * @param {number} id
   * @param {string} name  // "customer" | "employee" | "admin"
   */
  constructor(id, name) {
    requireInteger(id, 'id');
    requireOneOf(name, ROLES, 'name');

    this.id = id;
    this.name = name;
  }
}