import * as React from 'react';
import { store, saveLocalStorage } from '../../store';

export default function Header() {
	const [cellSelected, setCellSelected] = React.useState('');

	React.useEffect(() => {
		return store.subscribe(
			(store) => store.selected,
			(selected) => setCellSelected(selected)
		);
	}, []);

	return (
		<>
			<div className="header-container">
				<div className="cell-ref-selected">{cellSelected.ref}</div>
				<div className="cell-value-selected">{cellSelected.value}</div>
				<button onClick={saveLocalStorage}>
					Save into Local Storage
				</button>
			</div>
		</>
	);
}
