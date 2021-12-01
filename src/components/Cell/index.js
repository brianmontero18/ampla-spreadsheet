import * as React from 'react';
import Tooltip from '@reach/tooltip';
import { store, updateCellValue, updateCellSelection } from '../../store';
import '@reach/tooltip/styles.css';

export default function Cell({ cell: { ref, columnId, defaultValue = '' } }) {
	const [localValue, setLocalValue] = React.useState(defaultValue);
	const [cellRefValue, setCellRefValue] = React.useState('');
	const [editMode, setEditMode] = React.useState(false);
	const unsubscribeRef = React.useRef();

	React.useEffect(() => {
		subscribe(defaultValue, unsubscribeRef, ref, setCellRefValue);
	}, [defaultValue, ref]);

	function handleOnBlur() {
		getElement(columnId).classList.remove('header-selected');
		setEditMode(false);
	}

	function handleValue(value) {
		setLocalValue(value);
		updateCellValue(ref, value);
		handleOnBlur();

		if (!unsubscribeRef.current) {
			subscribe(value, unsubscribeRef, ref, setCellRefValue);
		} else if (!isValidCellRef(value)) {
			unsubscribeRef.current();
			setCellRefValue(value);
		}
	}

	return (
		<td
			onFocus={() => {
				getElement(columnId).className = 'header-selected';
				updateCellSelection(ref, localValue);
			}}
			onBlur={handleOnBlur}
		>
			{editMode ? (
				<input
					id="edit-input"
					key="edit-input"
					autoFocus
					defaultValue={localValue}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === 'Escape') {
							handleValue(e.target.value);
						}
					}}
					onBlur={(e) => handleValue(e.target.value)}
				/>
			) : cellRefValue === CIRCULAR_REFERENCE_ERROR ? (
				<Tooltip label={ERROR_MESSAGE}>
					<ReadOnlyInput
						setEditMode={setEditMode}
						cellRefValue={cellRefValue}
					/>
				</Tooltip>
			) : (
				<ReadOnlyInput
					setEditMode={setEditMode}
					cellRefValue={cellRefValue}
				/>
			)}
		</td>
	);
}

function ReadOnlyInput({ setEditMode, cellRefValue }) {
	return (
		<input
			key="readonly-input"
			style={{ cursor: 'pointer' }}
			readOnly
			onDoubleClick={() => setEditMode(true)}
			onKeyDown={(e) => {
				if (/^[\w=]{1}$/.test(e.key)) setEditMode(true);
			}}
			value={cellRefValue}
		/>
	);
}

const CIRCULAR_REFERENCE_ERROR = '#REF!';
const ERROR_MESSAGE =
	'A circular dependency has been detected. Please reference the cell correctly';

function subscribe(value, unsubscribeRef, ref, setCellRefValue) {
	if (isValidCellRef(value)) {
		unsubscribeRef.current = store.subscribe(
			(store) => getCellValue(store.data, ref),
			(newRefValue) => setCellRefValue(newRefValue)
		);
		setCellRefValue(getCellValue(store.getState().data, ref));
	} else {
		setCellRefValue(value);
	}
}

function getCellValue(data, localRef) {
	try {
		function getRefValue(data, ref) {
			const value = data[ref] || '';

			if (value.startsWith('=')) {
				const externalRef = value.split('=')[1];

				if (externalRef !== localRef) {
					return getRefValue(data, externalRef);
				} else {
					throw new Error(CIRCULAR_REFERENCE_ERROR);
				}
			} else {
				return value;
			}
		}

		return getRefValue(data, localRef);
	} catch (error) {
		return error.message;
	}
}

const getElement = (id) => document.getElementById(id);
const isValidCellRef = (ref) => /^=[A-Z]?[A-D]?[1-9]?[0-9][0]?$/.test(ref);
