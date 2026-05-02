require('dotenv').config();

async function appendToSheet(data, type = 'placement') {
  try {
    const webAppUrl = type === 'card' ? process.env.SHEET_CARDS_WEB_APP_URL : process.env.SHEET_WEB_APP_URL;
    
    if (!webAppUrl) {
      console.warn(`SHEET_WEB_APP_URL for type ${type} not set in .env. Skipping Google Sheets append.`);
      return;
    }

    // Construct the payload in the EXACT order of your Google Sheet columns
    const now = new Date();
    // Use Intl.DateTimeFormat for reliable IST string
    const dateStr = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    }).format(now).replace(',', '');
    
    let payload = {};

    if (type === 'placement') {
      payload = {
        "DATE": dateStr,
        "COMPANY NAME": data.company_name || "",
        "ROLE": data.job_role || "",
        "LOCATION AND ADDRESS": data.location || "",
        "DURATION": data.duration || "",
        "STIPEND": data.stipend || "",
        "SALARY": data.salary || "",
        "MODE": data.mode || "",
        "SKILLS": data.skills || "",
        "HR NAME": data.hr_name || "",
        "PHONE NUMBER": data.hr_phone ? `'${data.hr_phone}` : ""
      };
    } else {
      // NEW ORDER FOR CARDS (MATCHING USER REQUEST):
      // A: S.NO, B: COMPANY NAME, C: PERSON NAME, D: DESIGNATION, E: PHONE NO 1, F: PHONE NO 2, G: PHONE NO 3, H: EMAIL ID 1, I: EMAIL ID 2, J: WEBSITE LINK, K: ADDRESS/LOCATION, L: INDUSTRY, M: OTHERS
      
      const phones = data.phones || [];
      const emails = data.emails || [];

      payload = {
        "S.NO": "", 
        "COMPANT NAME": data.company_name || "",
        "PERSON NAME": data.name || "",
        "DESIGNATION": data.designation || "",
        "PHONE NO 1": phones[0] ? `'${phones[0]}` : "nil",
        "PHONE 2": phones[1] ? `'${phones[1]}` : "nil",
        "PHONE NO 3": phones[2] ? `'${phones[2]}` : "nil",
        "EMAIL ID 1": emails[0] || "nil",
        "EMAIL ID 2": emails[1] || "nil",
        "WEBSITE LINK": data.website || "nil",
        "ADDRESS/LOCATION": data.address || "",
        "INDUSTRY": data.industry || "General",
        "OTHERS": data.others || "-"
      };
    }

    console.log(`Attempting to append ${type} data to: ${webAppUrl}`);
    console.log(`Payload:`, JSON.stringify(payload, null, 2));

    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`Google Sheets Response [${response.status}]:`, responseText);

    if (response.ok) {
      console.log(`Successfully appended ${type} data to Google Sheets via Web App`);
    } else {
      console.error(`Failed to append ${type} to Google Sheets:`, response.status, response.statusText, responseText);
    }
  } catch (error) {
    console.error(`Error appending ${type} to Google Sheets:`, error);
  }
}

module.exports = { appendToSheet };
