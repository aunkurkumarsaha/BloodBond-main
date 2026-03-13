const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../utils/supabase');

// GET all upcoming camps (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blood_camps')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching camps:', err);
    res.status(500).json({ message: 'Error fetching camps' });
  }
});

// GET all camps including past (public)
router.get('/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blood_camps')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching all camps:', err);
    res.status(500).json({ message: 'Error fetching camps' });
  }
});

// POST create a new camp (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const {
      title, date, startTime, endTime,
      locationAddress, locationCity, locationState,
      description, contactPhone, contactEmail, maxDonors
    } = req.body;

    // Get organizer name
    let organizerName = 'Unknown';
    if (req.user.type === 'hospital') {
      const { data: hospital } = await supabase
        .from('hospitals')
        .select('hospital_name')
        .eq('id', req.user.id)
        .single();
      organizerName = hospital?.hospital_name || 'Hospital';
    } else {
      const { data: user } = await supabase
        .from('users')
        .select('name')
        .eq('id', req.user.id)
        .single();
      organizerName = user?.name || 'User';
    }

    const { data, error } = await supabase
      .from('blood_camps')
      .insert({
        title,
        organizer: organizerName,
        organizer_id: req.user.id,
        date,
        start_time: startTime,
        end_time: endTime,
        location_address: locationAddress,
        location_city: locationCity,
        location_state: locationState,
        description: description || null,
        contact_phone: contactPhone,
        contact_email: contactEmail || null,
        max_donors: maxDonors || 100,
        status: 'upcoming'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating camp:', err);
    res.status(500).json({ message: 'Error creating camp' });
  }
});

module.exports = router;
