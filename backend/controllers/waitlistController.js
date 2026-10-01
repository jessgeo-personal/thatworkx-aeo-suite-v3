import WaitlistSignup from '../models/WaitlistSignup.js';

export async function handleWaitlistSubmission(req, res) {
  try {
    const { firstName, lastName, email, phone, country, tier } = req.body;

    if (!firstName || !lastName || !email || !phone || !country) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: firstName, lastName, email, phone, and country are mandatory.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address provided.'
      });
    }

    const signup = new WaitlistSignup({
      firstName,
      lastName,
      email,
      phone,
      country,
      tier: tier || 'AI Optimize Pro'
    });
    const saved = await signup.save();

    const portalId = process.env.HUBSPOT_PORTAL_ID || 'mock_portal_id';
    const formGuid = process.env.HUBSPOT_WAITLIST_FORM_GUID || 'mock_form_guid';

    if (portalId && formGuid) {
      const hubspotEndpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;
      try {
        await fetch(hubspotEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: [
              { objectTypeId: '0-1', name: 'firstname', value: firstName },
              { objectTypeId: '0-1', name: 'lastname', value: lastName },
              { objectTypeId: '0-1', name: 'email', value: email },
              { objectTypeId: '0-1', name: 'phone', value: phone },
              { objectTypeId: '0-1', name: 'country', value: country }
            ],
            context: {
              pageUri: req.headers?.referer || 'https://thatworkx.com/visualize.html',
              pageName: 'AEO Suite V3 - AI Optimize Pro Waitlist'
            }
          })
        });
      } catch (hsError) {
        console.error('HubSpot dispatch failed:', hsError.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Successfully registered for the AI Optimize Pro waitlist.',
      data: {
        id: saved._id,
        email: saved.email,
        tier: saved.tier
      }
    });
  } catch (err) {
    console.error('Waitlist submission error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing waitlist registration.'
    });
  }
}
