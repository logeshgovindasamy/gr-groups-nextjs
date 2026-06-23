import { apiError, apiSuccess } from "@/utils/helpers";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return apiError("No file provided", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate a unique filename
    const uniqueId = crypto.randomUUID();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${uniqueId}.${extension}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Construct the local public URL
    const url = `/uploads/${filename}`;

    return apiSuccess({ url });
  } catch (error) {
    console.error("[Local Upload Error]", error);
    return apiError("Failed to upload image locally", 500);
  }
}
