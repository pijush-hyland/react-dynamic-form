// This file contains type definitions for the form structure used in the application.

export type FieldValidation = {
    type: string; // Regex, Function, Required, MinLength, MaxLength, MinValue, MaxValue
    regex?: string; // Regular expression for validation
    function?: string; // Function name for custom validation, (fieldName, fieldValue, formValue)=> {}; function will be called with the field value and with the form values and with the field name
    message: string; // Error message for validation
};

export type FieldBase = {
    name: string;   // Name of the form field
    type?: string;   // Type of the form field (e.g., text, email, number, group)
    label?: string;  // Label for the form field or group (optional for non-group fields)
    hiddenLabel?: boolean; // Whether to hide the label for the field
    placeholder?: string; // Placeholder text for the form field
    defaultValue?: string; // Default value for the field
    minLength?: number; // Minimum length for text fields
    maxLength?: number; // Maximum length for text fields
    min?: number; // Minimum value for number fields
    max?: number; // Maximum value for number fields
    step?: number; // Step value for number fields

    value?: string | number | boolean; // Current value of the field
    valueCalculation?: string // Function to calculate the value based on other fields

    options?: string[] | {[key: string]: string []}; // Options for select fields
    optionsDependentOn?: string; // Field that determines the options available
    isMultiSelect?: boolean; // Whether the field allows multiple selections

    required?: boolean; // Whether the field is required
    validation?: FieldValidation[];

    disabledDependencies?: string[]; // Fields that disable this field when they are not filled and validated
    isHidden?: boolean; // Whether the field is hidden
    isReadOnly?: boolean; // Whether the field is read-only
    leftIcon?: string; // Icon to display on the left side of the field
    rightIcon?: string; // Icon to display on the right side of the field
};

export type Field = FieldBase;

export type GroupField = FieldBase & {
    fields: Field[];
};

export type Section = {
    name: string; // Name of the section
    label?: string; // Optional label for the section
    fields: (Field | GroupField)[]; // Fields within the section
};

export type FormGroup = {
    name: string; // Name of the form group
    fields: (Field | GroupField | Section)[];   // Array of fields or sections in the form group
};

// This type defines the structure of a form, which is an array of form groups. 
export type Form = {
    name: string; // Name of the form
    description?: string; // Description of the form
    showformStageName?: boolean; // Whether to show the form stage name
    formGroup: FormGroup[]
};

