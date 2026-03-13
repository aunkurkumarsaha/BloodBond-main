const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../utils/supabase');
const { sendBloodRequest } = require('../utils/emailService');

const bloodTypeMap = {
  'A+': 'aPositive', 'A-': 'aNegative',
  'B+': 'bPositive', 'B-': 'bNegative',
  'AB+': 'abPositive', 'AB-': 'abNegative',
  'O+': 'oPositive', 'O-': 'oNegative'
};

// Create a blood request
router.post('/:hospitalId', auth, async (req, res) => {
  try {
    const { patientName, bloodGroup, unitsRequired, priority } = req.body;
    const hospitalId = req.params.hospitalId;

    // Validate hospital exists
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

    // Create blood request
    const { data: bloodRequest, error: insertError } = await supabase
      .from('blood_requests')
      .insert({
        patient_name: patientName,
        blood_group: bloodGroup,
        units_required: unitsRequired,
        priority: priority || 'NORMAL',
        hospital_id: hospitalId,
        user_id: req.user.id,
        status: 'PENDING'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Send email to hospital
    try {
      await sendBloodRequest(hospital.email, {
        patientName,
        bloodGroup,
        unitsRequired,
        replyTo: req.user.email
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      requestId: bloodRequest.id
    });

  } catch (error) {
    console.error('Blood request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's blood requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from('blood_requests')
      .select('*, hospitals:hospital_id(hospital_name, email, phone)')
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
      hospital: r.hospitals ? { hospitalName: r.hospitals.hospital_name, email: r.hospitals.email, phone: r.hospitals.phone } : null
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel blood request
router.put('/cancel/:requestId', auth, async (req, res) => {
  try {
    const { data: request, error: fetchError } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('id', req.params.requestId)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: 'Cannot cancel processed request' });
    }

    const timeline = request.timeline || [];
    timeline.push({ status: 'CANCELLED', notes: 'Cancelled by user', date: new Date().toISOString() });

    const { error } = await supabase
      .from('blood_requests')
      .update({ status: 'CANCELLED', timeline })
      .eq('id', req.params.requestId);

    if (error) throw error;

    res.json({ message: 'Request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
