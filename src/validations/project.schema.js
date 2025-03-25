const Joi = require("joi");

const projectSchema = {
    create: Joi.object({
        name: Joi.string().required().min(2).max(50).messages({
            "string.min": "Name must be at least 2 characters long",
            "string.max": "Name cannot exceed 50 characters",
            "any.required": "Name is required",
        }),

        description: Joi.string().required().min(2).max(255).messages({
            "string.min": "Description must be at least 2 characters long",
            "string.max": "Description cannot exceed 255 characters",
            "any.required": "Description is required",
        }),

        organization_id: Joi.string().required().messages({
            "any.required": "Organization ID is required",
        }),
    }),

    update: Joi.object({
        name: Joi.string().min(2).max(50).messages({
            "string.min": "Name must be at least 2 characters long",
            "string.max": "Name cannot exceed 50 characters",
        }),

        description: Joi.string().min(2).max(255).messages({
            "string.min": "Description must be at least 2 characters long",
            "string.max": "Description cannot exceed 255 characters",
        }),
    }),    
}