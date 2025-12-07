import { utils, writeFile } from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  // Create a new workbook
  const wb = utils.book_new();

  // Convert the data to a worksheet
  const ws = utils.json_to_sheet(data);

  // Append the worksheet to the workbook
  utils.book_append_sheet(wb, ws, sheetName);

  // Generate binary string and trigger download
  writeFile(wb, `${fileName}.xlsx`);
};

export const exportMultipleSheets = (
  sheets: { data: any[]; sheetName: string }[],
  fileName: string
) => {
  const wb = utils.book_new();

  sheets.forEach((sheet) => {
    const ws = utils.json_to_sheet(sheet.data);
    utils.book_append_sheet(wb, ws, sheet.sheetName);
  });

  writeFile(wb, `${fileName}.xlsx`);
};