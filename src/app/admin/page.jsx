"use client";

import { useEffect, useState } from "react";

export default function Admin() {
  const [contacts, setContacts] = useState([]);
  const [involvements, setInvolvements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contactRes = await fetch("/api/contact/get");
        const contactData = await contactRes.json();
        setContacts(contactData);

        const involvedRes = await fetch("/api/getinvolved/get");
        const involvedData = await involvedRes.json();
        setInvolvements(involvedData);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 font-sans space-y-10">
      <h1 className="text-3xl font-bold text-center">ArkABA Admin Portal</h1>

      {/* Contact Us Submissions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Contact Us Submissions</h2>
        {contacts.length === 0 ? (
          <p className="text-gray-600">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {contacts.map((c) => (
              <div
                key={c._id}
                className="border p-4 rounded-lg bg-white shadow-md"
              >
                <p><strong>Name:</strong> {c.firstName} {c.lastName}</p>
                <p><strong>Email:</strong> {c.email}</p>
                <p><strong>Message:</strong> {c.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Get Involved Submissions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Get Involved Submissions</h2>
        {involvements.length === 0 ? (
          <p className="text-gray-600">No responses yet.</p>
        ) : (
          <div className="space-y-4">
            {involvements.map((g) => (
              <div
                key={g._id}
                className="border p-4 rounded-lg bg-white shadow-md"
              >
                <p><strong>Name:</strong> {g.firstName} {g.lastName}</p>
                <p><strong>Email:</strong> {g.email}</p>
                <p><strong>Join Committee:</strong> {g.joinCommittee ? "Yes" : "No"}</p>
                <p><strong>Event Planning:</strong> {g.planEvents ? "Yes" : "No"}</p>
                <p><strong>Offer CEU:</strong> {g.offerCEU ? "Yes" : "No"}</p>
                <p><strong>Advocacy Support:</strong> {g.supportAdvocacy ? "Yes" : "No"}</p>
                <p><strong>Other:</strong> {g.otherInterest}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
