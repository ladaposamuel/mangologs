"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../src/core/logger");
describe('DefaultLogger', () => {
    let logger;
    let consoleSpy;
    beforeEach(() => {
        logger = new logger_1.DefaultLogger('TestContext');
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });
    afterEach(() => {
        consoleSpy.mockRestore();
    });
    it('should log messages at the correct level', () => {
        logger.setLogLevel(logger_1.LogLevel.INFO);
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
        logger.setLogLevel(logger_1.LogLevel.ERROR);
        logger.warn('Warn message');
        logger.error('Error message');
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error message'));
    });
});
//# sourceMappingURL=logger.test.js.map