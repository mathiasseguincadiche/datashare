export function formatSize(bytes: number): string {
  if (bytes === 0) {
    return '0 o';
  }

  const units = ['o', 'Ko', 'Mo', 'Go'];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, unitIndex);

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}
