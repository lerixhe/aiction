import { invoke } from '@tauri-apps/api/core'
import type { AppSettings, SettingsUpdate } from './types'
import { DEFAULT_SETTINGS } from './defaults'

export async function getSettings(): Promise<AppSettings> {
  try {
    const settings = await invoke<AppSettings>('get_settings')
    return settings
  } catch (error) {
    console.error('Failed to get settings:', error)
    return DEFAULT_SETTINGS
  }
}

export async function updateSettings(update: SettingsUpdate): Promise<AppSettings> {
  const settings = await invoke<AppSettings>('update_settings', { update })
  return settings
}

export async function exportSettings(): Promise<string> {
  const json = await invoke<string>('export_settings')
  return json
}

export async function exportSettingsToFile(): Promise<boolean> {
  const result = await invoke<boolean>('export_settings_to_file')
  return result
}

export async function importSettings(json: string): Promise<AppSettings> {
  const settings = await invoke<AppSettings>('import_settings', { json })
  return settings
}

export async function importSettingsFromFile(): Promise<AppSettings | null> {
  const settings = await invoke<AppSettings | null>('import_settings_from_file')
  return settings
}

export async function resetSettings(): Promise<AppSettings> {
  try {
    const settings = await invoke<AppSettings>('reset_settings')
    return settings
  } catch (error) {
    console.error('Failed to reset settings:', error)
    return DEFAULT_SETTINGS
  }
}
