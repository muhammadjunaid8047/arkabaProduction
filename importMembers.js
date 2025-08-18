import mongoose from 'mongoose';
import 'dotenv/config.js';
import XLSX from 'xlsx';
import bcrypt from 'bcrypt';
import { connect } from './src/lib/mongodb/mongoose.js';
import { Member } from './src/lib/models/member.model.js';

// 1. Connect to DB
await connect();

// 2. Read Excel
const workbook = XLSX.readFile('./ArkABACurrentMembers.xlsx');
const sheet = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheet];

// Parse as array of arrays with blank cells as empty strings
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Headers are in data[1] (row2)
const headers = data[1].map(h => (h ? h.trim() : ''));

// Rows start from data[2] (row3)
const rows = data.slice(2).map(row => {
  const obj = {};
  headers.forEach((header, i) => {
    if (header) obj[header] = (row[i] || '').toString().trim();
  });
  return obj;
});

// Log debugging info
console.log('Detected Excel columns:', headers);
console.log('Total raw rows:', data.length - 2);
console.log('Processed rows:', rows.length);
console.log('Non-empty rows:', rows.filter(row => Object.keys(row).length > 0).length);

// 3. Map rows safely
const members = rows
  .filter(row => Object.keys(row).length > 0) // Skip empty objects
  .map((row, index) => {
    const firstName = row['First Name'] || '';
    let lastName = row['Last Name']  || '';
    const email = (row['Email'] || '').toLowerCase();

    // Fallback to Account Name for fullName if firstName is missing
    let fullName = firstName ? `${firstName} ${lastName}`.trim() : row['Account Name'] || '';

    // Skip rows missing email or fullName
    if (!fullName || !email) {
      console.warn(`Skipping row ${index + 3} - Missing data:`, {
        fullName: !!fullName,
        email: !!email,
        rawRow: row
      });
      return null;
    }

    // Determine role and memberType based on Excel columns
    let role = 'studentbt'; // Default role
    let memberType = 'member'; // Default memberType
    if (row['Full']) {
      role = 'full';
      memberType = 'supervisor';
    } else if (row['Student/BT']) {
      role = 'studentbt';
      memberType = 'member';
    } else if (row['Affiliate']) {
      role = 'affiliate';
      memberType = 'business';
    }

    return {
      fullName: fullName,
      // lastName: lastName || undefined, // Schema allows lastName to be optional
      email,
      phone: row['Phone'] || '',
      bcba: row['BCBA/BCaBA #'] || row['BCBA/BCaBA#'] || '',
      affiliation: row['Affiliation'] || '',
      password: bcrypt.hashSync('TempPass123!', 10),
      role,
      billingName: row['Account Name'] || '',
      billingAddress: row['Address (Full)'] || '',
      shareInfoInternally: row['Address (Autocorrect)']?.toLowerCase() === 'y',
      memberType,
      businessName: row['Affiliation'] || '',
      businessWebsite: '',
      stripeCustomerId: '',
      stripeSubscriptionId: '',
      subscriptionStatus: 'active',
      membershipStatus: 'active',
      membershipExpiry: row['Renewal Date'] ? new Date(row['Renewal Date']) : null,
      paymentHistory: [],
      createdAt: new Date(),
      isEmailVerified: false,
    };
  })
  .filter(Boolean);

// Log valid members
console.log('Valid members to insert:', members.length);
if (members.length > 0) {
  console.log('Sample member:', members[0]);
}

// 4. Check for duplicates
if (members.length > 0) {
  const emails = members.map(m => m.email);
  const existingMembers = await Member.find({ email: { $in: emails } }).select('email');
  const existingEmails = new Set(existingMembers.map(m => m.email));
  console.log('Existing emails in DB:', existingEmails.size);
  if (existingEmails.size > 0) {
    console.log('Sample duplicate emails:', Array.from(existingEmails).slice(0, 5));
  }

  // 5. Insert or update members
  const results = { inserted: 0, updated: 0, skipped: 0 };
  for (const member of members) {
    try {
      if (existingEmails.has(member.email)) {
        // Update existing member
        const updated = await Member.findOneAndUpdate(
          { email: member.email },
          { $set: { ...member, updatedAt: new Date() } },
          { new: true }
        );
        if (updated) {
          results.updated++;
        } else {
          results.skipped++;
        }
      } else {
        // Insert new member
        await Member.create(member);
        results.inserted++;
      }
    } catch (err) {
      console.warn(`Error processing member ${member.email}:`, err.message);
      results.skipped++;
    }
  }
  console.log('Import results:', results);
} else {
  console.log('No valid members to insert or update');
}

// 6. Close connection
await mongoose.connection.close();