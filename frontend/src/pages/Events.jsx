import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/events", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => { setEvents(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <p className="text-center mt-10 text-white">Loading events...</p>;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h2 className="text-3xl mb-6 font-bold text-red-500 text-center">Events</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {events.map(e => (
          <div key={e._id} className="bg-[#111] p-4 rounded-lg shadow-lg border border-red-700/40">
            <h3 className="text-xl font-bold text-red-400">{e.title}</h3>
            <p className="mt-2">{e.description}</p>
            <p className="mt-1 text-gray-400 text-sm">Date: {e.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
