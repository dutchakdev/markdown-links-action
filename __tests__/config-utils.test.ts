import { isValidJson } from '../src/utils/configUtils'
import fs from 'fs'

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}))

describe('isValidJson', () => {
  it('should return true for valid JSON file', async () => {
    ;(fs.promises.readFile as jest.Mock).mockResolvedValue('{"key": "value"}')
    const result = await isValidJson('path/to/valid.json')
    expect(result).toBe(true)
  })

  it('should return false for invalid JSON file', async () => {
    ;(fs.promises.readFile as jest.Mock).mockResolvedValue('invalid json')
    const result = await isValidJson('path/to/invalid.json')
    expect(result).toBe(false)
  })
})
