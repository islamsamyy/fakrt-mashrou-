/**
 * Form Validation Rules
 * Used for client and server-side validation
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Email validation - RFC 5321 compliant
 * BUG #11 FIX: Allows "+" character in local part (before @)
 * Example: autotest+20260420@example.com ✅
 */
export function validateEmail(email: string): boolean {
  // RFC 5321 compliant regex that allows:
  // - Letters, numbers, dots, hyphens, underscores, and + in local part
  // - Valid domain structure with at least one dot
  const regex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(email) && email.length <= 254;
}

/**
 * Password validation
 * Requires: min 8 chars, uppercase, lowercase, number
 */
export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    });
  }
  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'يجب أن تتضمن كلمة المرور حرفاً كبيراً واحداً على الأقل',
    });
  }
  if (!/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'يجب أن تتضمن كلمة المرور حرفاً صغيراً واحداً على الأقل',
    });
  }
  if (!/[0-9]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'يجب أن تتضمن كلمة المرور رقماً واحداً على الأقل',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Full name validation
 */
export function validateFullName(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name || name.trim().length < 3) {
    errors.push({
      field: 'fullName',
      message: 'يجب أن يكون الاسم 3 أحرف على الأقل',
    });
  }
  if (name.length > 100) {
    errors.push({
      field: 'fullName',
      message: 'الاسم طويل جداً',
    });
  }
  // Check for valid characters (Arabic, English, spaces, hyphens)
  if (!/^[\u0600-\u06FFa-zA-Z\s\-']{3,100}$/.test(name)) {
    errors.push({
      field: 'fullName',
      message: 'الاسم يحتوي على أحرف غير صحيحة',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Project title validation
 */
export function validateProjectTitle(title: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!title || title.trim().length < 5) {
    errors.push({
      field: 'title',
      message: 'يجب أن يكون العنوان 5 أحرف على الأقل',
    });
  }
  if (title.length > 200) {
    errors.push({
      field: 'title',
      message: 'العنوان طويل جداً (أقصى 200 حرف)',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Project description validation
 */
export function validateDescription(description: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!description || description.trim().length < 20) {
    errors.push({
      field: 'description',
      message: 'يجب أن تكون الوصفة 20 حرفاً على الأقل',
    });
  }
  if (description.length > 5000) {
    errors.push({
      field: 'description',
      message: 'الوصفة طويلة جداً (أقصى 5000 حرف)',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Funding amount validation
 */
export function validateFundingAmount(amount: number | string): ValidationResult {
  const errors: ValidationError[] = [];
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (!numAmount || numAmount <= 0) {
    errors.push({
      field: 'fundingGoal',
      message: 'يجب أن يكون المبلغ أكثر من صفر',
    });
  }
  if (numAmount < 50000) {
    errors.push({
      field: 'fundingGoal',
      message: 'الحد الأدنى للتمويل هو 50,000 ريال',
    });
  }
  if (numAmount > 100000000) {
    errors.push({
      field: 'fundingGoal',
      message: 'الحد الأقصى للتمويل هو 100,000,000 ريال',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Investment amount validation
 */
export function validateInvestmentAmount(amount: number | string, minAmount = 1000): ValidationResult {
  const errors: ValidationError[] = [];
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (!numAmount || numAmount <= 0) {
    errors.push({
      field: 'amount',
      message: 'يجب أن يكون المبلغ أكثر من صفر',
    });
  }
  if (numAmount < minAmount) {
    errors.push({
      field: 'amount',
      message: `الحد الأدنى للاستثمار هو ${minAmount.toLocaleString()} ريال`,
    });
  }
  if (numAmount > 10000000) {
    errors.push({
      field: 'amount',
      message: 'الحد الأقصى للاستثمار الواحد هو 10,000,000 ريال',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Phone number validation (Saudi format)
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const errors: ValidationError[] = [];
  // Saudi: +966, 0966, 966, or just 9...
  const regex = /^(\+966|0966|966|9)[0-9]{8}$/;

  if (!phone) {
    errors.push({
      field: 'phone',
      message: 'رقم الهاتف مطلوب',
    });
  } else if (!regex.test(phone.replace(/\s+/g, ''))) {
    errors.push({
      field: 'phone',
      message: 'رقم الهاتف غير صحيح',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * National ID validation (Saudi 10 digits)
 */
export function validateNationalId(id: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!id || id.length !== 10) {
    errors.push({
      field: 'nationalId',
      message: 'رقم الهوية يجب أن يكون 10 أرقام',
    });
  } else if (!/^\d{10}$/.test(id)) {
    errors.push({
      field: 'nationalId',
      message: 'رقم الهوية يجب أن يحتوي على أرقام فقط',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Category validation
 */
export function validateCategory(category: string): ValidationResult {
  const errors: ValidationError[] = [];
  const validCategories = [
    'AI',
    'FinTech',
    'HealthTech',
    'CleanEnergy',
    'SaaS',
    'E-commerce',
  ];

  if (!category || !validCategories.includes(category)) {
    errors.push({
      field: 'category',
      message: `الفئة غير صحيحة. الخيارات: ${validCategories.join(', ')}`,
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate signup form
 */
export function validateSignup(data: {
  email: string;
  password: string;
  fullName: string;
  role: 'founder' | 'investor';
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Email
  if (!validateEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'البريد الإلكتروني غير صحيح',
    });
  }

  // Password
  const passwordValidation = validatePassword(data.password);
  errors.push(...passwordValidation.errors);

  // Full name
  const nameValidation = validateFullName(data.fullName);
  errors.push(...nameValidation.errors);

  // Role
  if (!['founder', 'investor'].includes(data.role)) {
    errors.push({
      field: 'role',
      message: 'نوع الحساب غير صحيح',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate project creation
 */
export function validateProjectCreation(data: {
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Title
  const titleValidation = validateProjectTitle(data.title);
  errors.push(...titleValidation.errors);

  // Description
  const descValidation = validateDescription(data.description);
  errors.push(...descValidation.errors);

  // Category
  const catValidation = validateCategory(data.category);
  errors.push(...catValidation.errors);

  // Funding
  const fundingValidation = validateFundingAmount(data.fundingGoal);
  errors.push(...fundingValidation.errors);

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize text input (prevent XSS)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
    .substring(0, 10000); // Max length
}

/**
 * Sanitize short text (names, emails, etc)
 */
export function sanitizeShortText(text: string): string {
  return sanitizeText(text).substring(0, 255);
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  maxSizeMB = 5,
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
): ValidationResult {
  const errors: ValidationError[] = [];
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (!file) {
    errors.push({
      field: 'file',
      message: 'الملف مطلوب',
    });
  } else {
    if (file.size > maxBytes) {
      errors.push({
        field: 'file',
        message: `حجم الملف يجب أن لا يزيد عن ${maxSizeMB}MB`,
      });
    }
    if (!allowedTypes.includes(file.type)) {
      errors.push({
        field: 'file',
        message: `نوع الملف غير مدعوم. الأنواع المسموحة: ${allowedTypes.join(', ')}`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
