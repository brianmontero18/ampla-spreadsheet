import { columns, rows } from './store';
import { Header, Cell } from './components';
import './App.css';

export default function App() {
	return (
		<>
			<Header />
			<table>
				<thead>
					<tr>
						<th></th>
						{columns.map((column) => (
							<th id={column} key={column}>
								{column}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map(({ rowId, cells }) => (
						<tr key={`row_${rowId}`}>
							<td key={rowId}>{rowId}</td>
							{cells.map((cell) => (
								<Cell key={cell.ref} cell={cell} />
							))}
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
}
