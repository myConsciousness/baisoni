const NOW = 5
const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const MONTH = DAY * 28
const YEAR = DAY * 365

export function formattedSimpleDate(dateStr: string, absoluteTimeOnly: boolean = false): string {
  let ts = Number(new Date(dateStr))
  const diffSeconds = Math.floor((Date.now() - ts) / 1000)

if (absoluteTimeOnly) {
    return new Date(ts).toLocaleDateString()
  } else {
    if (diffSeconds < NOW) {
      return `now`
    } else if (diffSeconds < MINUTE) {
      return `${diffSeconds}s`
    } else if (diffSeconds < HOUR) {
      return `${Math.floor(diffSeconds / MINUTE)}m`
    } else if (diffSeconds < DAY) {
      return `${Math.floor(diffSeconds / HOUR)}h`
    } else if (diffSeconds < MONTH) {
      return `${Math.floor(diffSeconds / DAY)}d`
    } else if (diffSeconds < YEAR) {
      return `${Math.floor(diffSeconds / MONTH)}mo`
    } else {
      return new Date(ts).toLocaleDateString()
    }
  }
}
