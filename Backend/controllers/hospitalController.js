const supabase = require('../utils/supabase');
const { sendBloodRequest } = require('../utils/emailService');

const bloodTypeMap = {
  'A+': 'aPositive',
  'A-': 'aNegative',
  'B+': 'bPositive',
  'B-': 'bNegative',
  'AB+': 'abPositive',
  'AB-': 'abNegative',
  'O+': 'oPositive',
  'O-': 'oNegative'
};

const getHospitalProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { data: hospital, error } = await supabase
      .from('hospitals')
      .select('id, email, phone, hospital_name, registration_number, location_city, location_state, inventory, status, operating_hours_open, operating_hours_close, emergency_contact_name, emergency_contact_phone, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Format response to match frontend expectations
    const formatted = {
      _id: hospital.id,
      ...hospital,
      hospitalName: hospital.hospital_name,
      registrationNumber: hospital.registration_number,
      location: { city: hospital.location_city, state: hospital.location_state },
      operatingHours: { open: hospital.operating_hours_open, close: hospital.operating_hours_close },
      emergencyContact: { name: hospital.emergency_contact_name, phone: hospital.emergency_contact_phone }
    };

    res.json(formatted);
  } catch (err) {
    console.error('getHospitalProfile error:', err);
    res.status(500).json({ message: 'Error fetching hospital profile' });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { data: hospital, error: fetchError } = await supabase
      .from('hospitals')
      .select('inventory')
      .eq('id', req.user.id)
      .single();

    if (fetchError || !hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const updatedInventory = { ...hospital.inventory, ...req.body };

    const { data, error } = await supabase
      .from('hospitals')
      .update({ inventory: updatedInventory })
      .eq('id', req.user.id)
      .select('inventory')
      .single();

    if (error) throw error;

    res.json({
      message: 'Inventory updated successfully',
      inventory: data.inventory
    });
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ message: 'Error updating inventory' });
  }
};

const getAllHospitals = async (req, res) => {
  try {
    const { data: hospitals, error } = await supabase
      .from('hospitals')
      .select('id, email, phone, hospital_name, registration_number, location_city, location_state, inventory, status, operating_hours_open, operating_hours_close, emergency_contact_name, emergency_contact_phone, created_at');

    if (error) throw error;

    // Get reviews for all hospitals
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*');

    // Format response to match frontend expectations
    const formatted = hospitals.map(h => ({
      _id: h.id,
      ...h,
      hospitalName: h.hospital_name,
      registrationNumber: h.registration_number,
      location: { city: h.location_city, state: h.location_state },
      operatingHours: { open: h.operating_hours_open, close: h.operating_hours_close },
      emergencyContact: { name: h.emergency_contact_name, phone: h.emergency_contact_phone },
      reviews: (reviews || []).filter(r => r.hospital_id === h.id).map(r => ({
        userName: r.user_name,
        rating: r.rating,
        comment: r.comment,
        date: r.created_at
      }))
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const { data: hospital, error } = await supabase
      .from('hospitals')
      .select('id, email, phone, hospital_name, registration_number, location_city, location_state, inventory, status, operating_hours_open, operating_hours_close, emergency_contact_name, emergency_contact_phone, created_at')
      .eq('id', req.params.id)
      .single();

    if (error || !hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Get reviews for this hospital
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('hospital_id', hospital.id)
      .order('created_at', { ascending: false });

    const formatted = {
      _id: hospital.id,
      ...hospital,
      hospitalName: hospital.hospital_name,
      registrationNumber: hospital.registration_number,
      location: { city: hospital.location_city, state: hospital.location_state },
      operatingHours: { open: hospital.operating_hours_open, close: hospital.operating_hours_close },
      emergencyContact: { name: hospital.emergency_contact_name, phone: hospital.emergency_contact_phone },
      reviews: (reviews || []).map(r => ({
        userName: r.user_name,
        rating: r.rating,
        comment: r.comment,
        date: r.created_at
      }))
    };

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching hospital:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        hospital_id: req.params.id,
        user_name: req.user.name,
        rating,
        comment
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Review added successfully',
      review: {
        userName: review.user_name,
        rating: review.rating,
        comment: review.comment,
        date: review.created_at
      }
    });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Error adding review' });
  }
};

const requestBlood = async (req, res) => {
  try {
    const { patientName, bloodGroup, unitsRequired } = req.body;
    const hospitalId = req.params.hospitalId;
    const userId = req.user.id;

    if (!patientName || !bloodGroup || !unitsRequired) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get hospital
    const { data: hospital, error: hospError } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', hospitalId)
      .single();

    if (hospError || !hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Check blood availability
    const inventoryKey = bloodTypeMap[bloodGroup];
    if (!inventoryKey || (hospital.inventory[inventoryKey] || 0) < unitsRequired) {
      return res.status(400).json({ message: 'Required blood units not available' });
    }

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create blood request
    const { data: bloodRequest, error: insertError } = await supabase
      .from('blood_requests')
      .insert({
        patient_name: patientName,
        blood_group: bloodGroup,
        units_required: unitsRequired,
        hospital_id: hospitalId,
        user_id: userId,
        status: 'PENDING'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Send email notification
    try {
      await sendBloodRequest(hospital.email, {
        patientName,
        bloodGroup,
        unitsRequired,
        replyTo: user.email
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Blood request sent successfully',
      requestId: bloodRequest.id
    });

  } catch (error) {
    console.error('Blood request error:', error);
    res.status(500).json({
      message: 'Error processing blood request',
      error: error.message
    });
  }
};

const getHospitalRequests = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { data: hospital } = await supabase
      .from('hospitals')
      .select('id')
      .eq('id', req.user.id)
      .single();

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const { data: requests, error } = await supabase
      .from('blood_requests')
      .select('*, users:user_id(name, email, phone)')
      .eq('hospital_id', req.user.id)
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
      responseDate: r.response_date,
      notes: r.notes,
      user: r.users ? { name: r.users.name, email: r.users.email, phone: r.users.phone } : null
    }));

    const pendingRequests = formatted.filter(r => r.status === 'PENDING');
    const approvedRequests = formatted.filter(r => r.status === 'APPROVED');

    res.json({
      pendingRequests,
      approvedRequests,
      total: formatted.length
    });
  } catch (err) {
    console.error('getHospitalRequests error:', err);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    const { data: request, error: fetchError } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.hospital_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const timeline = request.timeline || [];
    timeline.push({ status, notes, date: new Date().toISOString() });

    const { data, error } = await supabase
      .from('blood_requests')
      .update({ status, notes, response_date: new Date().toISOString(), timeline })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Request updated successfully', request: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getHospitalProfile,
  updateInventory,
  getAllHospitals,
  getHospitalById,
  addReview,
  requestBlood,
  getHospitalRequests,
  updateRequestStatus
};
