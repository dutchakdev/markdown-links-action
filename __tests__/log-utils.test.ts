import * as log from '../src/utils/logUtils'

describe('Log Utility', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should log an info message', () => {
    log.info('Test info')
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]: Test info')
    )
  })

  it('should log a warning message', () => {
    log.warn('Test warning')
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]: Test warning')
    )
  })

  it('should log an error message', () => {
    log.error('Test error')
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]: Test error')
    )
  })

  it('should log a debug message when DEBUG is set', () => {
    process.env.DEBUG = 'true'
    log.debug('Test debug')
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]: Test debug')
    )
    delete process.env.DEBUG
  })

  it('should not log a debug message when DEBUG is not set', () => {
    delete process.env.DEBUG
    log.debug('Test debug')
    expect(consoleSpy).not.toHaveBeenCalled()
  })
})
