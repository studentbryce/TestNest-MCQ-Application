/**
 * Date and time utilities for TestNest MCQ Application
 */

/**
 * Formats ISO timestamp to readable date and time (NZ timezone aware)
 * @param {string} isoString - ISO timestamp string
 * @returns {object} - Formatted date and time strings
 */
export const formatDateTime = (isoString) => {
  if (!isoString) {
    return {
      date: 'Unknown date',
      time: 'Unknown time'
    }
  }

  try {
    // Parse the ISO string directly without timezone conversion
    const date = new Date(isoString)
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return {
        date: 'Invalid date',
        time: 'Invalid time'
      }
    }

    // Format date as DD/MM/YYYY
    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const year = date.getUTCFullYear()
    const formattedDate = `${day}/${month}/${year}`

    // Format time as HH:MM (24-hour format)
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const formattedTime = `${hours}:${minutes}`

    return {
      date: formattedDate,
      time: formattedTime
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return {
      date: 'Error parsing date',
      time: 'Error parsing time'
    }
  }
}

/**
 * Get current timestamp in ISO format
 * @returns {string} - Current timestamp in ISO format
 */
export const getCurrentTimestamp = () => {
  return new Date().toISOString()
}

/**
 * Calculate time difference between two timestamps
 * @param {string} startTime - Start timestamp in ISO format
 * @param {string} endTime - End timestamp in ISO format (optional, defaults to now)
 * @returns {object} - Time difference object
 */
export const getTimeDifference = (startTime, endTime = null) => {
  try {
    const start = new Date(startTime)
    
    // Check if startTime is valid
    if (isNaN(start.getTime())) {
      return { error: 'Invalid timestamp format' }
    }
    
    const end = endTime ? new Date(endTime) : new Date()
    
    // Check if endTime is valid (when provided)
    if (endTime && isNaN(end.getTime())) {
      return { error: 'Invalid timestamp format' }
    }
    
    const diffMs = end.getTime() - start.getTime()
    
    if (diffMs < 0) {
      return { error: 'End time cannot be before start time' }
    }
    
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    return {
      milliseconds: diffMs,
      seconds: diffSeconds,
      minutes: diffMinutes,
      hours: diffHours,
      days: diffDays,
      formatted: formatTimeDifference(diffMs)
    }
  } catch (error) {
    return { error: 'Invalid timestamp format' }
  }
}

/**
 * Format time difference into human-readable string
 * @param {number} diffMs - Time difference in milliseconds
 * @returns {string} - Formatted time difference
 */
export const formatTimeDifference = (diffMs) => {
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  } else {
    return 'Just now'
  }
}