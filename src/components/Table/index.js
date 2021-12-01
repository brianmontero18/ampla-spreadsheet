import { Cell } from '..';
import { initialData } from '../../store';
import './index.css';

export default function Table() {
	const { columns, rows } = useFactoryTable(30, 100);

	return (
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
							<Cell key={cell.cellId} cell={cell} />
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

function useFactoryTable(columnsLength, rowsLength) {
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
					const cellId = `${columnId}${rowId}`;

					return {
						columnId,
						cellId,
						defaultValue: initialData[cellId],
					};
				}),
			};
		});
	}

	const columns = generateColumns(columnsLength);
	const rows = generateRows(rowsLength, columns);

	return { columns, rows };
}
