import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context';
import quoteOptions from '../assets/quoteOptions.json';
import Select from 'react-select';

type QuoteFormState = {
	direction: string;
	shipmentType: string;
	containerType: string;
	numberOfContainers: number;
	commodity: string;
	incoterm: string;
	specialHandling: string;
	origin: string;
	destination: string;
	weight: string;
	volume: string;
	insurance: string;
	additionalServices: string[];
	carrier: string;
};

export default function QuoteForm() {
	const { state } = useContext(AppContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (!state.contactInfo) {
			navigate('/');
		}
	}, [state.contactInfo, navigate]);

	const [form, setForm] = useState<QuoteFormState>({
		direction: '',
		shipmentType: '',
		containerType: '',
		numberOfContainers: 1,
		commodity: '',
		incoterm: '',
		specialHandling: '',
		origin: '',
		destination: '',
		weight: '',
		volume: '',
		insurance: '',
		additionalServices: [],
		carrier: ''
	});
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const directions = quoteOptions.directions;
	const shipmentTypes = quoteOptions.shipmentTypes;
	const containerTypes = quoteOptions.containerTypes;
	const commodities = quoteOptions.commodities;
	const incoterms = quoteOptions.incoterms;
	const specialHandlings = quoteOptions.specialHandlings;
	const insuranceOptions = quoteOptions.insuranceOptions;
	const additionalServices = quoteOptions.additionalServices;
	const carriers = quoteOptions.carriers;

	// Helper to convert array to react-select options
	const toOptions = (arr: string[]) => arr.map((opt) => ({ value: opt, label: opt }));

	// Handler for all single-value selects
	const handleSelectChange = (name: keyof QuoteFormState) => (selected: any) => {
		setForm((prev: QuoteFormState) => ({ ...prev, [name]: selected ? selected.value : '' }));
	};

	// Handler for multi-value selects (for additionalServices)
	const handleMultiSelectChange = (selected: any) => {
		setForm((prev: QuoteFormState) => ({ ...prev, additionalServices: selected ? selected.map((s: any) => s.value) : [] }));
	};

	const handleCarrierChange = (selected: any) => {
		const values = Array.isArray(selected) ? selected.map((s) => s.value).join(',') : '';
		setForm((prev: QuoteFormState) => ({ ...prev, carrier: values }));
	};

	// Generic handler for text and number input fields
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type } = e.target;
		setForm((prev: QuoteFormState) => ({
			...prev,
			[name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
		}));
	};

	const validate = (form: QuoteFormState) => {
		const newErrors: { [key: string]: string } = {};
		if (!form.direction) newErrors.direction = 'Direction is required.';
		if (!form.shipmentType) newErrors.shipmentType = 'Shipment type is required.';
		if (!form.containerType) newErrors.containerType = 'Container type is required.';
		if (!form.numberOfContainers || form.numberOfContainers < 1) newErrors.numberOfContainers = 'Enter a valid number of containers.';
		if (!form.commodity) newErrors.commodity = 'Commodity is required.';
		if (!form.incoterm) newErrors.incoterm = 'INCOTERM is required.';
		if (!form.specialHandling) newErrors.specialHandling = 'Special handling is required.';
		if (!form.origin.trim()) newErrors.origin = 'Origin is required.';
		if (!form.destination.trim()) newErrors.destination = 'Destination is required.';
		if (!form.weight || isNaN(Number(form.weight)) || Number(form.weight) < 0) newErrors.weight = 'Enter a valid weight.';
		if (!form.volume || isNaN(Number(form.volume)) || Number(form.volume) < 0) newErrors.volume = 'Enter a valid volume.';
		if (!form.insurance) newErrors.insurance = 'Insurance selection is required.';
		if (!form.carrier) newErrors.carrier = 'Preferred carrier is required.';
		return newErrors;
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const validationErrors = validate(form);
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}
		setErrors({});
		// Placeholder for submit logic
		alert('Quote request submitted!');
	};

	return (
		<form className="flex flex-col w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-blue-100 m-auto" onSubmit={handleSubmit}>
			<h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Get a Shipment Quote</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Direction */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Direction</label>
					<Select
						name="direction"
						options={toOptions(directions)}
						classNamePrefix="react-select"
						placeholder="Select direction..."
						value={form.direction ? { value: form.direction, label: form.direction } : null}
						onChange={handleSelectChange('direction')}
						isClearable
					/>
					{errors.direction && <p className="text-red-500 text-sm mt-1">{errors.direction}</p>}
				</div>
				{/* Shipment Type */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Shipment Type</label>
					<Select
						name="shipmentType"
						options={toOptions(shipmentTypes)}
						classNamePrefix="react-select"
						placeholder="Select shipment type..."
						value={form.shipmentType ? { value: form.shipmentType, label: form.shipmentType } : null}
						onChange={handleSelectChange('shipmentType')}
						isClearable
					/>
					{errors.shipmentType && <p className="text-red-500 text-sm mt-1">{errors.shipmentType}</p>}
				</div>
				{/* Container Type */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Container Type (FCL/LCL)</label>
					<Select
						name="containerType"
						options={toOptions(containerTypes)}
						classNamePrefix="react-select"
						placeholder="Select container type..."
						value={form.containerType ? { value: form.containerType, label: form.containerType } : null}
						onChange={handleSelectChange('containerType')}
						isClearable
					/>
					{errors.containerType && <p className="text-red-500 text-sm mt-1">{errors.containerType}</p>}
				</div>
				{/* Number of Containers */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Number of Containers</label>
					<input type="number" name="numberOfContainers" min="1" max="100" value={form.numberOfContainers} onChange={handleChange} className={`w-full border ${errors.numberOfContainers ? 'border-red-500' : 'border-blue-200'} rounded-lg p-2 focus:ring-2 focus:ring-blue-400`} />
					{errors.numberOfContainers && <p className="text-red-500 text-sm mt-1">{errors.numberOfContainers}</p>}
				</div>
				{/* Commodity Description */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Commodity Description</label>
					<Select
						name="commodity"
						options={toOptions(commodities)}
						classNamePrefix="react-select"
						placeholder="Select commodity..."
						value={form.commodity ? { value: form.commodity, label: form.commodity } : null}
						onChange={handleSelectChange('commodity')}
						isClearable
					/>
					{errors.commodity && <p className="text-red-500 text-sm mt-1">{errors.commodity}</p>}
				</div>
				{/* INCOTERM */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">INCOTERM</label>
					<Select
						name="incoterm"
						options={toOptions(incoterms)}
						classNamePrefix="react-select"
						placeholder="Select INCOTERM..."
						value={form.incoterm ? { value: form.incoterm, label: form.incoterm } : null}
						onChange={handleSelectChange('incoterm')}
						isClearable
					/>
					{errors.incoterm && <p className="text-red-500 text-sm mt-1">{errors.incoterm}</p>}
				</div>
				{/* Special Handling */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Special Handling (if any)</label>
					<Select
						name="specialHandling"
						options={toOptions(specialHandlings)}
						classNamePrefix="react-select"
						placeholder="Select special handling..."
						value={form.specialHandling ? { value: form.specialHandling, label: form.specialHandling } : null}
						onChange={handleSelectChange('specialHandling')}
						isClearable
					/>
					{errors.specialHandling && <p className="text-red-500 text-sm mt-1">{errors.specialHandling}</p>}
				</div>
				{/* Origin Port/Location */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Origin Port/Location</label>
					<input type="text" name="origin" value={form.origin} onChange={handleChange} className={`w-full border ${errors.origin ? 'border-red-500' : 'border-blue-200'} rounded-lg p-2 focus:ring-2 focus:ring-blue-400`} />
					{errors.origin && <p className="text-red-500 text-sm mt-1">{errors.origin}</p>}
				</div>
				{/* Destination Port/Location */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Destination Port/Location</label>
					<input type="text" name="destination" value={form.destination} onChange={handleChange} className={`w-full border ${errors.destination ? 'border-red-500' : 'border-blue-200'} rounded-lg p-2 focus:ring-2 focus:ring-blue-400`} />
					{errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
				</div>
				{/* Weight */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Weight (Gross/Chargeable) (kg)</label>
					<input type="number" name="weight" min="0" max="100000" value={form.weight} onChange={handleChange} className={`w-full border ${errors.weight ? 'border-red-500' : 'border-blue-200'} rounded-lg p-2 focus:ring-2 focus:ring-blue-400`} />
					{errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
				</div>
				{/* Volume */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Volume (CBM)</label>
					<input type="number" name="volume" min="0" max="1000" value={form.volume} onChange={handleChange} className={`w-full border ${errors.volume ? 'border-red-500' : 'border-blue-200'} rounded-lg p-2 focus:ring-2 focus:ring-blue-400`} />
					{errors.volume && <p className="text-red-500 text-sm mt-1">{errors.volume}</p>}
				</div>
				{/* Insurance Required */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Insurance Required</label>
					<Select
						name="insurance"
						options={toOptions(insuranceOptions)}
						classNamePrefix="react-select"
						placeholder="Select insurance..."
						value={form.insurance ? { value: form.insurance, label: form.insurance } : null}
						onChange={handleSelectChange('insurance')}
						isClearable
					/>
					{errors.insurance && <p className="text-red-500 text-sm mt-1">{errors.insurance}</p>}
				</div>
				{/* Additional Services Required */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Additional Services Required</label>
					<Select
						isMulti
						name="additionalServices"
						options={toOptions(additionalServices)}
						classNamePrefix="react-select"
						placeholder="Select additional services..."
						value={form.additionalServices.map((s) => ({ value: s, label: s }))}
						onChange={handleMultiSelectChange}
					/>
				</div>
				{/* Preferred Carrier */}
				<div>
					<label className="block font-semibold mb-2 text-blue-900">Preferred Carrier</label>
					<Select
						isMulti
						name="carrier"
						options={toOptions(carriers)}
						classNamePrefix="react-select"
						placeholder="Select carrier(s)..."
						value={form.carrier ? form.carrier.split(',').map((c: string) => ({ value: c, label: c })) : []}
						onChange={handleCarrierChange}
					/>
					{errors.carrier && <p className="text-red-500 text-sm mt-1">{errors.carrier}</p>}
				</div>
			</div>
			<button type="submit" className="mt-10 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition text-lg shadow-md">Submit Quote Request</button>
		</form>
	);
}
