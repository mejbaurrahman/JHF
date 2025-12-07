
export const exportToExcel = async (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  try {
    const XLSX = await import('xlsx');
    const { utils, writeFile } = XLSX;
    
    if (!utils || !writeFile) {
      console.error("XLSX library loaded but missing required exports");
      alert("Export functionality unavailable. Please try again later.");
      return;
    }

    // Create a new workbook
    const wb = utils.book_new();

    // Convert the data to a worksheet
    const ws = utils.json_to_sheet(data);

    // Append the worksheet to the workbook
    utils.book_append_sheet(wb, ws, sheetName);

    // Generate binary string and trigger download
    writeFile(wb, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Failed to load Excel library", error);
    alert("Failed to load export module. Check your internet connection.");
  }
};

export const exportMultipleSheets = async (
  sheets: { data: any[]; sheetName: string }[],
  fileName: string
) => {
  try {
    const XLSX = await import('xlsx');
    const { utils, writeFile } = XLSX;

    if (!utils || !writeFile) {
       console.error("XLSX library loaded but missing required exports");
       return;
    }

    const wb = utils.book_new();

    sheets.forEach((sheet) => {
      const ws = utils.json_to_sheet(sheet.data);
      utils.book_append_sheet(wb, ws, sheet.sheetName);
    });

    writeFile(wb, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Failed to load Excel library", error);
    alert("Failed to load export module.");
  }
};
