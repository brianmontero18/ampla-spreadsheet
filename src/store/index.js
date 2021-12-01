import create from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';

const storageKey = 'spreadsheet-data';
export const initialData = JSON.parse(localStorage.getItem(storageKey)) || {};

export const dataStore = create(
	subscribeWithSelector((set) => ({
		data: initialData,
		updateCellValue: (ref, value) =>
			set((state) => ({
				...state,
				data: { ...state.data, [ref]: value },
			})),
	}))
);

export const selectionStore = create(
	subscribeWithSelector((set) => ({
		selected: '',
		updateCellSelection: (id, value) =>
			set((state) => ({ ...state, selected: { id, value } })),
	}))
);

export function saveLocalStorage() {
	localStorage.setItem(storageKey, JSON.stringify(dataStore.getState().data));
}

export const updateCellValue = dataStore.getState().updateCellValue;
export const updateCellSelection =
	selectionStore.getState().updateCellSelection;
