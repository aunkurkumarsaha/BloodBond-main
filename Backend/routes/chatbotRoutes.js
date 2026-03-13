const express = require('express');
const supabase = require('../utils/supabase');
const router = express.Router();

router.get('/data', async (req, res) => {
  try {
    // Fetch all data in parallel
    const [hospitalsResult, usersResult, emergenciesResult, reviewsResult] = await Promise.all([
      supabase.from('hospitals').select('id, hospital_name, location_city, location_state, inventory, email, phone'),
      supabase.from('users').select('blood_group, location_city, location_state'),
      supabase.from('emergency_requests').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('reviews').select('*')
    ]);

    const hospitals = hospitalsResult.data || [];
    const users = usersResult.data || [];
    const emergencies = emergenciesResult.data || [];
    const reviews = reviewsResult.data || [];

    // Calculate statistics
    const bloodInventory = hospitals.reduce((acc, hospital) => {
      const inv = hospital.inventory || {};
      acc.aPositive = (acc.aPositive || 0) + (inv.aPositive || 0);
      acc.aNegative = (acc.aNegative || 0) + (inv.aNegative || 0);
      acc.bPositive = (acc.bPositive || 0) + (inv.bPositive || 0);
      acc.bNegative = (acc.bNegative || 0) + (inv.bNegative || 0);
      acc.abPositive = (acc.abPositive || 0) + (inv.abPositive || 0);
      acc.abNegative = (acc.abNegative || 0) + (inv.abNegative || 0);
      acc.oPositive = (acc.oPositive || 0) + (inv.oPositive || 0);
      acc.oNegative = (acc.oNegative || 0) + (inv.oNegative || 0);
      return acc;
    }, {});

    const cityWiseDistribution = hospitals.reduce((acc, h) => {
      acc[h.location_city] = (acc[h.location_city] || 0) + 1;
      return acc;
    }, {});

    const ratings = reviews.map(r => r.rating).filter(r => r != null);
    const averageRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;

    const bloodTypeDistribution = users.reduce((acc, user) => {
      acc[user.blood_group] = (acc[user.blood_group] || 0) + 1;
      return acc;
    }, {});

    const statistics = {
      totalHospitals: hospitals.length,
      totalUsers: users.length,
      activeEmergencies: emergencies.filter(e => e.status === 'PENDING').length,
      bloodInventory,
      cityWiseDistribution,
      recentDonations: 0,
      averageRating,
      emergencyResponseTime: "30 minutes",
      bloodTypeDistribution
    };

    // Calculate per-hospital rating
    const getHospitalRating = (hospitalId) => {
      const hospReviews = reviews.filter(r => r.hospital_id === hospitalId);
      const hospRatings = hospReviews.map(r => r.rating).filter(r => r != null);
      return hospRatings.length ? (hospRatings.reduce((a, b) => a + b, 0) / hospRatings.length).toFixed(1) : 0;
    };

    res.json({
      hospitals: hospitals.map(h => ({
        name: h.hospital_name,
        location: { city: h.location_city, state: h.location_state },
        inventory: h.inventory,
        reviews: reviews.filter(r => r.hospital_id === h.id),
        rating: getHospitalRating(h.id)
      })),
      users: users.map(u => ({
        bloodGroup: u.blood_group,
        location: { city: u.location_city, state: u.location_state }
      })),
      emergencies: emergencies.map(e => ({
        bloodGroup: e.blood_group,
        status: e.status,
        location: { city: e.location_city, state: e.location_state },
        createdAt: e.created_at
      })),
      statistics
    });
  } catch (error) {
    console.error('Chatbot data error:', error);
    res.status(500).json({ message: 'Error fetching chatbot data' });
  }
});

module.exports = router;
