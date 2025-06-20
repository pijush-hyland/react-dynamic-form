// This file contains type definitions for the dynamic form system used in the application.
// Types are updated to match the latest schema and UI logic, including advanced field, group, section, and stage options.

export const TypeValues = {
    form: 'form',
    stage: 'stage',
    section: 'section',
    group: 'group',
    field: 'field'
} as const;
export type Type = keyof typeof TypeValues;

export const InputTypeValues = {
    text: 'text',
    textarea: 'textarea',
    email: 'email',
    number: 'number',
    select: 'select',
    multiselect: 'multiselect',
    password: 'password',
    checkbox: 'checkbox',
    radio: 'radio',
    date: 'date',
    file: 'file',
    toggle: 'toggle',
    color: 'color',
    range: 'range',
    time: 'time',
    url: 'url',
    hidden: 'hidden',
} as const;

export type InputType = keyof typeof InputTypeValues;

export type FieldValidation = {
    type: string; // Validation type: Regex, Function, Required, MinLength, MaxLength, MinValue, MaxValue
    regex?: string; // Regex pattern for validation (if type is Regex)
    function?: string; // Custom validation function body as string (if type is Function)
    message: string; // Error message to display on validation failure
};

export type Field = {
    name: string;   // Field name (unique within its group/section)
    type: (typeof TypeValues)['field']; // Field type, always 'field'
    isField: true; // Always true for Field
    inputType?: InputType;   // Input type (see InputType)
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

export type GroupField = {
    name: string;   // Group name (unique within its section)
    type: (typeof TypeValues)['group']; // Group type, always 'group'
    label?: string; // Optional label for the group
    hiddenLabel?: boolean; // Hide the group label visually
    isHidden?: boolean; // Hide this group in the UI
    isGroup: boolean; // Type is true for GroupField
    fields: Field[]; // Array of fields in the group
};

export type Section = {
    name: string; // Section name (unique within the stage)
    type: (typeof TypeValues)['section']; // Section type, always 'section'
    isSection: boolean; // Always true for sections
    label?: string; // Optional section label
    fields: (Field | GroupField)[]; // Fields and groups within the section
};

export type Stage = {
    name: string; // Stage name (unique within the form)
    type: (typeof TypeValues)['stage']; // Stage type, always 'stage'
    isStage: boolean; // Always true for stages
    fields: (Field | GroupField | Section)[];   // Fields, groups, and sections in the stage
};

// The top-level form type, containing all stages
export type Form = {
    name: string; // Form name
    type: (typeof TypeValues)['form']; // Form type, always 'form'
    isForm: boolean; // Always true for forms
    description?: string; // Optional form description
    hideName?: boolean; // Show the stage name in the UI
    stages: Stage[]; // Array of stages in the form
};
