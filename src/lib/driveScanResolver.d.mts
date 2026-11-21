import type { DriveScannedFile } from './driveSyncService';
export type DriveInput = { id: string; kind: 'folder' | 'file' | 'unknown' };
export class DriveInputError extends Error {
  readonly kind: 'folder' | 'file' | 'input' | 'configuration';
  readonly status?: number;
  constructor(kind: DriveInputError['kind'], status?: number);
}
export function extractDriveId(input: string): string | null;
export function extractDCNumberFromFileName(name: string): string | null;
export function buildDriveUrls(fileId: string): { imageUrl: string; viewLink: string };
export function parseDriveLinksText(text: string): DriveInput[];
export function resolveDriveScanInputs(links: string, selectedFolder: string, apiKey?: string): Promise<DriveScannedFile[]>;
