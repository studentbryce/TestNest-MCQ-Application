/**
 * Validation utilities for TestNest MCQ Application
 */

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validates username format (alphanumeric and underscores only)
 * @param {string} username - Username to validate
 * @returns {boolean} - True if username is valid
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') return false
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  return usernameRegex.test(username.trim()) && username.length >= 3
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid boolean and errors array
 */
export const validatePassword = (password) => {
  const errors = []
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] }
  }
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (password.length > 100) {
    errors.push('Password must be less than 100 characters')
  }
  
  // Check for at least one letter and one number for stronger validation
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates student ID format (7-8 digits)
 * @param {string|number} studentId - Student ID to validate
 * @returns {boolean} - True if student ID is valid
 */
export const validateStudentId = (studentId) => {
  const id = parseInt(studentId)
  return !isNaN(id) && id >= 1000000 && id <= 99999999
}

/**
 * Validates tutor ID format (7-9 digits)
 * @param {string|number} tutorId - Tutor ID to validate
 * @returns {boolean} - True if tutor ID is valid
 */
export const validateTutorId = (tutorId) => {
  const id = parseInt(tutorId)
  return !isNaN(id) && id >= 1000000 && id <= 999999999
}

/**
 * Validates question object for MCQ creation
 * @param {object} questionData - Question object to validate
 * @returns {object} - Validation result with isValid boolean and errors array
 */
export const validateQuestion = (questionData) => {
  const errors = []
  
  if (!questionData || typeof questionData !== 'object') {
    return { isValid: false, errors: ['Invalid question data'] }
  }
  
  // Required fields
  if (!questionData.question?.trim()) {
    errors.push('Question text is required')
  }
  
  if (!questionData.choice1?.trim()) {
    errors.push('Choice 1 is required')
  }
  
  if (!questionData.choice2?.trim()) {
    errors.push('Choice 2 is required')
  }
  
  // Check if at least 2 choices are provided
  const choices = [
    questionData.choice1,
    questionData.choice2,
    questionData.choice3,
    questionData.choice4
  ].filter(choice => choice?.trim())
  
  if (choices.length < 2) {
    errors.push('At least 2 choices are required')
  }
  
  // Validate correct answer
  if (!questionData.correctanswer?.trim()) {
    errors.push('Correct answer is required')
  } else {
    // Check if correct answer matches one of the choices
    const isValidAnswer = choices.includes(questionData.correctanswer.trim())
    if (!isValidAnswer) {
      errors.push('Correct answer must match one of the provided choices')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates form data for student registration
 * @param {object} formData - Form data to validate
 * @returns {object} - Validation result with isValid boolean and errors array
 */
export const validateStudentRegistration = (formData) => {
  const errors = []
  
  if (!formData.firstName?.trim()) {
    errors.push('First name is required')
  }
  
  if (!formData.lastName?.trim()) {
    errors.push('Last name is required')
  }
  
  if (!validateUsername(formData.username)) {
    errors.push('Username must be at least 3 characters and contain only letters, numbers, and underscores')
  }
  
  if (!validateStudentId(formData.studentId)) {
    errors.push('Student ID must be 7-8 digits')
  }
  
  const passwordValidation = validatePassword(formData.password)
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors)
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.push('Passwords do not match')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates form data for tutor registration
 * @param {object} formData - Form data to validate
 * @returns {object} - Validation result with isValid boolean and errors array
 */
export const validateTutorRegistration = (formData) => {
  const errors = []
  
  if (!formData.firstName?.trim()) {
    errors.push('First name is required')
  }
  
  if (!formData.lastName?.trim()) {
    errors.push('Last name is required')
  }
  
  if (!validateEmail(formData.email)) {
    errors.push('Valid email address is required')
  }
  
  if (!validateTutorId(formData.tutorId)) {
    errors.push('Tutor ID must be 7-9 digits')
  }
  
  if (!formData.department?.trim()) {
    errors.push('Department is required')
  }
  
  const passwordValidation = validatePassword(formData.password)
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors)
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.push('Passwords do not match')
  }
  
  if (!formData.accessCode?.trim()) {
    errors.push('Access code is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}