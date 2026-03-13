const supabase = require('../utils/supabase');

const getUserProfile = async (req, res) => {
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
      ...user,
      bloodGroup: user.blood_group,
      location: { city: user.location_city, state: user.location_state },
      lastDonation: user.last_donation,
      eligibleToDonate: user.eligible_to_donate,
      donationHistory: user.donation_history,
      healthInfo: user.health_info
    };

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUserProfile };
