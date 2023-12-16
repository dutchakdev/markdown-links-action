import fs from 'fs'

const readFileAsync = fs.promises.readFile

export async function configExists(configFile: string): Promise<boolean> {
  try {
    await readFileAsync(configFile, 'utf8')
    return true
  } catch (error) {
    return false
  }
}

export async function getConfig(
  configFile: string
): Promise<Record<string, unknown>> {
  const fileContent = await readFileAsync(configFile, 'utf8')
  console.log(`Config file content: ${fileContent}`)
  return JSON.parse(fileContent)
}

export async function isValidJson(filePath: string): Promise<boolean> {
  try {
    const fileContent = await readFileAsync(filePath, 'utf8')
    JSON.parse(fileContent)
    return true
  } catch (error) {
    return false
  }
}

export async function validateAndGetConfig(
  configFilePath: string
): Promise<Record<string, unknown>> {
  try {
    console.log(`Reading config file from ${configFilePath}`)
    if (await configExists(configFilePath)) {
      console.log(`Config file found at ${configFilePath}`)
      if (await isValidJson(configFilePath)) {
        console.log(`Config file is valid JSON`)
        return await getConfig(configFilePath)
      } else {
        throw new Error('Invalid config file format. Expected JSON format.')
      }
    } else {
      throw new Error('No config file found.')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Error occurred while reading config file: ${error.message}`
      )
    }
    throw new Error('Error occurred while reading config file.')
  }
}
