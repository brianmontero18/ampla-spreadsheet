import * as React from 'react';
import Tooltip from '@reach/tooltip';
import { store, updateCellValue, updateCellSelection } from '../../store';
import './index.css';

const CIRCULAR_REFERENCE_ERROR = '#REF!';
const ERROR_MESSAGE =
	'A circular dependency has been detected. Please reference the cell correctly';

export default function Cell({ cell: { cellId, columnId, defaultValue } }) {
	console.log('dale');
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

	const handleOnBlur = React.useCallback(() => {
		document.getElementById(columnId).classList.remove('header-selected');
		setView('ref');
	}, [columnId]);

	return (
		<td onFocus={handleOnFocus} onBlur={handleOnBlur}>
			{view === 'local' ? (
				<LocalValueInput
					cellId={cellId}
					defaultValue={localValue}
					unsubscribe={unsubscribe}
					handleOnBlur={handleOnBlur}
					setLocalValue={setLocalValue}
					setRefValue={setRefValue}
				/>
			) : view === 'ref' && refValue === CIRCULAR_REFERENCE_ERROR ? (
				<Tooltip label={ERROR_MESSAGE}>
					<RefValueInput
						className="error"
						setView={setView}
						value={refValue}
					/>
				</Tooltip>
			) : view === 'ref' ? (
				<RefValueInput setView={setView} value={refValue} />
			) : null}
		</td>
	);
}

function LocalValueInput({
	cellId,
	defaultValue,
	unsubscribe,
	handleOnBlur,
	setLocalValue,
	setRefValue,
}) {
	function submitValue(value) {
		setLocalValue(value);
		updateCellValue(cellId, value);
		handleOnBlur();

		if (!unsubscribe.current) {
			subscribe(value, unsubscribe, cellId, setRefValue);
		} else if (!isValidCellId(value)) {
			unsubscribe.current = undefined;
			setRefValue(value);
		}
	}

	return (
		<input
			key="putos-todos"
			id="local-value-input"
			autoFocus
			defaultValue={defaultValue}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === 'Escape') {
					submitValue(e.target.value);
				}
			}}
			onBlur={(e) => submitValue(e.target.value)}
		/>
	);
}

const RefValueInput = React.forwardRef(({ setView, value, ...rest }, ref) => {
	return (
		<input
			key="putos"
			ref={ref}
			{...rest}
			style={{ cursor: 'pointer' }}
			readOnly
			onDoubleClick={() => setView('local')}
			onKeyDown={(e) => {
				if (/^[\w=]{1}$/.test(e.key)) setView('local');
			}}
			value={value}
		/>
	);
});

function subscribe(value, unsubscribe, cellId, setRefValue) {
	if (isValidCellId(value)) {
		unsubscribe.current = store.subscribe(
			(store) => getCellValue(store.data, cellId),
			(newRefValue) => setRefValue(newRefValue)
		);
		setRefValue(getCellValue(store.getState().data, cellId));
	} else {
		setRefValue(value);
	}
}

function getCellValue(data, localId) {
	let stack = [];

	try {
		function getValueFromId(data, id) {
			const value = data[id] || '';

			if (value.startsWith('=')) {
				const newId = value.split('=')[1];

				if (stack.indexOf(newId) === -1) {
					stack.push(newId);

					return getValueFromId(data, newId);
				} else {
					throw new Error(CIRCULAR_REFERENCE_ERROR);
				}
			} else {
				return value;
			}
		}

		return getValueFromId(data, localId);
	} catch (error) {
		return error.message;
	}
}

const isValidCellId = (ref) => /^=[A-Z]?[A-D]?[1-9]?[0-9][0]?$/.test(ref);
