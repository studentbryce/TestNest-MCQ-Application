/**
 * Authentication utilities for TestNest MCQ Application
 */
import CryptoJS from 'crypto-js'
import { supabase } from '../supabaseClient'

/**
 * Hash password using SHA256
 * @param {string} password - Plain text password
 * @returns {string} - Hashed password
 */
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString()
}

/**
 * Authenticate tutor user
 * @param {string} identifier - Email or Tutor ID
 * @param {string} password - Plain text password
 * @returns {Promise<object>} - Authentication result
 */
export const authenticateTutor = async (identifier, password) => {
  try {
    const hashedPassword = hashPassword(password)
    const isEmail = identifier.includes('@')
    const isTutorId = /^\d{7,9}$/.test(identifier)

    let query = supabase
      .from('users')
      .select('tutorid, firstname, lastname, username, role, department')
      .eq('password', hashedPassword)

    if (isEmail) {
      query = query.eq('username', identifier)
    } else if (isTutorId) {
      query = query.eq('tutorid', parseInt(identifier))
    } else {
      return { success: false, error: 'Invalid identifier format' }
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return { success: false, error: 'Invalid credentials' }
    }

    if (data.role && data.role !== 'tutor') {
      return { success: false, error: 'Access denied. Tutor login only.' }
    }

    return {
      success: true,
      user: {
        tutorId: data.tutorid,
        name: `${data.firstname} ${data.lastname}`,
        firstName: data.firstname,
        lastName: data.lastname,
        department: data.department,
        role: data.role || 'tutor'
      }
    }
  } catch (err) {
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Authenticate student user
 * @param {string} studentId - Student ID
 * @param {string} password - Plain text password
 * @returns {Promise<object>} - Authentication result
 */
export const authenticateStudent = async (studentId, password) => {
  try {
    const hashedPassword = hashPassword(password)
    const id = parseInt(studentId)

    if (isNaN(id) || id < 1000000 || id > 99999999) {
      return { success: false, error: 'Invalid student ID format' }
    }

    const { data, error } = await supabase
      .from('users')
      .select('studentid, firstname, lastname, username, role')
      .eq('studentid', id)
      .eq('password', hashedPassword)
      .single()

    if (error || !data) {
      return { success: false, error: 'Invalid student ID or password' }
    }

    if (data.role && data.role !== 'student') {
      return { success: false, error: 'Access denied. Student login only.' }
    }

    return {
      success: true,
      user: {
        studentId: data.studentid,
        name: `${data.firstname} ${data.lastname}`,
        userName: data.username,
        role: 'student'
      }
    }
  } catch (err) {
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Check if user exists by identifier
 * @param {string} identifier - Username, email, student ID, or tutor ID
 * @param {string} type - Type of identifier ('student', 'tutor', 'username')
 * @returns {Promise<boolean>} - True if user exists
 */
export const checkUserExists = async (identifier, type = 'username') => {
  try {
    let query = supabase.from('users').select('username')

    switch (type) {
      case 'student':
        const studentId = parseInt(identifier)
        if (isNaN(studentId)) return false
        query = query.eq('studentid', studentId)
        break
      case 'tutor':
        const tutorId = parseInt(identifier)
        if (isNaN(tutorId)) return false
        query = query.eq('tutorid', tutorId)
        break
      case 'username':
      default:
        query = query.eq('username', identifier)
        break
    }

    const { data, error } = await query.single()
    
    return !error && data !== null
  } catch (err) {
    return false
  }
}