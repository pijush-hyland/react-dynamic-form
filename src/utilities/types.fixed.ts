// This file contains type definitions for the dynamic form system used in the application.
// Types are updated to match the latest schema and UI logic, including advanced field, group, section, and stage options.

export type Type =
    | 'text'        // Single-line text input
    | 'textarea'    // Multi-line text input
    | 'email'       // Email input
    | 'number'      // Numeric input
    | 'select'      // Dropdown select
    | 'multiselect' // Multi-select dropdown
    | 'password'    // Password input
    | 'checkbox'    // Checkbox input
    | 'radio'       // Radio button group
    | 'date'        // Date picker
    | 'file'        // File upload
    | 'toggle'      // Toggle switch
    | 'color'       // Color picker
    | 'range'       // Range slider
    | 'time'        // Time picker
    | 'url'         // URL input
    | 'hidden'      // Hidden field
    | 'button';     // Button (for custom actions)

export const TypeValues = {
    Text: 'text',
    Textarea: 'textarea',
    Email: 'email',
    Number: 'number',
    Select: 'select',
    Multiselect: 'multiselect',
    Password: 'password',
    Checkbox: 'checkbox',
    Radio: 'radio',
    Date: 'date',
    File: 'file',
    Toggle: 'toggle',
    Color: 'color',
    Range: 'range',
    Time: 'time',
    Url: 'url',
    Hidden: 'hidden',
    Button: 'button',
} as const;

export type FieldValidation = {
    type: string; // Validation type: Regex, Function, Required, MinLength, MaxLength, MinValue, MaxValue
    regex?: string; // Regex pattern for validation (if type is Regex)
    function?: string; // Custom validation function body as string (if type is Function)
    message: string; // Error message to display on validation failure
};

export type FieldBase = {
    name: string;   // Field name (unique within its group/section)
    isField: true; // Always true for Field
    type?: Type;   // Input type (see InputType)
    label?: string;  // Field or group label (optional for non-group fields)
    hiddenLabel?: boolean; // Hide the label visually
    placeholder?: string; // Placeholder text for the field
    defaultValue?: string; // Default value for the field
    minLength?: number; // Minimum length (for text fields)
    maxLength?: number; // Maximum length (for text fields)
    min?: number; // Minimum value (for number fields)
    max?: number; // Maximum value (for number fields)
    step?: number; // Step value (for number fields)
    value?: string | number | boolean; // Current value (optional, for controlled fields)
    valueCalculation?: string // JS function body as string to calculate value from other fields
    options?: string[] | {[key: string]: string []}; // Options for select/multiselect fields (can be dependent)
    optionsDependentOn?: string; // Name of the field this field's options depend on
    isMultiSelect?: boolean; // Allow multiple selections (for select fields)
    required?: boolean; // Field is required
    validation?: FieldValidation[]; // Array of validation rules
    disabledDependencies?: string[]; // Names of fields that, if not filled/valid, disable this field
    isHidden?: boolean; // Hide this field in the UI
    isReadOnly?: boolean; // Make this field read-only
    leftIcon?: string; // Icon (URL/class/emoji) to show on the left
    rightIcon?: string; // Icon (URL/class/emoji) to show on the right
};

export type Field = FieldBase;

export type GroupField = {
    name: string;   // Group name (unique within its section)
    label?: string; // Optional label for the group
    hiddenLabel?: boolean; // Hide the group label visually
    isGroup: boolean; // Type is true for GroupField
    fields: Field[]; // Array of fields in the group
};

export type Section = {
    name: string; // Section name (unique within the stage)
    isSection: boolean; // Always true for sections
    label?: string; // Optional section label
    fields: (Field | GroupField)[]; // Fields and groups within the section
};

export type Stage = {
    name: string; // Stage name (unique within the form)
    isStage: boolean; // Always true for stages
    fields: (Field | GroupField | Section)[];   // Fields, groups, and sections in the stage
};

// The top-level form type, containing all stages
export type Form = {
    name: string; // Form name
    isForm: boolean; // Always true for forms
    description?: string; // Optional form description
    hideName?: boolean; // Show the stage name in the UI
    stages: Stage | Stage[]; // Array of stages in the form
};

