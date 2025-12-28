const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = path.join(__dirname, '../../uploads/pdfs');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Calculates SHA-256 hash of a file
 * @param {string} filePath
 * @returns {Promise<string>}
 */
const calculateFileHash = filePath => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
};

/**
 * Generates the HTML content matching the "RentVerse" legal template
 * @param {object} data - Lease, Property, Tenant, Landlord data
 * @param {string} documentId - Unique document ID
 * @returns {string} HTML content
 */
const generateLeaseHtml = (data, documentId) => {
  const { lease, property, tenant, landlord } = data;

  // Format Data for Display
  const startDate = new Date(lease.startDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const endDate = new Date(lease.endDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const rentAmount = parseFloat(lease.rentAmount).toFixed(2);
  const securityDeposit = lease.securityDeposit
    ? parseFloat(lease.securityDeposit).toFixed(2)
    : '0.00';
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const year = new Date().getFullYear();

  // Helper for safe text
  const safe = text => text || 'N/A';

  // Helper to clean and deduplicate address components
  const cleanAddress = property => {
    // Combine all address fields into one string
    const rawParts = [
      property.address,
      property.city,
      property.state,
      property.zipCode,
      property.country === 'MY' ? 'Malaysia' : property.country,
    ]
      .filter(Boolean)
      .join(', ');

    // Split by comma and deduplicate each segment
    const segments = rawParts
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const seen = new Set();
    const unique = [];

    for (const segment of segments) {
      const normalized = segment.toLowerCase().trim();
      // Skip if we've seen this segment (case-insensitive)
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(segment);
      }
    }

    return unique.join(', ');
  };

  // Helper to get phone number (check multiple field names)
  const getPhone = user =>
    user?.phone || user?.phoneNumber || user?.mobileNumber || 'N/A';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: 'Times New Roman', serif; 
      font-size: 11pt; 
      line-height: 1.3; 
      color: #000; 
      margin: 0;
      padding: 20px 40px;
    }
    .page-break { page-break-after: always; }
    h1 { 
      text-align: center; 
      font-size: 16pt; 
      font-weight: bold; 
      text-transform: uppercase; 
      margin-bottom: 5px;
    }
    .doc-ref {
      text-align: center;
      font-size: 10pt;
      margin-bottom: 20px;
      color: #444;
    }
    h2 { 
      font-size: 12pt; 
      font-weight: bold; 
      text-transform: uppercase; 
      margin-top: 15px; 
      margin-bottom: 10px;
    }
    .section-title {
      font-weight: bold;
      text-decoration: underline;
    }
    p, li { 
      text-align: justify; 
      margin-bottom: 6px; 
    }
    .indent { margin-left: 20px; }
    .bold { font-weight: bold; }
    
    /* Tables for layout (Parties section) */
    .party-table { width: 100%; margin-bottom: 15px; border-collapse: collapse; }
    .party-table td { vertical-align: top; padding: 2px 0; }
    .label { width: 100px; font-weight: bold; }

    /* Signatures */
    .signature-section { 
      margin-top: 40px; 
      display: flex; 
      justify-content: space-between; 
    }
    .signature-box { 
      width: 45%; 
      border-top: 1px solid #000; 
      padding-top: 10px; 
    }
    .signature-img {
      max-width: 150px;
      max-height: 80px;
      display: block;
      margin-bottom: 5px;
    }
    
    /* Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 60px;
      color: rgba(0, 0, 0, 0.03);
      z-index: -1000;
      pointer-events: none;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="watermark">RA-${documentId.substr(0, 8).toUpperCase()}</div>
  
  <h1>RESIDENTIAL RENTAL AGREEMENT</h1>
  <div class="doc-ref">Agreement No: RA-${documentId.substr(0, 8).toUpperCase()}-${year}</div>

  <div class="section">
    <span class="bold">1. THE PARTIES</span>
    <p>This Rental Agreement ("Agreement") is entered into on <span class="bold">${currentDate}</span>, between the following parties:</p>
    
    <div class="indent">
      <p class="bold">1.1 THE FIRST PARTY (LESSOR/LANDLORD):</p>
      <table class="party-table">
        <tr><td class="label">Name:</td><td>${safe(landlord.name || landlord.firstName + ' ' + landlord.lastName)}</td></tr>
        <tr><td class="label">Phone:</td><td>${getPhone(landlord)}</td></tr>
        <tr><td class="label">Email:</td><td>${safe(landlord.email)}</td></tr>
      </table>
      <p>Hereinafter referred to as "THE LESSOR" or "LANDLORD"</p>

      <p class="bold">1.2 THE SECOND PARTY (LESSEE/TENANT):</p>
      <table class="party-table">
        <tr><td class="label">Name:</td><td>${safe(tenant.name || tenant.firstName + ' ' + tenant.lastName)}</td></tr>
        <tr><td class="label">Phone:</td><td>${getPhone(tenant)}</td></tr>
        <tr><td class="label">Email:</td><td>${safe(tenant.email)}</td></tr>
      </table>
      <p>Hereinafter referred to as "THE LESSEE" or "TENANT"</p>
    </div>
  </div>

  <div class="section">
    <span class="bold">2. PREMISES</span>
    <div class="indent">
      <p><span class="bold">2.1 LEASED PREMISES:</span> THE LESSOR hereby agrees to lease and rent unto THE LESSEE, and THE LESSEE hereby agrees to lease and rent from THE LESSOR, the premises described as follows: The leased premises shall be comprised of that certain personal residence located at:</p>
      <p class="bold" style="text-align:center;">${cleanAddress(property)} ("Premises").</p>
      
      <p><span class="bold">2.2 PROPERTY SPECIFICATIONS:</span> The Premises consists of a property with ${property.bedrooms === 0 ? 'Studio (0)' : property.bedrooms || 'N/A'} bedroom(s) and ${property.bathrooms || 'N/A'} bathroom(s), comprising approximately ${property.areaSqm || property.squareMeters || 'N/A'} square feet of living space. The property is ${property.furnished ? 'furnished' : 'unfurnished'}.</p>
      
      <p><span class="bold">2.3 INCLUDED FACILITIES AND AMENITIES:</span> The rental of the Premises includes access to standard facilities associated with the property.</p>
      
      <p><span class="bold">2.4 CONDITION OF PREMISES:</span> THE LESSEE acknowledges that THE LESSEE has examined the Premises and accepts them in their current condition as suitable for residential purposes.</p>
      
      <p><span class="bold">2.5 ADDITIONAL DESCRIPTION:</span> ${safe(property.description || 'Residential unit defined by title.')}</p>
      
      <p><span class="bold">2.6 RIGHT TO EXCLUSIVE POSSESSION:</span> During the term of this Agreement and so long as THE LESSEE is not in default hereunder, THE LESSEE shall have the right to exclusive possession and quiet enjoyment of the Premises.</p>
  </div>

  <div class="page-break"></div>

  <div class="section">
    <span class="bold">3. TERM</span>
    <div class="indent">
      <p><span class="bold">3.1 LEASE TERM:</span> The term of this Agreement shall be for a period starting on <span class="bold">${startDate}</span> and ending on <span class="bold">${endDate}</span>.</p>
      <p><span class="bold">3.2 RENEWAL AND EXTENSION:</span> This Agreement may be extended or renewed only by mutual written agreement of both parties executed prior to the expiration of the current term.</p>
      <p><span class="bold">3.3 HOLDOVER TENANCY:</span> If THE LESSEE remains in possession of the Premises after expiration of this lease term without THE LESSOR'S written consent, such possession shall be deemed a holdover tenancy at sufferance.</p>
    </div>
  </div>

  <div class="section">
    <span class="bold">4. MONTHLY RENT</span>
    <div class="indent">
      <p><span class="bold">4.1 RENT AMOUNT:</span> The rent to be paid by THE LESSEE to THE LESSOR throughout the term of this Agreement shall be <span class="bold">${lease.currencyCode || 'MYR'} ${rentAmount}</span> per calendar month.</p>
      <p><span class="bold">4.2 PAYMENT SCHEDULE:</span> Monthly Rent shall be due and payable in advance on the first (1st) day of each calendar month during the term of this Agreement.</p>
      <p><span class="bold">4.3 LATE FEE:</span> A late fee of fifteen percent (15%) of the monthly rent amount or as permitted by local law may be charged for any rent not received by THE LESSOR within five (5) days after the due date.</p>
      <p><span class="bold">4.4 RETURNED PAYMENTS:</span> THE LESSEE shall pay THE LESSOR a returned check/transaction fee as permitted by applicable law for each payment returned by the bank.</p>
      <p><span class="bold">4.5 SECURITY DEPOSIT:</span> Upon execution of this Agreement, THE LESSEE shall deposit with THE LESSOR the sum of <span class="bold">${lease.currencyCode || 'MYR'} ${securityDeposit}</span> as a security deposit.</p>
    </div>
  </div>

  <div class="section">
    <span class="bold">5. UTILITIES</span>
    <div class="indent">
      <p><span class="bold">5.1 UTILITY SERVICES:</span> THE LESSEE shall pay, prior to delinquency, for all utilities (including, without limitation, gas, electricity, water, sewer, trash collection, telephone, internet) used during THE LESSEE's occupancy.</p>
      <p><span class="bold">5.2 UTILITY DISCONNECTION:</span> THE LESSOR may, but shall not be obligated to, pay any delinquent utility bills to prevent disconnection.</p>
      <p><span class="bold">5.3 INCLUDED UTILITIES:</span> Unless specifically stated otherwise in writing, no utilities or services are included in the rent.</p>
    </div>
  </div>

  <div class="page-break"></div>

  <div class="section">
    <span class="bold">6. USE AND OCCUPANCY</span>
    <div class="indent">
      <p><span class="bold">6.1 RESIDENTIAL USE ONLY:</span> The Premises shall be used and occupied by THE LESSEE exclusively as a private residence.</p>
      <p><span class="bold">6.2 OCCUPANCY LIMITS:</span> The Premises shall be occupied only by THE LESSEE and immediate family members or approved guests.</p>
      <p><span class="bold">6.3 PROHIBITION OF ILLEGAL ACTIVITIES:</span> THE LESSEE shall not use the Premises for any purpose that is illegal or deemed to be a nuisance.</p>
      <p><span class="bold">6.4 ASSIGNMENT AND SUBLETTING:</span> THE LESSEE shall not assign this Agreement or sublet any portion of the Premises without THE LESSOR's prior written consent.</p>
    </div>
  </div>

  <div class="section">
    <span class="bold">7. MAINTENANCE AND REPAIRS</span>
    <div class="indent">
      <p><span class="bold">7.1 LESSOR'S OBLIGATIONS:</span> THE LESSOR agrees to keep the Premises in good repair and tenantable condition, maintaining structural components.</p>
      <p><span class="bold">7.2 LESSEE'S OBLIGATIONS:</span> THE LESSEE agrees to maintain the Premises in a clean, sanitary, and good condition and to use reasonable care in the use of the Premises.</p>
      <p><span class="bold">7.3 REPORTING ISSUES:</span> THE LESSEE shall promptly notify THE LESSOR in writing of any maintenance, repair, or safety issues.</p>
      <p><span class="bold">7.4 ACCESS FOR REPAIRS:</span> THE LESSOR and agents shall have the right to enter the Premises at reasonable times and upon reasonable notice (except emergency) for inspection and repairs.</p>
    </div>
  </div>

  <div class="section">
    <span class="bold">8. RULES AND OBLIGATIONS</span>
    <div class="indent">
      <p>8.1 THE LESSEE agrees to comply with all applicable laws, ordinances, and regulations.</p>
      <p>8.2 THE LESSEE shall adhere to standard rules: No smoking inside, No illegal activities, Maintain quiet enjoyment, Proper use of appliances.</p>
    </div>
  </div>

  <div class="page-break"></div>

  <div class="section">
    <span class="bold">9. PETS</span>
    <div class="indent">
      <p>No pets are permitted on the premises without prior written consent from THE LESSOR. If permitted, additional fees may apply.</p>
    </div>
  </div>

  <div class="section">
    <span class="bold">10. TERMINATION</span>
    <div class="indent">
      <p>Either party may terminate this Agreement by providing thirty (30) days written notice to the other party, subject to the lease term clauses.</p>
    </div>
  </div>

  <div class="section">
    <span class="bold">11. DEFAULT AND REMEDIES</span>
    <div class="indent">
      <p>Events of default include non-payment of rent, violation of terms, illegal use, or abandonment. Upon default, THE LESSOR may exercise all rights available at law.</p>
    </div>
  </div>

  <div class="section">
    <span class="bold">12. GENERAL PROVISIONS</span>
    <div class="indent">
      <p><span class="bold">12.1 ENTIRE AGREEMENT:</span> This Agreement constitutes the entire agreement between the parties.</p>
      <p><span class="bold">12.2 GOVERNING LAW:</span> This Agreement shall be governed by and construed in accordance with the laws of Malaysia.</p>
    </div>
  </div>

  <div class="section" style="margin-top: 50px;">
    <p>IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.</p>
    
    <div class="signature-section">
      <div class="signature-box">
        <p class="bold">THE FIRST PARTY (LESSOR)</p>
        <div class="digital-signature">
           <span style="color: #1a8574; font-size: 10px;">Digitally Signed via RentVerse</span>
        </div>
        <p style="margin-top:15px;">Name: <span class="bold">${safe(landlord.name || landlord.firstName + ' ' + landlord.lastName)}</span></p>
        <p>Date: ${currentDate}</p>
      </div>
      
      <div class="signature-box" id="tenant-signature-box">
        <p class="bold">THE SECOND PARTY (LESSEE)</p>
        <div class="signature-placeholder" style="min-height: 50px;">
          <!-- SIGNATURE_PLACEHOLDER -->
        </div>
        <p style="margin-top:5px;">Name: <span class="bold">${safe(tenant.name || tenant.firstName + ' ' + tenant.lastName)}</span></p>
        <p>Date: <span id="signed-date">Pending signature...</span></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generates a PDF for a lease agreement
 * @param {string} leaseId
 * @returns {Promise<object>} The created agreement object
 */
const generateLeasePdf = async leaseId => {
  // 1. Fetch Data
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
      property: true,
      tenant: true,
      landlord: true,
      agreement: true,
    },
  });

  if (!lease) throw new Error('Lease not found');

  // If agreement already exists, return it (idempotency)
  let agreementStub = lease.agreement;
  // If agreement doesn't exist at all, create it
  if (!agreementStub) {
    agreementStub = await prisma.rentalAgreement.create({
      data: {
        leaseId: lease.id,
        status: 'DRAFT',
      },
    });
  } else {
    // If it exists, check if file exists on disk
    const fileName =
      agreementStub.fileName ||
      `rental-agreement-${agreementStub.documentId}.pdf`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    // If file exists, we can safely return it
    if (fs.existsSync(filePath)) {
      return agreementStub;
    }

    console.log(`⚠️ PDF file ${fileName} missing. Re-generating...`);
  }

  const documentId = agreementStub.documentId;
  // MATCHING THE REQUESTED FORMAT: rental-agreement-{UUID}.pdf
  const fileName = `rental-agreement-${documentId}.pdf`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  // 2. Generate HTML
  const htmlContent = generateLeaseHtml(
    {
      lease,
      property: lease.property,
      tenant: lease.tenant,
      landlord: lease.landlord,
    },
    documentId
  );

  // 3. Create PDF with Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  const page = await browser.newPage();

  // Set content and emulate media type screen to capture CSS properly
  await page.setContent(htmlContent);
  await page.emulateMediaType('screen');

  await page.pdf({
    path: filePath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width: 100%; font-size: 9px; color: #888; text-align: center; padding: 5px 0;">Page <span class="pageNumber"></span> of <span class="totalPages"></span> | Agreement No: RA-${documentId.substr(0, 8).toUpperCase()}</div>`,
    margin: {
      top: '15mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm',
    },
  });
  await browser.close();

  // 4. Calculate Hash
  const originalHash = await calculateFileHash(filePath);

  // 5. Update Database
  const updatedAgreement = await prisma.rentalAgreement.update({
    where: { id: agreementStub.id },
    data: {
      originalPdfUrl: `/uploads/pdfs/${fileName}`,
      pdfUrl: `/uploads/pdfs/${fileName}`,
      originalHash: originalHash,
      fileName: fileName,
      fileSize: fs.statSync(filePath).size,
      status: 'PENDING_SIGNATURE',
    },
  });

  return updatedAgreement;
};

/**
 * Embeds a signature into the PDF and finalizes it
 * @param {string} agreementId
 * @param {string} signatureBase64 - Base64 encoded image
 * @param {string} ipAddress - Signer's IP
 * @param {string} userId - Signer's User ID
 * @returns {Promise<object>} Updated agreement
 */
const embedSignature = async (agreementId, signatureBase64, ipAddress) => {
  const agreement = await prisma.rentalAgreement.findUnique({
    where: { id: agreementId },
    include: { lease: { include: { tenant: true } } },
  });

  if (!agreement) throw new Error('Agreement not found');
  if (agreement.status === 'SIGNED') throw new Error('Already signed');

  // Verify integrity
  const currentFilePath = path.join(UPLOADS_DIR, agreement.fileName);
  if (!fs.existsSync(currentFilePath))
    throw new Error('File not found on server');

  const currentHash = await calculateFileHash(currentFilePath);
  if (currentHash !== agreement.originalHash) {
    throw new Error(
      'Tamper Check Failed: Document has been modified since generation'
    );
  }

  const lease = await prisma.lease.findUnique({
    where: { id: agreement.leaseId },
    include: {
      property: true,
      tenant: true,
      landlord: true,
    },
  });

  let htmlContent = generateLeaseHtml(
    {
      lease,
      property: lease.property,
      tenant: lease.tenant,
      landlord: lease.landlord,
    },
    agreement.documentId
  );

  // Inject signature
  const signatureImgTag = `<img src="${signatureBase64}" class="signature-img" alt="Tenant Signature" />`;
  const signedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Replace placeholders
  htmlContent = htmlContent.replace(
    '<!-- SIGNATURE_PLACEHOLDER -->',
    signatureImgTag
  );
  htmlContent = htmlContent.replace(
    'Pending signature...',
    `<strong>${signedDate}</strong>`
  );

  const signedFileName = `signed_${agreement.fileName}`;
  const signedFilePath = path.join(UPLOADS_DIR, signedFileName);

  // 3. Generate PDF
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  await page.emulateMediaType('screen');
  await page.pdf({
    path: signedFilePath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width: 100%; font-size: 9px; color: #888; text-align: center; padding: 5px 0;">Page <span class="pageNumber"></span> of <span class="totalPages"></span> | Agreement No: RA-${agreement.documentId.substr(0, 8).toUpperCase()} | SIGNED</div>`,
    margin: {
      top: '15mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm',
    },
  });
  await browser.close();

  const finalHash = await calculateFileHash(signedFilePath);

  const updated = await prisma.rentalAgreement.update({
    where: { id: agreementId },
    data: {
      pdfUrl: `/uploads/pdfs/${signedFileName}`,
      finalHash: finalHash,
      status: 'SIGNED',
      signerIp: ipAddress,
      signedAt: new Date(),
    },
  });

  return updated;
};

/**
 * Verifies a PDF file against the database
 * @param {string} tempFilePath - Path to upload temp file
 * @returns {Promise<object>} Verification result
 */
const verifyPdf = async tempFilePath => {
  const hash = await calculateFileHash(tempFilePath);

  const agreement = await prisma.rentalAgreement.findFirst({
    where: {
      OR: [{ finalHash: hash }, { originalHash: hash }],
    },
    include: { lease: { include: { tenant: true, property: true } } },
  });

  if (!agreement) {
    return {
      valid: false,
      message: 'Document hash not found in registry. Possible tampering.',
    };
  }

  if (agreement.finalHash === hash && agreement.status === 'SIGNED') {
    return {
      valid: true,
      status: 'SIGNED',
      documentId: agreement.documentId,
      tenant: agreement.lease.tenant.name,
      property: agreement.lease.property.title,
      signedAt: agreement.signedAt,
    };
  } else if (agreement.originalHash === hash) {
    return {
      valid: true,
      status: 'DRAFT/UNSIGNED',
      documentId: agreement.documentId,
      message:
        'This is a valid original draft, but it has not been signed yet.',
    };
  }

  return { valid: false, message: 'Hash collision or inconsistent state.' };
};

/**
 * Get rental agreement PDF for a booking
 * @param {string} bookingId
 * @returns {Promise<Object>}
 */
const getRentalAgreementPDF = async bookingId => {
  const agreement = await prisma.rentalAgreement.findFirst({
    where: { leaseId: bookingId },
  });

  if (!agreement) {
    throw new Error('Rental agreement not found');
  }

  // Verify local file exists if it's a relative path
  if (agreement.pdfUrl && agreement.pdfUrl.startsWith('/uploads/pdfs/')) {
    const filePath = path.join(__dirname, '../../', agreement.pdfUrl);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ PDF file missing on disk: ${filePath}`);
      throw new Error('Rental agreement file not found on server');
    }
  }

  return {
    data: {
      pdfUrl: agreement.pdfUrl,
      fileName: agreement.fileName,
      fileSize: agreement.fileSize,
      generatedAt: agreement.createdAt,
    },
  };
};

module.exports = {
  generateLeasePdf,
  embedSignature,
  verifyPdf,
  getRentalAgreementPDF,
};
