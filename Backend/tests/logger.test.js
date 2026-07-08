import logger from '../src/shared/utils/logger.js';

describe('Logger', () => {
  it('should log info messages without throwing', () => {
    expect(() => {
      logger.info('Test info message');
    }).not.toThrow();
  });

  it('should log error messages without throwing', () => {
    expect(() => {
      logger.error('Test error message');
    }).not.toThrow();
  });

  it('should log warn messages without throwing', () => {
    expect(() => {
      logger.warn('Test warn message');
    }).not.toThrow();
  });

  it('should handle error objects with stack traces', () => {
    expect(() => {
      const err = new Error('Test error');
      logger.error('Error occurred:', { error: err.message, stack: err.stack });
    }).not.toThrow();
  });
});
