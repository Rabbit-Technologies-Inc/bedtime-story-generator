import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

// Configuration
const SHEET_ID = '1kBikF6S7UCxJNLIMSKYkYA7M_TohphfijsrkmKieyMk';
const SHEET_GID = '1178970486';
const HINDI_COLUMN = 'H';
const HINGLISH_COLUMN = 'I';
const ENGLISH_COLUMN = 'J';

// Claude API configuration
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

async function getSheetName(sheets, spreadsheetId, gid) {
  const response = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = response.data.sheets.find(s => s.properties.sheetId === parseInt(gid));
  return sheet ? sheet.properties.title : 'Sheet1';
}

async function translateWithClaude(text, targetLanguage) {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY not found in environment variables');
  }

  const prompts = {
    hinglish: `Translate the following Hindi story into Hinglish (a natural, casual mix of Hindi and English as commonly spoken in urban India). Keep the storytelling tone and make it sound natural, not like a formal translation. Only output the translated story, nothing else.

Hindi Story:
${text}`,
    english: `Translate the following Hindi story into fluent English. Preserve the storytelling tone and narrative style. Only output the translated story, nothing else.

Hindi Story:
${text}`
  };

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompts[targetLanguage]
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function main() {
  console.log('Starting translation script...\n');

  // Load service account credentials
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    console.error('Error: GOOGLE_APPLICATION_CREDENTIALS not set in .env file');
    console.error('Please set it to the path of your service account JSON key file');
    process.exit(1);
  }

  let credentials;
  try {
    credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'));
  } catch (error) {
    console.error(`Error reading credentials file: ${error.message}`);
    process.exit(1);
  }

  // Initialize Google Sheets API
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Get the sheet name from GID
  const sheetName = await getSheetName(sheets, SHEET_ID, SHEET_GID);
  console.log(`Found sheet: "${sheetName}"\n`);

  // Read Hindi stories from column H
  const range = `${sheetName}!${HINDI_COLUMN}:${ENGLISH_COLUMN}`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range
  });

  const rows = response.data.values || [];

  if (rows.length === 0) {
    console.log('No data found in the sheet.');
    return;
  }

  console.log(`Found ${rows.length} rows to process.\n`);

  // Process each row
  let translatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 1;
    const row = rows[i];
    const hindiStory = row[0]?.trim(); // Column H (index 0 in our range)
    const existingHinglish = row[1]?.trim(); // Column I (index 1)
    const existingEnglish = row[2]?.trim(); // Column J (index 2)

    // Skip if no Hindi story or if translations already exist
    if (!hindiStory) {
      console.log(`Row ${rowNumber}: No Hindi story, skipping.`);
      skippedCount++;
      continue;
    }

    if (existingHinglish && existingEnglish) {
      console.log(`Row ${rowNumber}: Translations already exist, skipping.`);
      skippedCount++;
      continue;
    }

    console.log(`Row ${rowNumber}: Translating...`);
    console.log(`  Hindi (first 50 chars): "${hindiStory.substring(0, 50)}..."`);

    try {
      // Translate to Hinglish if not already present
      let hinglishTranslation = existingHinglish;
      if (!existingHinglish) {
        console.log('  Translating to Hinglish...');
        hinglishTranslation = await translateWithClaude(hindiStory, 'hinglish');
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Translate to English if not already present
      let englishTranslation = existingEnglish;
      if (!existingEnglish) {
        console.log('  Translating to English...');
        englishTranslation = await translateWithClaude(hindiStory, 'english');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Write translations back to the sheet
      const updateRange = `${sheetName}!${HINGLISH_COLUMN}${rowNumber}:${ENGLISH_COLUMN}${rowNumber}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: updateRange,
        valueInputOption: 'RAW',
        resource: {
          values: [[hinglishTranslation, englishTranslation]]
        }
      });

      console.log(`  Done! Translations written to row ${rowNumber}.`);
      translatedCount++;

    } catch (error) {
      console.error(`  Error processing row ${rowNumber}: ${error.message}`);
      // Continue with next row instead of stopping
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Translated: ${translatedCount} rows`);
  console.log(`Skipped: ${skippedCount} rows`);
  console.log('Translation complete!');
}

main().catch(console.error);
