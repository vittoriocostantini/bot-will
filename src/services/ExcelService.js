import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '..', 'pages', 'data', 'Datos.xlsx');

export class ExcelService {
    static getTotalRows() {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        return data.length + 1;
    }

    static getRowData(rowNumber) {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet, { raw: false });
        const targetIndex = rowNumber - 2;
        return data[targetIndex];
    }

    static async updateRowWithStatus(rowIndex, statusText, forceDuplicate = false) {
        // 1. Detección de estado y limpieza de ID
        const esDuplicado = forceDuplicate || statusText.toUpperCase().includes('DUPLICADO');
        const cleanID = statusText.toString().replace(/DUPLICADO:/i, '').trim();

        if (!cleanID || cleanID === 'NOT_FOUND' || cleanID === 'undefined') return;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);

        // 2. BUSCAR LA COLUMNA CORRECTA (Dinámicamente por encabezado)
        const headerRow = worksheet.getRow(1);
        let targetCol = -1;

        headerRow.eachCell((cell, colNumber) => {
            const headerValue = cell.value ? cell.value.toString().trim() : "";
            // Cambia "Application ID" por el nombre exacto de tu columna en el Excel
            if (headerValue === "Application ID" || headerValue === "ID") {
                targetCol = colNumber;
            }
        });

        // Si no encuentra la columna por nombre, usamos la primera vacía al final (como respaldo)
        if (targetCol === -1) {
            targetCol = headerRow.actualCellCount + 1;
        }

        // 3. OBTENER LA CELDA ESPECÍFICA
        const row = worksheet.getRow(rowIndex);
        const cell = row.getCell(targetCol);

        // 4. APLICAR VALOR Y ESTILO (SOLO A ESTA CELDA)
        cell.value = cleanID;

        const color = esDuplicado ? 'FFFFA500' : 'FF008000';

        // IMPORTANTE: Definimos el fill asegurándonos de que sea solo para esta cell
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
        };

        cell.font = {
            color: { argb: 'FFFFFFFF' },
            bold: true
        };

        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        cell.border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
        };

        // 5. GUARDAR
        await workbook.xlsx.writeFile(filePath);
        console.log(`🎨 ID [${cleanID}] guardado en Celda ${targetCol}${rowIndex} (${esDuplicado ? 'NARANJA' : 'VERDE'})`);
    }
}
