import React, { useState, type MouseEventHandler } from 'react';
import type { Form, Field, GroupField, FormGroup, Section } from '../utilities/types'
import Select from 'react-select';

// Helper to get initial values for the form
const getInitialValues = (form: FormGroup[]) => {
	const values: any = {};
	const processFields = (fields: (Field | GroupField | Section)[], parent?: any) => {
		fields.forEach((field) => {
			if ('fields' in field && !('type' in field)) {
				// Section: recurse into its fields
				processFields(field.fields, parent);
			} else if ('type' in field && field.type === 'group' && 'fields' in field && Array.isArray(field.fields)) {
				parent[field.name] = {};
				field.fields.forEach((subField) => {
					parent[field.name][subField.name] = subField.defaultValue || '';
				});
			} else {
				parent[field.name] = field.defaultValue || '';
			}
		});
	};
	form.forEach((group) => {
		processFields(group.fields, values);
	});
	return values;
};

function toPerfectTitleCase(input: string): string {
	if (!input) return '';
	// Insert space before capital letters (except the first)
	let spaced = input.replace(/([a-z])([A-Z])/g, '$1 $2');

	// Normalize multiple spaces to a single space
	spaced = spaced.replace(/\s+/g, ' ').trim();

	// Capitalize first letter of each word
	return spaced
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

// Helper to evaluate valueCalculation for a field
function evaluateValueCalculation(calculation: string, values: any): any {
	if (!calculation) return '';
	try {
		// calculation is a JS expression string, e.g. '{return ((values.cargoDimensions.length * values.cargoDimensions.width * values.cargoDimensions.height) / 1000000) * values.numberOfContainers}'
		// It should be evaluated with access to all form values
		const fn = new Function('values', calculation);
		return fn(values);
	} catch (e) {
		console.error('Error evaluating valueCalculation:', calculation, e);
		return '';
	}
}

// Helper to render a field
const renderField = (
	field: Field | GroupField,
	value: any,
	onChange: (name: string, value: any) => void,
	parentName?: string,
	allValues?: any,
	errors?: Record<string, string>
) => {
	if (field.isHidden) return null;
	if (field.type === 'group' && 'fields' in field && Array.isArray(field.fields)) {
		const labelText = !field.hiddenLabel && (field.label || toPerfectTitleCase(field.name));
		return (
			<div key={field.name} className="">
				{labelText && <label className="block font-semibold mb-2 text-blue-900">{labelText}</label>}
				<div className="flex gap-4">
					{field.fields.map((subField) =>
						renderField(
							subField,
							value ? value[subField.name] : '',
							(subName, subValue) => onChange(field.name + '.' + subName, subValue),
							field.name,
							allValues,
							errors
						)
					)}
				</div>
			</div>
		);
	}
	// Icon rendering helpers
	const renderIcon = (icon: string | undefined, position: 'left' | 'right') => {
		if (!icon) return null;
		if (icon.startsWith('http') || icon.startsWith('/')) {
			return <img src={icon} alt="" className={`h-5 w-5 ${position === 'left' ? 'mr-2' : 'ml-2'}`} />;
		}
		// Assume icon is a className for an icon font or emoji
		return <span className={`inline-block align-middle ${position === 'left' ? 'mr-2' : 'ml-2'}`}>{icon}</span>;
	};
	if (field.type === 'select') {
		let options: string[] = [];
		if (Array.isArray(field.options)) {
			options = field.options;
		} else if (field.options && typeof field.options === 'object') {
			let depValue = '';
			if (field.optionsDependentOn) {
				if (field.optionsDependentOn.includes('.')) {
					const [group, sub] = field.optionsDependentOn.split('.');
					depValue = (allValues && allValues[group] && allValues[group][sub]) ? allValues[group][sub] : '';
				} else {
					if (parentName) {
						depValue = (allValues && allValues[parentName] && allValues[parentName][field.optionsDependentOn]) ? allValues[parentName][field.optionsDependentOn] : '';
					} else {
						depValue = (allValues && allValues[field.optionsDependentOn]) ? allValues[field.optionsDependentOn] : '';
					}
				}
			}
			if (depValue && field.options[depValue]) {
				options = field.options[depValue];
			}
		}
		const labelText = !field.hiddenLabel && (field.label || toPerfectTitleCase(field.name));
		const reactSelectOptions = options.map((opt: string) => ({ value: opt, label: opt }));
		const placeholderText = field.placeholder || (typeof labelText === 'string' ? `Select ${labelText.toLowerCase()}...` : 'Select...');
		const errorMsg = errors && errors[`${parentName ? parentName + '.' : ''}${field.name}`];
		return (
			<div key={field.name} className=" w-full">
				{labelText && <label className="block font-semibold mb-2 text-blue-900">{labelText}</label>}
				<div className={errorMsg ? "border border-red-500 rounded-lg" : ""}>
					<div className="relative flex items-center">
						{field.leftIcon && (
							<span className="absolute left-2 flex items-center pointer-events-none">
								{renderIcon(field.leftIcon, 'left')}
							</span>
						)}
						<div className={field.leftIcon ? 'w-full pl-8' : 'w-full'}>
							<Select
								name={field.name}
								options={reactSelectOptions}
								classNamePrefix="react-select"
								placeholder={placeholderText}
								value={value ? { value, label: value } : field.defaultValue ? { value: field.defaultValue, label: field.defaultValue } : null}
								onChange={(selected: any) => onChange(field.name, selected ? selected.value : '')}
								isClearable
								isMulti={field.isMultiSelect}
								isDisabled={field.isReadOnly || !!field.valueCalculation}
								required={field.required}
								styles={errorMsg ? { control: (base: any) => ({ ...base, borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' }) } : {}}
							/>
						</div>
						{field.rightIcon && (
							<span className="absolute right-2 flex items-center pointer-events-none">
								{renderIcon(field.rightIcon, 'right')}
							</span>
						)}
					</div>
				</div>
				{errorMsg && <p className="text-red-500 text-sm mt-1">{errorMsg}</p>}
			</div>
		);
	}
	if (field.type === 'number') {
		const labelText = !field.hiddenLabel && (field.label || toPerfectTitleCase(field.name));
		const errorMsg = errors && errors[`${parentName ? parentName + '.' : ''}${field.name}`];
		return (
			<div key={field.name} className=" w-full">
				{labelText && <label className="block font-semibold mb-2 text-blue-900">{labelText}</label>}
				<div className="relative flex items-center">
					{field.leftIcon && (
						<span className="absolute left-2 flex items-center pointer-events-none">
							{renderIcon(field.leftIcon, 'left')}
						</span>
					)}
					<input
						type="number"
						className={`text-ellipsis w-full border rounded-lg p-2 ${field.leftIcon ? 'pl-8' : ''} ${field.rightIcon ? 'pr-8' : ''} ${errorMsg ? 'border-red-500' : 'border-blue-200'}`}
						value={value || field.defaultValue || (field.valueCalculation && evaluateValueCalculation(field.valueCalculation, allValues)) || ''}
						min={field.min}
						max={field.max}
						step={field.step}
						onChange={(e) => onChange(field.name, e.target.value)}
						placeholder={field.placeholder}
						disabled={field.isReadOnly || !!field.valueCalculation}
						readOnly={field.isReadOnly || !!field.valueCalculation}
						required={field.required}
						onInput={(e) => {
							const input = e.target as HTMLInputElement;
							if (!input.validity.valid) input.value = value;
						}}
					/>
					{field.rightIcon && (
						<span className="absolute right-2 flex items-center pointer-events-none">
							{renderIcon(field.rightIcon, 'right')}
						</span>
					)}
				</div>
				{errorMsg && <p className="text-red-500 text-sm mt-1">{errorMsg}</p>}
			</div>
		);
	}
	// Default to text input
	const labelText = !field.hiddenLabel && (field.label || toPerfectTitleCase(field.name));
	const errorMsg = errors && errors[`${parentName ? parentName + '.' : ''}${field.name}`];
	return (
		<div key={field.name} className=" w-full">
			{labelText && <label className="block font-semibold mb-2 text-blue-900">{labelText}</label>}
			<div className="relative flex items-center">
				{field.leftIcon && (
					<span className="absolute left-2 flex items-center pointer-events-none">
						{renderIcon(field.leftIcon, 'left')}
					</span>
				)}
				<input
					type="text"
					className={`text-ellipsis w-full border rounded-lg p-2 ${field.leftIcon ? 'pl-8' : ''} ${field.rightIcon ? 'pr-8' : ''} ${errorMsg ? 'border-red-500' : 'border-blue-200'}`}
					value={value || field.defaultValue || (field.valueCalculation && evaluateValueCalculation(field.valueCalculation, allValues)) || ''}
					minLength={field.minLength}
					maxLength={field.maxLength}
					name={field.name}
					onChange={(e) => onChange(field.name, e.target.value)}
					placeholder={field.placeholder}
					disabled={field.isReadOnly || !!field.valueCalculation}
					readOnly={field.isReadOnly || !!field.valueCalculation}
					required={field.required}
					onInput={(e) => {
						const input = e.target as HTMLInputElement;
						if (!input.validity.valid) input.value = value;
					}}
				/>
				{field.rightIcon && (
					<span className="absolute right-2 flex items-center pointer-events-none">
						{renderIcon(field.rightIcon, 'left')}
					</span>
				)}
			</div>
			{errorMsg && <p className="text-red-500 text-sm mt-1">{errorMsg}</p>}
		</div>
	);
};

// Helper to flatten all fields (including inside sections) from a group
function flattenFields(fields: (Field | GroupField | Section)[]): (Field | GroupField)[] {
  const result: (Field | GroupField)[] = [];
  fields.forEach(item => {
    if ((item as Section).fields && !(item as Field).type) {
      // It's a section
      result.push(...flattenFields((item as Section).fields));
    } else {
      result.push(item as Field | GroupField);
    }
  });
  return result;
}

// Helper to render a field or section
const renderFieldOrSection = (
  item: Field | GroupField | Section,
  value: any,
  onChange: (name: string, value: any) => void,
  parentName?: string,
  allValues?: any,
  errors?: Record<string, string>
) => {
  if ((item as Section).fields && !(item as Field).type) {
    // It's a Section
    const section = item as Section;
    return (
      <div key={section.name} className="col-span-full">
        {section.label && (
          <div className="mb-3 text-lg font-semibold text-blue-800 border-b border-blue-200 pb-1">{section.label}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {section.fields.map((field) =>
            renderFieldOrSection(field, value ? value[field.name] : '', onChange, undefined, allValues, errors)
          )}
        </div>
      </div>
    );
  }
  // Otherwise, it's a Field or GroupField
  return renderField(item as Field | GroupField, value, onChange, parentName, allValues, errors);
};

// StageProgressBar component
interface StageProgressBarProps {
	stages: { name: string }[];
	stageStatus: { [groupName: string]: 'untouched' | 'incomplete' | 'complete' };
	currentStage: number;
	onStageClick: (idx: number) => void;
}

const StageProgressBar: React.FC<StageProgressBarProps> = ({ stages, stageStatus, currentStage, onStageClick }) => {
  // Colors for each status
  const statusColors = {
    complete: 'bg-blue-500 text-white',
    incomplete: 'bg-red-400 text-white',
    untouched: 'bg-blue-200 text-blue-700',
    current: 'bg-blue-400 text-white',
  };
  return (
    <div className="w-full flex overflow-hidden">
        {stages.map((group, idx) => {
          const isCurrent = idx === currentStage;
          const status = isCurrent
            ? 'current'
            : stageStatus[group.name] === 'complete'
            ? 'complete'
            : stageStatus[group.name] === 'incomplete'
            ? 'incomplete'
            : 'untouched';
          const zIndex = 10 + idx;
          const colorClass = statusColors[status];
          // Chevron shape for all except last
          const chevronStyle: React.CSSProperties = 
            {
                clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 18px 50%)',
                zIndex: zIndex,
                boxShadow: isCurrent ? '0 0 0 3px #a5b4fc' : undefined,
                transition: 'box-shadow 0.2s',
              };
          // Always show tooltip for all stages
          const fullLabel = toPerfectTitleCase(group.name);
          return (
            <button
              key={group.name}
              type="button"
              onClick={() => !isCurrent && stageStatus[group.name] !== 'untouched' && onStageClick(idx)}
              className={`min-w-0 flex-col items-center justify-center transition-all duration-200 shadow-sm focus:outline-none border-2 border-transparent ${colorClass} ${isCurrent ? '' : ''} ${stageStatus[group.name] === 'untouched' ? 'cursor-not-allowed opacity-60' : 'hover:scale-105'}`}
              style={{
                ...chevronStyle,
				marginLeft: idx > 0 ? '-18px' : '0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
				padding: '0 1.5rem',
              }}
              disabled={isCurrent || stageStatus[group.name] === 'untouched'}
              aria-current={isCurrent ? 'step' : undefined}
              title={fullLabel}
            >
              {fullLabel}
            </button>
          );
        })}
    </div>
  );
};

const DynamicQuoteForm: React.FC<{ formConfig: Form }> = ({ formConfig }) => {
	const form = formConfig.formGroup;
	const showformStageName = formConfig.showformStageName ?? true;
	const [stage, setStage] = useState(0);
	const [values, setValues] = useState(getInitialValues(form));
	const [stageErrors, setStageErrors] = useState<Record<string, string>>({});
	const [stageStatus, setStageStatus] = useState<{ [groupName: string]: 'untouched' | 'incomplete' | 'complete' }>(() => {
		const status: { [groupName: string]: 'untouched' | 'incomplete' | 'complete' } = {};
		form.forEach(group => {
			status[group.name] = 'untouched';
		});
		return status;
	});

	const handleChange = (name: string, value: any) => {
		let newValues;
		if (name.includes('.')) {
			const [group, sub] = name.split('.');
			newValues = {
				...values,
				[group]: {
					...values[group],
					[sub]: value
				}
			};
		} else {
			newValues = { ...values, [name]: value };
		}

		// Update calculated fields after any change
		const updateCalculatedFields = (fields: (Field | GroupField | Section)[], parentObj: any, allValues: any) => {
			fields.forEach(field => {
				if ('fields' in field && !('type' in field)) {
					// Section
					updateCalculatedFields(field.fields, parentObj, allValues);
				} else if ('type' in field && field.type === 'group' && 'fields' in field && Array.isArray(field.fields)) {
					if (!parentObj[field.name]) parentObj[field.name] = {};
					updateCalculatedFields(field.fields, parentObj[field.name], allValues);
				} else if (field.valueCalculation) {
					parentObj[field.name] = evaluateValueCalculation(field.valueCalculation, allValues);
				}
			});
		};
		form.forEach(group => {
			updateCalculatedFields(group.fields, newValues, newValues);
		});

		setValues(newValues);
		// Trigger validation for the current stage on every change
		const errors = validateStage(flattenFields(currentGroup.fields), newValues);
		setStageErrors(errors);
	};

	const validateStage = (fields: (Field | GroupField)[], values: any, parentName?: string): Record<string, string> => {
		const errors: Record<string, string> = {};
		fields.forEach((field) => {
			if (field.type === 'group' && 'fields' in field && Array.isArray(field.fields)) {
				const groupErrors = validateStage(field.fields, values[field.name] || {}, field.name);
				Object.keys(groupErrors).forEach((key) => {
					errors[`${field.name}.${key}`] = groupErrors[key];
				});
			} else {
				const val = parentName ? (values && values[field.name]) : values[field.name];
				if (field.required && (val === '' || val === undefined || val === null)) {
					errors[field.name] = `${field.label || toPerfectTitleCase(field.name)} is required.`;
				}
				if (field.validation && Array.isArray(field.validation)) {
					field.validation.forEach((rule) => {
						if (rule.type === 'Regex' && rule.regex && val) {
							const regex = new RegExp(rule.regex);
							if (!regex.test(val)) {
								errors[field.name] = rule.message;
							}
						}
						if (rule.type === 'Required' && typeof val === 'string' && val.length === 0) {
							errors[field.name] = rule.message;
						}
						if (rule.type === 'MinLength' && typeof val === 'string' && val.length < (field.minLength || 0)) {
							errors[field.name] = rule.message;
						}
						if (rule.type === 'MaxLength' && typeof val === 'string' && val.length > (field.maxLength || Infinity)) {
							errors[field.name] = rule.message;
						}
						if (rule.type === 'MinValue' && typeof val === 'number' && val < (field.min || 0)) {
							errors[field.name] = rule.message;
						}
						if (rule.type === 'MaxValue' && typeof val === 'number' && val > (field.max || Infinity)) {
							errors[field.name] = rule.message;
						}
						if (rule.type === 'Function' && rule.function) {
							// rule.function is the body of the function: (field, fieldValue, formValue) => { ... }
							let fn: Function | undefined;
							try {
								fn = new Function('fieldName', 'fieldValue', 'formValue', rule.function);
							} catch (e) {
								console.error('Invalid custom validation function:', e);
							}
							if (typeof fn === 'function' && !fn(field, val, values)) {
								errors[field.name] = rule.message;
							}
						}
					});
				}
			}
		});
		return errors;
	};

	const handleNextOrSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if(stage === form.length - 1) {
			handleSubmit();
			return;
		}
		const errors = validateStage(flattenFields(currentGroup.fields), values);
		if (Object.keys(errors).length > 0) {
			setStageErrors(errors);
			// Mark current stage as incomplete
			setStageStatus(prev => ({ ...prev, [currentGroup.name]: 'incomplete' }));
			return;
		}
		setStageErrors({});
		// Mark current stage as complete
		setStageStatus(prev => ({ ...prev, [currentGroup.name]: 'complete' }));
		setStage((prev) => prev + 1);
	};
	const handlePrev = () => setStage(stage - 1)
	const handleSubmit = () => {
		const errors = validateStage(flattenFields(currentGroup.fields), values);
		if (Object.keys(errors).length > 0) {
			setStageErrors(errors);
			// Mark current stage as incomplete
			setStageStatus(prev => ({ ...prev, [currentGroup.name]: 'incomplete' }));
			return;
		}
		setStageErrors({});
		// Mark current stage as complete
		setStageStatus(prev => ({ ...prev, [currentGroup.name]: 'complete' }));
		alert(JSON.stringify(values, null, 2));
		console.log('Form submitted:', values);
	};

	const currentGroup = form[stage];

	const handleStageClick = (idx: number) => {
		setStage(idx);
	};

	return (
		<div className="gap-4 flex flex-col w-full max-w-5xl bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-blue-100 m-auto">
			<h2 className="text-3xl font-bold text-center text-blue-700">{formConfig.name}</h2>
			<StageProgressBar
				stages={form}
				stageStatus={stageStatus}
				currentStage={stage}
				onStageClick={handleStageClick}
			/>
			<form noValidate onSubmit={handleNextOrSubmit}
				className="flex flex-col w-full "
			>
				{showformStageName && <h3 className="text-xl font-semibold mb-4 text-blue-800">{toPerfectTitleCase(currentGroup.name)}</h3>}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{currentGroup.fields.map((field) =>
						renderFieldOrSection(
							field,
							values[field.name],
							handleChange,
							undefined,
							values,
							stageStatus[currentGroup.name] !== 'untouched' ? stageErrors : {} // Only show errors if not untouched
						)
					)}
				</div>
				<div className="flex justify-between mt-8">
					{stage > 0 && (
						<button type="button" onClick={handlePrev} className="bg-gray-300 px-4 py-2 rounded">Previous</button>
					)}
					<button type="submit" className={`${stage === form.length - 1? "bg-green-600": "bg-blue-600"} text-white px-4 py-2 rounded`}>
						{stage === form.length - 1? "Submit": "Next"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default DynamicQuoteForm;
