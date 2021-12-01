import * as React from 'react';
import { selectionStore, saveLocalStorage } from '../../store';
import './index.css';

export default function Header() {
	const [cellSelected, setCellSelected] = React.useState('');

	React.useEffect(() => {
		return selectionStore.subscribe(
			(store) => store.selected,
			(selected) => setCellSelected(selected)
		);
	}, []);

	return (
		<>
			<div className="header-container">
				<div className="cell-id-selected">{cellSelected.id}</div>
				<div className="cell-value-selected">{cellSelected.value}</div>
				<button onClick={saveLocalStorage}>
					Save into Local Storage
				</button>
			</div>
		</>
	);
}
