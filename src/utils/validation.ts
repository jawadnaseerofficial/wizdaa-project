import Joi from 'joi';
import { RequestStatus } from '@prisma/client';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name must not exceed 50 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name must not exceed 50 characters',
    'any.required': 'Last name is required',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const createTimeOffRequestSchema = Joi.object({
  startDate: Joi.date().iso().greater('now').required().messages({
    'date.base': 'Start date must be a valid date',
    'date.greater': 'Start date must be in the future',
    'any.required': 'Start date is required',
  }),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'date.base': 'End date must be a valid date',
    'date.greater': 'End date must be after start date',
    'any.required': 'End date is required',
  }),
  reason: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Reason must not exceed 500 characters',
  }),
});

export const updateTimeOffRequestSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(RequestStatus))
    .required()
    .messages({
      'any.only': `Status must be one of: ${Object.values(RequestStatus).join(', ')}`,
      'any.required': 'Status is required',
    }),
});

export const listTimeOffRequestsSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(RequestStatus))
    .optional(),
  startDateFrom: Joi.date().iso().optional(),
  startDateTo: Joi.date().iso().optional(),
  userId: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
});

export const validateSchema = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });

  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    throw new Error(JSON.stringify(details));
  }

  return value;
};