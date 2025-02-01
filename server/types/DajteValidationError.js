class DateValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DateValidationError';
  }
}
module.exports = DateValidationError;