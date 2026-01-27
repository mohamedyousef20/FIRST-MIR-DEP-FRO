import Joi from 'joi'

export const userValidation = {
  register: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'الاسم الأول يجب أن يكون على الأقل 2 حرف',
        'string.max': 'الاسم الأول يجب أن لا يتجاوز 50 حرف',
        'any.required': 'الاسم الأول مطلوب'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'الاسم الأخير يجب أن يكون على الأقل 2 حرف',
        'string.max': 'الاسم الأخير يجب أن لا يتجاوز 50 حرف',
        'any.required': 'الاسم الأخير مطلوب'
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'البريد الإلكتروني غير صحيح',
        'any.required': 'البريد الإلكتروني مطلوب'
      }),
    password: Joi.string()
      .min(8)
      .max(50)
      .required()
      .messages({
        'string.min': 'كلمة المرور يجب أن تكون على الأقل 8 أحرف',
        'string.max': 'كلمة المرور يجب أن لا تتجاوز 50 حرف',
        'any.required': 'كلمة المرور مطلوبة'
      }),
    phone: Joi.string()
      .pattern(/^\+?\d{10,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'رقم الهاتف غير صحيح',
        'any.required': 'رقم الهاتف مطلوب'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'البريد الإلكتروني غير صحيح',
        'any.required': 'البريد الإلكتروني مطلوب'
      }),
    password: Joi.string()
      .min(8)
      .max(50)
      .required()
      .messages({
        'string.min': 'كلمة المرور يجب أن تكون على الأقل 8 أحرف',
        'string.max': 'كلمة المرور يجب أن لا تتجاوز 50 حرف',
        'any.required': 'كلمة المرور مطلوبة'
      })
  }),

  profile: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'الاسم الأول يجب أن يكون على الأقل 2 حرف',
        'string.max': 'الاسم الأول يجب أن لا يتجاوز 50 حرف',
        'any.required': 'الاسم الأول مطلوب'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'الاسم الأخير يجب أن يكون على الأقل 2 حرف',
        'string.max': 'الاسم الأخير يجب أن لا يتجاوز 50 حرف',
        'any.required': 'الاسم الأخير مطلوب'
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'البريد الإلكتروني غير صحيح',
        'any.required': 'البريد الإلكتروني مطلوب'
      }),
    phone: Joi.string()
      .pattern(/^\+?\d{10,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'رقم الهاتف غير صحيح',
        'any.required': 'رقم الهاتف مطلوب'
      })
  })
};
