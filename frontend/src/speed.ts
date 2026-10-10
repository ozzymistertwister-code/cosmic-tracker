/** Convert a heliocentric speed from kilometres per second to kilometres per hour. */
export const kmhFromKms = (kilometresPerSecond: number): number => kilometresPerSecond * 3600

export const formatSpeedKmh = (kilometresPerSecond: number): string =>
  `${Math.round(kmhFromKms(kilometresPerSecond)).toLocaleString('ru-RU')} км/ч`
