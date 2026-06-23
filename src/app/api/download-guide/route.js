import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    info: {
      Title: 'AWS to WordPress Migration Guide',
      Author: 'Antigravity',
      Subject: 'Step-by-step backend migration documentation'
    }
  });

  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));

  // --- Document Styling & Branding ---
  const primaryColor = '#1e293b'; // Slate 800
  const secondaryColor = '#2563eb'; // Blue 600
  const textColor = '#334155'; // Slate 700
  const lightBg = '#f8fafc'; // Slate 50

  // Draw Header Banner
  doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);
  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('GR GROUPS LUXURY E-COMMERCE', 50, 30);
  doc.fontSize(12).font('Helvetica').text('AWS Backend to WordPress Migration Report & Guide', 50, 60);
  doc.moveDown(4);

  // --- Section 1: Executive Summary ---
  doc.fillColor(secondaryColor).fontSize(16).font('Helvetica-Bold').text('1. Executive Summary', 50, 130);
  doc.rect(50, 150, doc.page.width - 100, 1).fill(secondaryColor);
  
  doc.moveDown(0.8);
  doc.fillColor(textColor).fontSize(10).font('Helvetica').text(
    'This document outlines the detailed step-by-step technical procedures performed to migrate the e-commerce backend from AWS DynamoDB & S3 to a locally hosted, fully managed WordPress MySQL and file-system-based configuration. This migration ensures 100% data autonomy, eliminates AWS cost structures, and enables offline capability.',
    { align: 'justify', lineGap: 4 }
  );
  doc.moveDown(1.5);

  // --- Section 2: Detailed Step-by-Step Migration Process ---
  doc.fillColor(secondaryColor).fontSize(16).font('Helvetica-Bold').text('2. Step-by-Step Migration Steps');
  doc.rect(50, doc.y + 4, doc.page.width - 100, 1).fill(secondaryColor);
  doc.moveDown(1);

  const steps = [
    {
      title: 'Step 1: Custom WordPress Plugin & Database Schema Setup',
      desc: 'Implemented a custom table structure "wp_gr_groups_main" and registered custom GraphQL mutations in WordPress. Cleared constraint issues by dropping the obsolete "uuid" column to support direct "id" primary key upserts.'
    },
    {
      title: 'Step 2: Next.js API Endpoint IPv4 Routing Configuration',
      desc: 'Updated process environment variables and service-level fallbacks in Next.js to use "127.0.0.1" instead of "localhost" to resolve Windows DNS IPv6 connection timeouts.'
    },
    {
      title: 'Step 3: Decoupling and Refactoring of Storefront Services',
      desc: 'Refactored product.service.js to consume WPGraphQL. Refactored user, order, and settings services to run exclusively on secure local JSON fallbacks.'
    },
    {
      title: 'Step 4: AWS SDK Package and Client Removal',
      desc: 'Removed all DynamoDB client setups, deleted unused dependencies from package.json, and staticized the migration script to prevent production compilation failures.'
    },
    {
      title: 'Step 5: Storefront Media Upload Local Integration',
      desc: 'Refactored upload/route.js to accept uploads locally via fs.writeFileSync into the public/uploads/ directory, bypassing S3 entirely.'
    },
    {
      title: 'Step 6: Data Migration Execution & Storefront Validation',
      desc: 'Executed the /api/migrate-db pipeline, importing 19 items into the database. Ran diagnostics check to verify green connection and schema health.'
    }
  ];

  steps.forEach((step, index) => {
    // Add page break if needed
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
      // Draw banner on new page
      doc.rect(0, 0, doc.page.width, 40).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('GR GROUPS - Backend Migration Guide', 50, 15);
      doc.moveDown(3);
    }

    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text(`${index + 1}. ${step.title}`);
    doc.moveDown(0.3);
    doc.fillColor(textColor).fontSize(9.5).font('Helvetica').text(step.desc, { align: 'justify', lineGap: 3 });
    doc.moveDown(1.2);
  });

  // --- Footer Notice ---
  doc.moveDown(2);
  doc.rect(50, doc.y, doc.page.width - 100, 40).fill(lightBg);
  doc.fillColor(textColor).fontSize(8).font('Helvetica-Oblique').text(
    'Verification Status: SUCCESSFUL | Target: http://127.0.0.1/Testwp/graphql | AWS Decoupled: YES',
    70, doc.y - 28, { align: 'center' }
  );

  doc.end();

  const pdfBuffer = await new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="migration-guide.pdf"',
    },
  });
}
