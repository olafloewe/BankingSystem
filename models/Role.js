const { requireInteger, requireOneOf } = require('./Validate');

const ROLES = ['customer', 'employee', 'admin'];

class Role {
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

module.exports = { Role, ROLES };