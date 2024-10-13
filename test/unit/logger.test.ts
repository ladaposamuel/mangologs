import { DefaultLogger, LogLevel } from '../../src/core/logger';

describe('DefaultLogger', () => {
  let logger: DefaultLogger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new DefaultLogger('TestContext');
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should log messages at the correct level', () => {
    logger.setLogLevel(LogLevel.INFO);

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');

    expect(consoleSpy).toHaveBeenCalledTimes(3);
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Debug message'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Info message'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Warn message'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error message'));
  });

  it('should include context in log messages', () => {
    logger.info('Test message');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('TestContext'));
  });

  it('should allow changing log level', () => {
    logger.setLogLevel(LogLevel.ERROR);

    logger.warn('Warn message');
    logger.error('Error message');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error message'));
  });
});