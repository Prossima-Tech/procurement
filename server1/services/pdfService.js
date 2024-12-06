const PDFDocument = require('pdfkit');

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const generatePoPdf = (purchaseOrder) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 40,
          right: 40
        },
        bufferPages: true
      });

      // Collect PDF buffers
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Set initial coordinates
      const pageWidth = 515;
      const startX = 40;
      let startY = 50;

      // Header Section with Logo
      doc.image('logoprossima.png', startX, startY, { width: 80, height: 80 });

      // Company header text with adjusted spacing
      const headerTextX = startX + 100;
      const headerTextWidth = pageWidth - 100;

      doc.font('Helvetica-Bold')
        .fontSize(16)
        .text('KING SECURITY GUARDS SERVICES (P) LTD.',
          headerTextX,
          startY,
          {
            width: headerTextWidth,
            align: 'center',
            lineBreak: true
          });

      doc.fontSize(10)
        .text('17/8 VIDHYAM KHAND GOMTI NAGAR NEAR LIC KNOW-226010 U.P, UTTAR PRADESH - 226010',
          headerTextX,
          startY + 45,
          {
            width: headerTextWidth,
            align: 'center',
            lineBreak: true
          });

      doc.moveDown(0.5);
      doc.text('Telephone: 0522-4044135 | Email: corporate@kinggroupworld.com',
        headerTextX,
        null,
        {
          width: headerTextWidth,
          align: 'center',
          lineBreak: true
        });

      // Title section with adjusted spacing
      startY += 110;
      doc.moveTo(startX, startY).lineTo(startX + pageWidth, startY).stroke();
      doc.fontSize(14)
        .text('PURCHASE ORDER',
          startX,
          startY + 10,
          {
            width: pageWidth,
            align: 'center',
            lineBreak: true
          });
      doc.moveTo(startX, startY + 30).lineTo(startX + pageWidth, startY + 30).stroke();

      // Main content section with proper spacing
      startY += 50;
      const contentWidth = pageWidth / 2 - 10;

      // Left section (Address Details)
      const leftSection = startX;
      const rightSection = startX + contentWidth + 20;

      // Invoice To Box with text wrapping
      doc.rect(leftSection, startY, contentWidth, 80).stroke();
      doc.fontSize(11)
        .text('Invoice To:',
          leftSection + 10,
          startY + 10,
          {
            width: contentWidth - 20,
            lineBreak: true
          });

      // Format address with proper wrapping
      const invoiceAddress = [
        purchaseOrder.invoiceTo?.name || 'N/A',
        purchaseOrder.invoiceTo?.address || '',
        `${purchaseOrder.invoiceTo?.city || ''}, ${purchaseOrder.invoiceTo?.state || ''} - ${purchaseOrder.invoiceTo?.pin || ''}`
      ].filter(Boolean).join('\n');

      doc.fontSize(9)
        .text(invoiceAddress,
          leftSection + 10,
          startY + 25,
          {
            width: contentWidth - 20,
            lineBreak: true,
            lineGap: 5
          });

      // Dispatch To Box with text wrapping
      startY += 90;
      doc.rect(leftSection, startY, contentWidth, 80).stroke();
      doc.fontSize(11)
        .text('Dispatch To:',
          leftSection + 10,
          startY + 10,
          {
            width: contentWidth - 20,
            lineBreak: true
          });

      // Format dispatch address with proper wrapping
      const dispatchAddress = [
        purchaseOrder.dispatchTo?.name || 'N/A',
        purchaseOrder.dispatchTo?.address || '',
        `${purchaseOrder.dispatchTo?.city || ''}, ${purchaseOrder.dispatchTo?.state || ''} - ${purchaseOrder.dispatchTo?.pin || ''}`
      ].filter(Boolean).join('\n');

      doc.fontSize(9)
        .text(dispatchAddress,
          leftSection + 10,
          startY + 25,
          {
            width: contentWidth - 20,
            lineBreak: true,
            lineGap: 5
          });

      // Right section (Order Details) with adjusted spacing
      const rightContentStart = startY - 90;
      doc.rect(rightSection, rightContentStart, contentWidth, 170).stroke();

      const detailsData = [
        ['Order No:', purchaseOrder.poCode || 'N/A'],
        ['Order Date:', formatDate(purchaseOrder.poDate)],
        ['GST No:', purchaseOrder.vendorGst || 'N/A'],
        ['Supplier Ref:', purchaseOrder.supplierRef || 'N/A'],
        ['Dispatch Through:', purchaseOrder.dispatchThrough || 'N/A'],
        ['Project ID:', purchaseOrder.projectId.projectCode || 'N/A'],
        ['Unit Name:', purchaseOrder.unitName || 'N/A'],
        ['Terms of Payment:', purchaseOrder.paymentTerms || 'N/A'],
        ['Terms of Delivery:', purchaseOrder.deliveryTerms || 'N/A'],
        ['Date of Delivery:', formatDate(purchaseOrder.deliveryDate)]
      ];

      // Render details with proper wrapping
      detailsData.forEach((detail, index) => {
        const yPos = rightContentStart + 10 + (index * 15);
        doc.fontSize(9)
          .text(detail[0],
            rightSection + 10,
            yPos,
            { continued: true });

        doc.text(detail[1],
          {
            left: rightSection + 100,
            width: contentWidth - 110,
            lineBreak: true
          });
      });

      // Items Table with adjusted column widths
      startY = rightContentStart + 190;
      const tableTop = startY;

      // Adjusted column widths to prevent overflow
      const colWidths = {
        desc: pageWidth * 0.25,    // Increased width for description
        partNo: pageWidth * 0.1,
        size: pageWidth * 0.07,
        color: pageWidth * 0.07,
        unit: pageWidth * 0.06,
        qty: pageWidth * 0.06,
        rate: pageWidth * 0.08,
        amount: pageWidth * 0.08,
        cgst: pageWidth * 0.08,
        sgst: pageWidth * 0.08,
        total: pageWidth * 0.07
      };

      // Draw table headers with proper spacing
      let currentX = startX;
      const headerHeight = 20;

      Object.entries(colWidths).forEach(([key, width]) => {
        doc.rect(currentX, tableTop, width, headerHeight).stroke();
        doc.fontSize(8)
          .text(key.toUpperCase(),
            currentX + 2,
            tableTop + 6,
            {
              width: width - 4,
              align: 'center',
              lineBreak: true
            });
        currentX += width;
      });

      // Draw items with proper text wrapping
      let currentY = tableTop + headerHeight;
      const rowHeight = 30;  // Increased height for better content fitting

      if (purchaseOrder.items?.length > 0) {
        purchaseOrder.items.forEach((item) => {
          currentX = startX;
          const subtotal = item.quantity * item.unitPrice;
          const cgstAmount = (subtotal * (item.partCode?.ItemCode?.CGST_Rate || 0)) / 100;
          const sgstAmount = (subtotal * (item.partCode?.ItemCode?.SGST_Rate || 0)) / 100;

          Object.entries(colWidths).forEach(([key, width]) => {
            doc.rect(currentX, currentY, width, rowHeight).stroke();

            let value = '';
            let align = 'left';

            switch (key) {
              case 'desc':
                value = item.partCode?.ItemCode?.ItemName || 'N/A';
                break;
              case 'partNo':
                value = item.partCode?.PartCodeNumber || 'N/A';
                break;
              case 'size':
                value = item.partCode?.SizeName || '-';
                break;
              case 'color':
                value = item.partCode?.ColourName || '-';
                break;
              case 'unit':
                value = item.partCode?.MeasurementUnit || '-';
                break;
              case 'qty':
                value = item.quantity.toString();
                align = 'right';
                break;
              case 'rate':
                value = item.unitPrice.toFixed(2);
                align = 'right';
                break;
              case 'amount':
                value = subtotal.toFixed(2);
                align = 'right';
                break;
              case 'cgst':
                value = `${item.partCode?.ItemCode?.CGST_Rate || 0}%\n${cgstAmount.toFixed(2)}`;
                align = 'right';
                break;
              case 'sgst':
                value = `${item.partCode?.ItemCode?.SGST_Rate || 0}%\n${sgstAmount.toFixed(2)}`;
                align = 'right';
                break;
              case 'total':
                value = (subtotal + cgstAmount + sgstAmount).toFixed(2);
                align = 'right';
                break;
            }

            doc.fontSize(8)
              .text(value,
                currentX + 2,
                currentY + 6,
                {
                  width: width - 4,
                  align,
                  lineBreak: true
                });

            currentX += width;
          });

          currentY += rowHeight;
        });
      }

      // Totals section with proper spacing
      const totals = purchaseOrder.items?.reduce((acc, item) => {
        const subtotal = item.quantity * item.unitPrice;
        const cgst = (subtotal * (item.partCode?.ItemCode?.CGST_Rate || 0)) / 100;
        const sgst = (subtotal * (item.partCode?.ItemCode?.SGST_Rate || 0)) / 100;

        return {
          subtotal: acc.subtotal + subtotal,
          cgst: acc.cgst + cgst,
          sgst: acc.sgst + sgst,
          total: acc.total + subtotal + cgst + sgst
        };
      }, { subtotal: 0, cgst: 0, sgst: 0, total: 0 });

      // Add totals with proper alignment
      currentY += 20;
      const totalsX = pageWidth - 150;
      doc.fontSize(10);

      ['Sub Total', 'CGST', 'SGST', 'Total'].forEach((label, index) => {
        const amount = Object.values(totals)[index].toFixed(2);
        doc.text(`${label}: ${amount}`,
          totalsX,
          currentY + (index * 15),
          {
            width: 150,
            align: 'left',
            lineBreak: true
          });
      });

      // Signature section with proper spacing
      const signatureY = doc.page.height - 150;
      doc.fontSize(10)
        .text('For KING SECURITY GUARDS SERVICES (P) LTD.',
          pageWidth - 150,
          signatureY,
          {
            width: 150,
            align: 'center',
            lineBreak: true
          })
        .moveDown(2)
        .text('Authorized Signatory',
          pageWidth - 150,
          signatureY + 50,
          {
            width: 150,
            align: 'center',
            lineBreak: true
          });

      // Footer with proper spacing and wrapping
      const footerText = [
        'AN ISO 9001:2008,ISO14001:2015 AND OHSAS18001:2007 CERTIFIED',
        'Regd Office:king House,270 Vohwas Khand Gomti Nagar,Lucknow-226010(U.P)',
        'Phone: 0522-4044135 Fax: 0522-4068036',
        'E-mail:corporate@kinggroupworld.com Web:www.kinggroupworld'
      ].join('\n');

      doc.fontSize(8)
        .text(footerText,
          startX,
          doc.page.height - 50,
          {
            width: pageWidth,
            align: 'center',
            lineBreak: true,
            lineGap: 2
          });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateInvoicePdf = (invoice) => {
  // console.log("invoice in pdf service",invoice);
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 40,
          right: 40
        },
        bufferPages: true
      });

      // Collect PDF buffers
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Set initial coordinates
      const pageWidth = 515;
      const startX = 40;
      let startY = 50;

      // Vendor Header
      doc.font('Helvetica-Bold')
        .fontSize(16)
        .text(invoice.vendorId.name,
          startX,
          startY,
          {
            width: pageWidth,
            align: 'center'
          });

      // Vendor Address
      doc.fontSize(10)
        .text(`${invoice.vendorId.address.line1}, ${invoice.vendorId.address.line2}`,
          startX,
          startY + 25,
          {
            width: pageWidth,
            align: 'center'
          });
      doc.text(`${invoice.vendorId.address.city}, ${invoice.vendorId.address.state} - ${invoice.vendorId.address.pinCode}`,
        {
          width: pageWidth,
          align: 'center'
        });

      // Three Column Section
      startY += 80;
      const columnWidth = pageWidth / 3;

      // Bill To Details
      doc.font('Helvetica-Bold').text('Bill To:', startX, startY);
      doc.font('Helvetica')
        .fontSize(9)
        .text([
          invoice.poId.invoiceTo.name,
          invoice.poId.invoiceTo.address,
          `${invoice.poId.invoiceTo.city}, ${invoice.poId.invoiceTo.state}`,
          invoice.poId.invoiceTo.pin
        ].join('\n'), startX, startY + 20);

      // Dispatch To Details
      doc.font('Helvetica-Bold')
        .text('Dispatch To:', startX + columnWidth, startY);
      doc.font('Helvetica')
        .text([
          invoice.poId.dispatchTo.name,
          invoice.poId.dispatchTo.address,
          `${invoice.poId.dispatchTo.city}, ${invoice.poId.dispatchTo.state}`,
          invoice.poId.dispatchTo.pin
        ].join('\n'), startX + columnWidth, startY + 20);

      // Invoice Details
      doc.font('Helvetica-Bold')
        .text('Invoice Details:', startX + (columnWidth * 2), startY);
      const invoiceDetails = [
        ['Invoice No:', invoice.invoiceNumber],
        ['Date:', new Date().toLocaleDateString()],
        ['Place of Supply:', invoice.poId.destination || 'N/A'],
        ['PO Date:', new Date(invoice.poId.poDate).toLocaleDateString()],
        ['PO Number:', invoice.poId.poCode]
      ];
      
      let detailY = startY + 20;
      invoiceDetails.forEach(([label, value]) => {
        doc.font('Helvetica-Bold')
          .text(label, startX + (columnWidth * 2), detailY, { continued: true })
          .font('Helvetica')
          .text(` ${value}`);
        detailY += 15;
      });

      // Items Table
      startY += 120;
      const tableTop = startY;
      const tableHeaders = ['Part Code', 'Item Name', 'HSN/SAC', 'Qty', 'Unit Price', 'Base Amount', 'Tax Amount', 'Total'];
      const colWidths = [80, 100, 60, 40, 60, 60, 60, 55];

      // Draw Headers
      let currentX = startX;
      tableHeaders.forEach((header, i) => {
        doc.rect(currentX, tableTop, colWidths[i], 20).stroke();
        doc.font('Helvetica-Bold')
          .fontSize(8)
          .text(header, currentX + 2, tableTop + 6, { width: colWidths[i] - 4 });
        currentX += colWidths[i];
      });

      // Draw Items
      let currentY = tableTop + 20;
      invoice.items.forEach(item => {
        const taxAmount = item.cgstAmount + item.sgstAmount;
        currentX = startX;
        const rowHeight = 25;

        const itemData = [
          item.itemDetails.partCode,
          item.itemDetails.itemName,
          item.itemDetails.sacHsnCode,
          item.acceptedQuantity.toString(),
          `₹${item.unitPrice.toFixed(2)}`,
          `₹${item.baseAmount.toFixed(2)}`,
          `₹${taxAmount.toFixed(2)}`,
          `₹${item.totalAmount.toFixed(2)}`
        ];

        itemData.forEach((text, i) => {
          doc.rect(currentX, currentY, colWidths[i], rowHeight).stroke();
          doc.font('Helvetica')
            .fontSize(8)
            .text(text, currentX + 2, currentY + 6, { width: colWidths[i] - 4 });
          currentX += colWidths[i];
        });

        currentY += rowHeight;
      });

      // Tax Details and Total
      startY = currentY + 20;
      doc.font('Helvetica-Bold')
        .fontSize(10)
        .text('Tax Details:', startX, startY);

      startY += 20;
      const taxTable = [
        ['Tax Type', 'Rate', 'Taxable Amount', 'Tax Amount'],
        ['CGST', `${invoice.cgstRate}%`, `₹${invoice.subTotal.toFixed(2)}`, `₹${invoice.cgstAmount.toFixed(2)}`],
        ['SGST', `${invoice.sgstRate}%`, `₹${invoice.subTotal.toFixed(2)}`, `₹${invoice.sgstAmount.toFixed(2)}`]
      ];

      taxTable.forEach((row, i) => {
        currentX = startX;
        row.forEach((cell, j) => {
          doc.rect(currentX, startY, 100, 20).stroke();
          doc.text(cell, currentX + 5, startY + 6);
          currentX += 100;
        });
        startY += 20;
      });

      // Final Amounts
      startY += 20;
      const finalAmounts = [
        ['Sub Total:', `₹${invoice.subTotal.toFixed(2)}`],
        ['Total Tax:', `₹${(invoice.cgstAmount + invoice.sgstAmount).toFixed(2)}`],
        ['Round Off:', `₹${(Math.round(invoice.totalAmount) - invoice.totalAmount).toFixed(2)}`],
        ['Final Amount:', `₹${Math.round(invoice.totalAmount).toFixed(2)}`]
      ];

      finalAmounts.forEach(([label, amount]) => {
        doc.font('Helvetica-Bold')
          .text(label, pageWidth - 200, startY, { continued: true })
          .font('Helvetica')
          .text(amount, { align: 'right' });
        startY += 15;
      });

      // Bank Details
      startY += 20;
      doc.font('Helvetica-Bold')
        .text('Bank Details:', startX, startY);
      startY += 15;
      
      const bankDetails = [
        ['Bank Name:', invoice.vendorId.bankDetails.name],
        ['Branch:', invoice.vendorId.bankDetails.branchName],
        ['Account No:', invoice.vendorId.bankDetails.accountNumber],
        ['IFSC Code:', invoice.vendorId.bankDetails.ifscCode]
      ];

      bankDetails.forEach(([label, value]) => {
        doc.font('Helvetica-Bold')
          .text(label, startX, startY, { continued: true })
          .font('Helvetica')
          .text(` ${value}`);
        startY += 15;
      });

      // Signature
      doc.font('Helvetica-Bold')
        .text('Authorized Signatory',
          pageWidth - 100,
          doc.page.height - 100,
          {
            width: 100,
            align: 'center'
          });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePoPdf, generateInvoicePdf };