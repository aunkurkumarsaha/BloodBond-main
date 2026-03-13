const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../utils/supabase');

router.get('/profile', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, blood_group, location_city, location_state, last_donation, eligible_to_donate, donation_history, health_info, notifications, preferences, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format to match frontend expectations
    const formatted = {
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.blood_group,
      location: { city: user.location_city, state: user.location_state },
      lastDonation: user.last_donation,
      eligibleToDonate: user.eligible_to_donate,
      donationHistory: user.donation_history,
      healthInfo: user.health_info,
      notifications: user.notifications,
      preferences: user.preferences
    };

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/blood-requests', auth, async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from('blood_requests')
      .select('*, hospitals:hospital_id(hospital_name)')
      .eq('user_id', req.user.id)
      .order('request_date', { ascending: false });

    if (error) throw error;

    // Format to match frontend expectations
    const formatted = (requests || []).map(r => ({
      _id: r.id,
      patientName: r.patient_name,
      bloodGroup: r.blood_group,
      unitsRequired: r.units_required,
      priority: r.priority,
      status: r.status,
      requestDate: r.request_date,
      hospital: r.hospitals ? { hospitalName: r.hospitals.hospital_name } : null
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
