import { saveOrder } from '@/services/order.service';
import { apiError, apiSuccess, generateOrderId, generateUserId } from '@/utils/helpers';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return apiError('No file uploaded', 400);
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse with XLSX
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    if (!rawData || rawData.length === 0) {
      return apiError('The spreadsheet is empty or could not be parsed.', 400);
    }

    const telemetry = {
      totalRows: rawData.length,
      savedRows: 0,
      errors: 0,
      totalRevenue: 0,
      errorLogs: []
    };

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      // Expected schema based on our export: OrderID, ProductName, TotalPrice
      const orderId = row['Order ID'] || row['OrderID'] || row['id'] || generateOrderId();
      const productName = row['Product Name'] || row['ProductName'] || row['name'] || '';
      const totalPrice = Number(row['Total Price'] || row['TotalPrice'] || row['totalPrice'] || 0);
      
      if (!productName) {
        telemetry.errors++;
        telemetry.errorLogs.push(`Row ${i + 2}: Missing product name.`);
        continue;
      }

      if (isNaN(totalPrice) || totalPrice < 0) {
        telemetry.errors++;
        telemetry.errorLogs.push(`Row ${i + 2}: Total price must be a valid positive number.`);
        continue;
      }

      // Reconstruct order item for storage
      const orderItem = {
        name: productName,
        price: totalPrice,
        qty: 1, // Defaulting to 1 since we combined price/qty into Total Value in the export
      };

      const userId = generateUserId(); // Assign a mock/generated user ID for imported orders

      const orderData = {
        id: orderId,
        userId: userId,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        totalPrice: totalPrice,
        orderItems: [orderItem],
        status: 'Delivered', // Imported orders are considered fulfilled
        paymentMethod: 'Imported',
      };

      try {
        await saveOrder(orderData);
        telemetry.savedRows++;
        telemetry.totalRevenue += totalPrice;
      } catch (err) {
        telemetry.errors++;
        telemetry.errorLogs.push(`Failed to save row ${i + 2}: ${err.message}`);
      }
    }

    return apiSuccess({
      message: 'Import processed successfully',
      telemetry
    });

  } catch (error) {
    console.error('[Orders Import Error]', error);
    return apiError('Import failed: ' + error.message, 500);
  }
}
