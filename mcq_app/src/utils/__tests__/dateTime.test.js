import { describe, it, expect, vi } from 'vitest'
import {
  formatDateTime,
  getCurrentTimestamp,
  getTimeDifference,
  formatTimeDifference,
} from '../dateTime'

describe('DateTime Utilities', () => {
  describe('formatDateTime', () => {
    it('formats valid ISO string correctly', () => {
      const isoString = '2023-11-15T14:30:00.000Z'
      const result = formatDateTime(isoString)

      expect(result.date).toBe('15/11/2023')
      expect(result.time).toBe('14:30')
    })

    it('handles different ISO string formats', () => {
      const isoString = '2023-01-05T09:05:25.123Z'
      const result = formatDateTime(isoString)

      expect(result.date).toBe('05/01/2023')
      expect(result.time).toBe('09:05')
    })

    it('handles midnight and end of day times', () => {
      const midnight = '2023-12-25T00:00:00.000Z'
      const endOfDay = '2023-12-25T23:59:59.999Z'
      
      const midnightResult = formatDateTime(midnight)
      const endOfDayResult = formatDateTime(endOfDay)

      expect(midnightResult.time).toBe('00:00')
      expect(endOfDayResult.time).toBe('23:59')
    })

    it('handles invalid date strings', () => {
      const result = formatDateTime('invalid-date')

      expect(result.date).toBe('Invalid date')
      expect(result.time).toBe('Invalid time')
    })

    it('handles null and undefined inputs', () => {
      const nullResult = formatDateTime(null)
      const undefinedResult = formatDateTime(undefined)
      const emptyResult = formatDateTime('')

      expect(nullResult.date).toBe('Unknown date')
      expect(nullResult.time).toBe('Unknown time')
      
      expect(undefinedResult.date).toBe('Unknown date')
      expect(undefinedResult.time).toBe('Unknown time')
      
      expect(emptyResult.date).toBe('Unknown date')
      expect(emptyResult.time).toBe('Unknown time')
    })

    it('pads single digits correctly', () => {
      const isoString = '2023-03-07T08:05:00.000Z'
      const result = formatDateTime(isoString)

      expect(result.date).toBe('07/03/2023')
      expect(result.time).toBe('08:05')
    })
  })

  describe('getCurrentTimestamp', () => {
    it('returns a valid ISO string', () => {
      const timestamp = getCurrentTimestamp()

      expect(typeof timestamp).toBe('string')
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('returns current time', () => {
      const before = Date.now()
      const timestamp = getCurrentTimestamp()
      const after = Date.now()

      const timestampMs = new Date(timestamp).getTime()
      
      expect(timestampMs).toBeGreaterThanOrEqual(before)
      expect(timestampMs).toBeLessThanOrEqual(after)
    })
  })

  describe('getTimeDifference', () => {
    it('calculates difference between two timestamps', () => {
      const startTime = '2023-11-15T10:00:00.000Z'
      const endTime = '2023-11-15T12:30:00.000Z'

      const result = getTimeDifference(startTime, endTime)

      expect(result.hours).toBe(2)
      expect(result.minutes).toBe(150) // 2.5 hours = 150 minutes
      expect(result.seconds).toBe(9000) // 2.5 hours = 9000 seconds
    })

    it('calculates difference from start time to now when no end time provided', () => {
      // Mock Date constructor
      const mockDate = vi.fn()
      mockDate
        .mockReturnValueOnce(new Date('2023-11-15T10:00:00.000Z')) // start time
        .mockReturnValueOnce(new Date('2023-11-15T12:00:00.000Z')) // end time (now)
      
      vi.stubGlobal('Date', mockDate)

      const startTime = '2023-11-15T10:00:00.000Z'
      const result = getTimeDifference(startTime)

      expect(result.hours).toBe(2)
      
      vi.unstubAllGlobals()
    })

    it('handles same start and end time', () => {
      const timestamp = '2023-11-15T10:00:00.000Z'
      const result = getTimeDifference(timestamp, timestamp)

      expect(result.hours).toBe(0)
      expect(result.minutes).toBe(0)
      expect(result.seconds).toBe(0)
      expect(result.milliseconds).toBe(0)
    })

    it('handles end time before start time', () => {
      const startTime = '2023-11-15T12:00:00.000Z'
      const endTime = '2023-11-15T10:00:00.000Z'

      const result = getTimeDifference(startTime, endTime)

      expect(result.error).toBe('End time cannot be before start time')
    })

    it('handles invalid timestamp formats', () => {
      const result = getTimeDifference('invalid-date', 'also-invalid')

      expect(result.error).toBe('Invalid timestamp format')
    })

    it('includes formatted time difference', () => {
      const startTime = '2023-11-15T10:00:00.000Z'
      const endTime = '2023-11-15T11:30:00.000Z'

      const result = getTimeDifference(startTime, endTime)

      expect(result.formatted).toBe('1 hour ago')
    })

    it('calculates days correctly for long periods', () => {
      const startTime = '2023-11-01T10:00:00.000Z'
      const endTime = '2023-11-03T14:00:00.000Z'

      const result = getTimeDifference(startTime, endTime)

      expect(result.days).toBe(2)
      expect(result.hours).toBe(52) // 2 days + 4 hours
    })
  })

  describe('formatTimeDifference', () => {
    it('formats seconds correctly', () => {
      expect(formatTimeDifference(30 * 1000)).toBe('Just now') // 30 seconds
      expect(formatTimeDifference(45 * 1000)).toBe('Just now') // 45 seconds
    })

    it('formats minutes correctly', () => {
      expect(formatTimeDifference(5 * 60 * 1000)).toBe('5 minutes ago')
      expect(formatTimeDifference(1 * 60 * 1000)).toBe('1 minute ago')
      expect(formatTimeDifference(59 * 60 * 1000)).toBe('59 minutes ago')
    })

    it('formats hours correctly', () => {
      expect(formatTimeDifference(2 * 60 * 60 * 1000)).toBe('2 hours ago')
      expect(formatTimeDifference(1 * 60 * 60 * 1000)).toBe('1 hour ago')
      expect(formatTimeDifference(23 * 60 * 60 * 1000)).toBe('23 hours ago')
    })

    it('formats days correctly', () => {
      expect(formatTimeDifference(1 * 24 * 60 * 60 * 1000)).toBe('1 day ago')
      expect(formatTimeDifference(2 * 24 * 60 * 60 * 1000)).toBe('2 days ago')
      expect(formatTimeDifference(7 * 24 * 60 * 60 * 1000)).toBe('7 days ago')
    })

    it('uses singular form for 1 unit', () => {
      expect(formatTimeDifference(1 * 60 * 1000)).toBe('1 minute ago')
      expect(formatTimeDifference(1 * 60 * 60 * 1000)).toBe('1 hour ago')
      expect(formatTimeDifference(1 * 24 * 60 * 60 * 1000)).toBe('1 day ago')
    })

    it('prioritizes largest unit', () => {
      // 1 day and 5 hours should show as "1 day ago"
      const oneDayFiveHours = (24 + 5) * 60 * 60 * 1000
      expect(formatTimeDifference(oneDayFiveHours)).toBe('1 day ago')

      // 2 hours and 30 minutes should show as "2 hours ago"
      const twoHoursThirtyMin = (2 * 60 + 30) * 60 * 1000
      expect(formatTimeDifference(twoHoursThirtyMin)).toBe('2 hours ago')
    })
  })
})