const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../utils/supabase');
const {
  getHospitalProfile,
  updateInventory,
  getAllHospitals,
  getHospitalById,
  addReview,
  requestBlood,
  getHospitalRequests,
  updateRequestStatus
} = require('../controllers/hospitalController');

// Protected routes should come before parameterized routes to avoid conflicts
router.get('/profile', auth, getHospitalProfile);
router.get('/requests', auth, getHospitalRequests);
router.put('/inventory', auth, updateInventory);
router.put('/requests/:requestId', auth, updateRequestStatus);

// Nearby donors - returns users in the same city as the hospital
router.get('/nearby-donors', auth, async (req, res) => {
  try {
    // Get hospital's location
    const { data: hospital, error: hospError } = await supabase
      .from('hospitals')
      .select('location_city, location_state')
      .eq('id', req.user.id)
      .single();

    if (hospError || !hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Find users in the same city
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, blood_group, phone, location_city, location_state, eligible_to_donate, last_donation')
      .eq('location_city', hospital.location_city);

    if (usersError) throw usersError;

    const formatted = (users || []).map(u => ({
      _id: u.id,
      name: u.name,
      bloodGroup: u.blood_group,
      phone: u.phone,
      location: { city: u.location_city, state: u.location_state },
      eligibleToDonate: u.eligible_to_donate,
      lastDonation: u.last_donation
    }));

    res.json({
      donors: formatted,
      hospitalCity: hospital.location_city,
      hospitalState: hospital.location_state,
      total: formatted.length
    });
  } catch (err) {
    console.error('Nearby donors error:', err);
    res.status(500).json({ message: 'Error fetching nearby donors' });
  }
});

// Public and parameterized routes
router.get('/', getAllHospitals);
router.get('/:id', getHospitalById);
router.post('/:id/reviews', auth, addReview);
router.post('/:hospitalId/request-blood', auth, requestBlood);

module.exports = router;
