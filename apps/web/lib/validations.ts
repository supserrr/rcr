/**
 * Form validation utilities
 * 
 * Provides validation schemas and functions for:
 * - Sign in forms
 * - Sign up forms
 * - User profile forms
 * - Common form fields
 */

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Email validation
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email is required'
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  
  return null
}

/**
 * Password validation
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required'
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number'
  }
  
  return null
}

/**
 * Name validation
 */
export function validateName(name: string): string | null {
  if (!name) {
    return 'Name is required'
  }
  
  if (name.length < 2) {
    return 'Name must be at least 2 characters long'
  }
  
  if (name.length > 50) {
    return 'Name must be less than 50 characters'
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes'
  }
  
  return null
}

/**
 * Confirm password validation
 */
export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) {
    return 'Please confirm your password'
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  
  return null
}

/**
 * Terms agreement validation
 */
export function validateTermsAgreement(agreed: boolean): string | null {
  if (!agreed) {
    return 'You must agree to the terms and conditions'
  }
  
  return null
}

/**
 * Sign in form validation
 */
export interface SignInFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export function validateSignInForm(data: SignInFormData): ValidationResult {
  const errors: Record<string, string> = {}
  
  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.email = emailError
  }
  
  if (!data.password) {
    errors.password = 'Password is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Sign up form validation
 */
export interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'patient' | 'counselor'
  agreeToTerms: boolean
}

export function validateSignUpForm(data: SignUpFormData): ValidationResult {
  const errors: Record<string, string> = {}
  
  const nameError = validateName(data.name)
  if (nameError) {
    errors.name = nameError
  }
  
  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.email = emailError
  }
  
  const passwordError = validatePassword(data.password)
  if (passwordError) {
    errors.password = passwordError
  }
  
  const confirmPasswordError = validateConfirmPassword(data.password, data.confirmPassword)
  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError
  }
  
  if (!data.role || !['patient', 'counselor'].includes(data.role)) {
    errors.role = 'Please select a valid role'
  }
  
  const termsError = validateTermsAgreement(data.agreeToTerms)
  if (termsError) {
    errors.agreeToTerms = termsError
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Profile form validation
 */
export interface ProfileFormData {
  name: string
  email: string
  phone?: string
  bio?: string
}

export function validateProfileForm(data: ProfileFormData): ValidationResult {
  const errors: Record<string, string> = {}
  
  const nameError = validateName(data.name)
  if (nameError) {
    errors.name = nameError
  }
  
  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.email = emailError
  }
  
  if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }
  
  if (data.bio && data.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Contact form validation
 */
export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export function validateContactForm(data: ContactFormData): ValidationResult {
  const errors: Record<string, string> = {}
  
  const nameError = validateName(data.name)
  if (nameError) {
    errors.name = nameError
  }
  
  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.email = emailError
  }
  
  if (!data.subject) {
    errors.subject = 'Subject is required'
  } else if (data.subject.length < 5) {
    errors.subject = 'Subject must be at least 5 characters long'
  }
  
  if (!data.message) {
    errors.message = 'Message is required'
  } else if (data.message.length < 10) {
    errors.message = 'Message must be at least 10 characters long'
  } else if (data.message.length > 1000) {
    errors.message = 'Message must be less than 1000 characters'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Utility function to get the first error message
 */
export function getFirstError(errors: Record<string, string>): string | null {
  const errorKeys = Object.keys(errors)
  return errorKeys.length > 0 ? (errors[errorKeys[0]!] || null) : null
}

/**
 * Utility function to check if a field has an error
 */
export function hasFieldError(errors: Record<string, string>, fieldName: string): boolean {
  return fieldName in errors
}

/**
 * Utility function to get field error message
 */
export function getFieldError(errors: Record<string, string>, fieldName: string): string | null {
  return fieldName in errors ? errors[fieldName]! : null
}
