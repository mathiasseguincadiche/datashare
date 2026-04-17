export const FORBIDDEN_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.msi',
  '.sh',
];

// Types MIME reels detectes a partir des premiers octets du fichier (signature).
// Complete le filtrage par extension pour attraper les fichiers executables renommes
// (ex: virus.exe renomme en photo.jpg).
export const FORBIDDEN_DETECTED_MIMES = [
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-mach-binary',
  'application/x-sh',
  'application/x-bat',
];

export const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024;
export const DEFAULT_EXPIRY_DAYS = 7;
export const MAX_EXPIRY_DAYS = 7;
