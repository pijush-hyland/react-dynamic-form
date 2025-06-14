import React, { useReducer, useContext, useState } from 'react';
import { AppContext } from '../context';
import { useNavigate } from 'react-router-dom';

export type ContactInfo = {
	contactName: string;
	contactEmail: string;
	contactPhone: string;
};

export default function ContactForm() {
	const [form, setForm] = useReducer(
		(state: ContactInfo, action: { name: string; value: string }) => ({ ...state, [action.name]: action.value }),
		{
			contactName: '',
			contactEmail: '',
			contactPhone: ''
		}
	);
	const { dispatch } = useContext(AppContext);
	const navigate = useNavigate();
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setForm({ name, value });
	}

	function validate(form: ContactInfo) {
		const newErrors: { [key: string]: string } = {};
		if (!form.contactName.trim()) newErrors.contactName = 'Name is required.';
		if (!form.contactEmail.trim()) {
			newErrors.contactEmail = 'Email is required.';
		} else if (!/^\S+@\S+\.\S+$/.test(form.contactEmail)) {
			newErrors.contactEmail = 'Enter a valid email address.';
		}
		if (!form.contactPhone.trim()) {
			newErrors.contactPhone = 'Phone number is required.';
		} else if (!/^[\d\s+\-()]{7,}$/.test(form.contactPhone)) {
			newErrors.contactPhone = 'Enter a valid phone number.';
		}
		return newErrors;
	}

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const validationErrors = validate(form);
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}
		setErrors({});
		dispatch({ type: 'SET_CONTACT_INFO', payload: form });
		navigate('/quote');
	}

	return (
		<form className="flex flex-col w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-blue-100 mx-auto mt-16" onSubmit={handleSubmit} noValidate>
			<h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Contact Information</h2>
			<div className="grid grid-cols-1 gap-6">
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Name</label>
					<input type="text" name="contactName" value={form.contactName} onChange={handleChange} className={`w-full border ${errors.contactName ? 'border-red-500' : 'border-blue-200'} rounded-lg p-2 focus:ring-2 focus:ring-blue-400`} required />
					{errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
				</div>
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Email</label>
					<input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} className={`w-full border ${errors.contactEmail ? 'border-red-500' : 'border-blue-200'} rounded-lg p-2 focus:ring-2 focus:ring-blue-400`} required />
					{errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
				</div>
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Phone Number</label>
					<input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} className={`w-full border ${errors.contactPhone ? 'border-red-500' : 'border-blue-200'} rounded-lg p-2 focus:ring-2 focus:ring-blue-400`} required />
					{errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
				</div>
			</div>
			<button type="submit" className="mt-10 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition text-lg shadow-md">Continue</button>
		</form>
	);
}
