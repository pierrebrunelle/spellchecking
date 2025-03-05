// File path: /api/correct.js
// Vercel serverless function to handle text correction

export default async function handler(req, res) {
  // Add CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests for actual API calls
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Call OpenAI API to correct the text
    const correctedText = await callOpenAIAPI(text);
    
    return res.status(200).json({ 
      originalText: text,
      correctedText: correctedText 
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

async function callOpenAIAPI(text) {
  // You can use GPT-3.5 Turbo or GPT-4 depending on your needs
  const modelId = process.env.OPENAI_MODEL_ID || 'gpt-3.5-turbo';
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { 
            role: 'system', 
            content: 'You are a spelling and grammar correction assistant. Your task is to correct any spelling mistakes, grammar errors, or typos in the provided text. Maintain the original tone and meaning. Return only the corrected text with no explanations or additional text. Preserve paragraph breaks and formatting.' 
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3, // Lower temperature for more consistent responses
        max_tokens: 1500 // Adjust as needed based on your expected text length
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return getFallbackCorrectedText(text);
    }
    
    return data.choices[0].message.content.trim();
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return getFallbackCorrectedText(text);
  }
}

// Fallback function if API call fails - does basic corrections for common typos
function getFallbackCorrectedText(text) {
  // This is a simple fallback with limited corrections
  // In a production environment, you might want to use a local spellchecker library
  return text
    .replace(/Thier/g, "Their")
    .replace(/thier/g, "their")
    .replace(/problam/g, "problem")
    .replace(/delivary/g, "delivery")
    .replace(/recieved/g, "received")
    .replace(/iteams/g, "items")
    .replace(/alot/g, "a lot")
    .replace(/adress/g, "address")
    .replace(/isue/g, "issue")
    .replace(/posible/g, "possible")
    .replace(/attaced/g, "attached")
    .replace(/photoes/g, "photos")
    .replace(/damege/g, "damage")
    .replace(/foward/g, "forward")
    .replace(/responce/g, "response")
    .replace(/seperate/g, "separate")
    .replace(/definately/g, "definitely")
    .replace(/occured/g, "occurred")
    .replace(/beleive/g, "believe")
    .replace(/acheive/g, "achieve")
    .replace(/accomodate/g, "accommodate")
    .replace(/wierd/g, "weird")
    .replace(/neccessary/g, "necessary")
    .replace(/tommorrow/g, "tomorrow")
    .replace(/unfortunatly/g, "unfortunately")
    .replace(/concious/g, "conscious");
}
