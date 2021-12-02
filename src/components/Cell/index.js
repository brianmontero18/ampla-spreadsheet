import * as React from 'react';
import Tooltip from '@reach/tooltip';
import { dataStore, updateCellValue, updateCellSelection } from '../../store';
import './index.css';

const CIRCULAR_REFERENCE_ERROR = '#REF!';
const ERROR_MESSAGE =
	'A circular dependency has been detected. Please reference the cell correctly';

export default function Cell({ cell: { cellId, columnId, defaultValue } }) {
	const [localValue, setLocalValue] = React.useState(defaultValue || '');
	const [refValue, setRefValue] = React.useState('');
	const [view, setView] = React.useState('ref');
	const unsubscribe = React.useRef();

	React.useEffect(() => {
		return subscribe(defaultValue, unsubscribe, cellId, setRefValue);
	}, [defaultValue, cellId]);

	const handleOnFocus = () => {
		document.getElementById(columnId).className = 'header-selected';
		updateCellSelection(cellId, localValue);
	};

	const handleOnBlur = () => {
		document.getElementById(columnId).classList.remove('header-selected');
		setView('ref');
	};

	const submitValue = (e) => {
		const value = e.target.value;
		e.stopPropagation();
		setLocalValue(value);
		updateCellValue(cellId, value);
		handleOnBlur();

		if (!unsubscribe.current) {
			subscribe(value, unsubscribe, cellId, setRefValue);
		} else if (!isValidCellId(value)) {
			unsubscribe.current = undefined;
			setRefValue(value);
		}
	};

	const renderRefValueInput = (className) => (
		<input
			key="ref-value-input"
			className={className}
			style={{ cursor: 'pointer' }}
			readOnly
			onDoubleClick={() => setView('local')}
			onKeyDown={(e) => {
				if (/^[\w=]{1}$/.test(e.key)) setView('local');
			}}
			value={refValue}
		/>
	);

	return (
		<td onFocus={handleOnFocus} onBlur={handleOnBlur}>
			{view === 'local' ? (
				<input
					id="local-value-input"
					key="local-value-input"
					autoFocus
					defaultValue={localValue}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === 'Escape') {
							submitValue(e);
						}
					}}
					onFocus={(e) => e.stopPropagation()}
					onBlur={(e) => submitValue(e)}
				/>
			) : view === 'ref' && refValue === CIRCULAR_REFERENCE_ERROR ? (
				<Tooltip label={ERROR_MESSAGE}>
					{renderRefValueInput('error')}
				</Tooltip>
			) : view === 'ref' ? (
				renderRefValueInput()
			) : null}
		</td>
	);
}

function subscribe(value, unsubscribe, cellId, setRefValue) {
	let refValue = value || '';

	if (value && isValidCellId(value)) {
		const cellInfo = getCellInfo(dataStore.getState().data, cellId);

		unsubscribe.current = dataStore.subscribe(
			getCellInfoMemoized(cellInfo, cellId),
			(newRefValue) => setRefValue(newRefValue)
		);

		refValue = cellInfo.value;
	}

	setRefValue(refValue);
}

function getCellInfoMemoized(cellInfo, cellId) {
	let valueCached = cellInfo.value;
	let cellIdCached = cellInfo.lastCellId;

	return (store) => {
		if (store.data[cellIdCached] !== valueCached) {
			const cellInfo = getCellInfo(store.data, cellId);

			valueCached = cellInfo.value;
			cellIdCached = cellInfo.lastCellId;
		}

		return valueCached;
	};
}

function getCellInfo(data, localId) {
	let stack = [];

	function getValueFromId(data, id) {
		const value = data[id] || '';

		if (value.startsWith('=')) {
			const newId = value.split('=')[1];

			if (stack.indexOf(newId) === -1) {
				stack.push(newId);

				return getValueFromId(data, newId);
			} else {
				return {
					lastCellId: newId,
					value: CIRCULAR_REFERENCE_ERROR,
				};
			}
		} else {
			return { lastCellId: id, value };
		}
	}

	return getValueFromId(data, localId);
}

const isValidCellId = (ref) => /^=[A-Z]?[A-D]?[1-9]?[0-9][0]?$/.test(ref);
