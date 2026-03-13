const supabase = require('../utils/supabase');

const createEmergencyRequest = async (req, res) => {
  try {
    const { name, phone, bloodGroup, units, hospital, location } = req.body;

    const { data: emergencyRequest, error } = await supabase
      .from('emergency_requests')
      .insert({
        name,
        phone,
        blood_group: bloodGroup,
        units,
        hospital,
        location_city: location?.city,
        location_state: location?.state
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Emergency request created successfully',
      requestId: emergencyRequest.id
    });

  } catch (error) {
    console.error('Error creating emergency request:', error);
    res.status(500).json({ message: 'Error creating emergency request' });
  }
};

const getEmergencyRequests = async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from('emergency_requests')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emergency requests' });
  }
};

module.exports = {
  createEmergencyRequest,
  getEmergencyRequests
};
