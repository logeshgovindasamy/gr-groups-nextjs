const XLSX = require('xlsx');

const csvData = 'OrderID,ProductName,TotalPrice\n"ORD-123","Rolex",1200\n';

try {
  const workbook = XLSX.read(csvData, { type: 'string' });
  console.log("Success! Sheets:", workbook.SheetNames);
  XLSX.writeFile(workbook, 'test.xlsx');
  console.log("File written successfully!");
} catch (e) {
  console.error("Error reading:", e.message);
}
