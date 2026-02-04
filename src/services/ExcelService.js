import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '..', 'pages', 'data', 'Datos.xlsx');

export class ExcelService {
    // Función para saber cuántas filas hay en total
    static getTotalRows() {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        return data.length + 1; // +1 por el encabezado
    }

    static getRowData(rowNumber) {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet, { raw: false });
        const targetIndex = rowNumber - 2;
        return data[targetIndex];
    }

    static async updateRowWithStatus(rowIndex, statusText, forceDuplicate = false) {
        const esDuplicado = forceDuplicate || statusText.toUpperCase().includes('DUPLICADO');
        const cleanID = statusText.toString().replace(/DUPLICADO:/i, '').trim();

        if (!cleanID || cleanID === 'NOT_FOUND' || cleanID === 'undefined') return;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        const row = worksheet.getRow(rowIndex);

        let targetCol = 1;
        while (row.getCell(targetCol).value && targetCol < 50) {
            if(row.getCell(targetCol).value === cleanID) break;
            targetCol++;
        }

        const cell = row.getCell(targetCol);
        cell.value = cleanID;
        const color = esDuplicado ? 'FFFFA500' : 'FF008000';

        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { horizontal: 'center' };
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

        await workbook.xlsx.writeFile(filePath);
        console.log(`🎨 ID [${cleanID}] guardado en fila ${rowIndex} (${esDuplicado ? 'NARANJA' : 'VERDE'})`);
    }
}
