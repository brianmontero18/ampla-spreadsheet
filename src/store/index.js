import create from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';

const storageKey = 'spreadsheet-data';
const initialData = JSON.parse(localStorage.getItem(storageKey)) || {};

function generateColumns(length) {
	let firstCharCode = 65;

	return Array.from({ length }, (_, i) => {
		return i > 25
			? String.fromCharCode(firstCharCode, firstCharCode + i - 26)
			: String.fromCharCode(firstCharCode + i);
	});
}

function generateRows(length, columns) {
	return Array.from({ length }, (_, rowIndex) => {
		const rowId = String(rowIndex + 1);

		return {
			rowId,
			cells: Array.from({ length: columns.length }, (_, i) => {
				const columnId = columns[i];
				const ref = `${columnId}${rowId}`;

				return {
					columnId,
					ref,
					defaultValue: initialData[ref],
				};
			}),
		};
	});
}

export const store = create(
	subscribeWithSelector((set) => ({
		data: initialData,
		updateCellValue: (ref, value) =>
			set((state) => ({
				...state,
				data: { ...state.data, [ref]: value },
			})),
		updateCellSelection: (ref, value) =>
			set((state) => ({ ...state, selected: { ref, value } })),
	}))
);

export function saveLocalStorage() {
	localStorage.setItem(storageKey, JSON.stringify(store.getState().data));
}

export const updateCellValue = store.getState().updateCellValue;
export const updateCellSelection = store.getState().updateCellSelection;
export const columns = generateColumns(30);
export const rows = generateRows(100, columns);
