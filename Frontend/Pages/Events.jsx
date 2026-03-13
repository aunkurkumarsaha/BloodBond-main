import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaPhone,
  FaEnvelope,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { MdEventAvailable } from "react-icons/md";

const Events = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    locationAddress: "",
    locationCity: "",
    locationState: "",
    description: "",
    contactPhone: "",
    contactEmail: "",
    maxDonors: 100,
  });

  useEffect(() => {
    fetchCamps();
    // Auto-fill location
    const fillLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.city && data.region) {
          setForm((prev) => ({
            ...prev,
            locationCity: data.city,
            locationState: data.region,
          }));
        }
      } catch {}
    };
    fillLocation();
  }, []);

  const fetchCamps = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/camps");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setCamps(data);
    } catch (err) {
      console.error("Error fetching camps:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/camps", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to create camp");

      toast.success("Blood donation camp created successfully! 🎉");
      setShowForm(false);
      setForm({
        title: "",
        date: "",
        startTime: "09:00",
        endTime: "17:00",
        locationAddress: "",
        locationCity: form.locationCity,
        locationState: form.locationState,
        description: "",
        contactPhone: "",
        contactEmail: "",
        maxDonors: 100,
      });
      fetchCamps();
    } catch (err) {
      toast.error("Failed to create camp. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 pt-24 pb-12 px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl mx-auto mb-10"
      >
        <div className="flex items-center justify-center mb-4">
          <MdEventAvailable className="text-5xl text-red-500 mr-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Blood Donation Camps
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-6">
          Organize or join blood donation camps in your area and save lives
        </p>
        {isLoggedIn && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2 mx-auto"
          >
            {showForm ? (
              <>
                <FaTimes /> Cancel
              </>
            ) : (
              <>
                <FaPlus /> Organize a Camp
              </>
            )}
          </button>
        )}
      </motion.div>

      {/* Create Camp Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-2xl mx-auto mb-10 overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📋 Organize a Blood Donation Camp
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Camp Title *
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Annual Blood Donation Drive"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue / Address *
                  </label>
                  <input
                    name="locationAddress"
                    value={form.locationAddress}
                    onChange={handleChange}
                    required
                    placeholder="e.g., City Hospital, Main Road"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    name="locationCity"
                    value={form.locationCity}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    name="locationState"
                    value={form.locationState}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleChange}
                    required
                    placeholder="Phone number"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                    placeholder="Email (optional)"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Donors
                  </label>
                  <input
                    type="number"
                    name="maxDonors"
                    value={form.maxDonors}
                    onChange={handleChange}
                    min="10"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Additional details about the camp..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {submitting ? "Creating..." : "🩸 Create Blood Donation Camp"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camps List */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {camps.length > 0 ? (
            camps.map((camp, index) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-l-4 border-red-500 p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:justify-between">
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {camp.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          camp.status === "upcoming"
                            ? "bg-green-100 text-green-700"
                            : camp.status === "ongoing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {camp.status?.charAt(0).toUpperCase() +
                          camp.status?.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Organized by {camp.organizer}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center text-gray-700">
                        <FaCalendarAlt className="text-red-500 mr-2 flex-shrink-0" />
                        <span>
                          {new Date(camp.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <FaClock className="text-red-500 mr-2 flex-shrink-0" />
                        <span>
                          {camp.start_time?.slice(0, 5)} -{" "}
                          {camp.end_time?.slice(0, 5)}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <FaMapMarkerAlt className="text-red-500 mr-2 flex-shrink-0" />
                        <span>
                          {camp.location_address}, {camp.location_city},{" "}
                          {camp.location_state}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <FaUsers className="text-red-500 mr-2 flex-shrink-0" />
                        <span>
                          {camp.registered_donors}/{camp.max_donors} donors
                        </span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <FaPhone className="text-red-500 mr-2 flex-shrink-0" />
                        <span>{camp.contact_phone}</span>
                      </div>

                      {camp.contact_email && (
                        <div className="flex items-center text-gray-700">
                          <FaEnvelope className="text-red-500 mr-2 flex-shrink-0" />
                          <span>{camp.contact_email}</span>
                        </div>
                      )}
                    </div>

                    {camp.description && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm">
                          {camp.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-12 bg-white rounded-xl shadow-md"
            >
              <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                No upcoming blood donation camps found.
              </p>
              {isLoggedIn ? (
                <p className="text-gray-400">
                  Be the first to organize one! Click "Organize a Camp" above.
                </p>
              ) : (
                <p className="text-gray-400">
                  Log in to organize a blood donation camp.
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
