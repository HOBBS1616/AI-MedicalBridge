import React from 'react';

const DashboardPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-teal-950 to-gray-900 text-white flex flex-col items-center p-6">
            <div className="w-full max-w-6xl mt-6">
                <h1 className="text-4xl font-montserrat font-bold text-teal-300 mb-8">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                        <h2 className="text-xl text-teal-300 mb-2">Symptom Analysis</h2>
                        <p className="text-gray-400">Analyze symptoms with ICD-10/11 standards (available post-registration).</p>
                        <a href="/symptom-analysis" className="mt-4 inline-block px-4 py-2 bg-teal-600 rounded hover:bg-teal-700 transition">Start Analysis</a>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                        <h2 className="text-xl text-teal-300 mb-2">Virtual Consultations</h2>
                        <p className="text-gray-400">Connect with healthcare professionals online.</p>
                        <a href="/virtual-consult" className="mt-4 inline-block px-4 py-2 bg-teal-600 rounded hover:bg-teal-700 transition">Book Now</a>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                        <h2 className="text-xl text-teal-300 mb-2">Patient Records</h2>
                        <p className="text-gray-400">View and manage records (admin access only).</p>
                        <a href="/patient-records" className="mt-4 inline-block px-4 py-2 bg-teal-600 rounded hover:bg-teal-700 transition">Access Records</a>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                        <h2 className="text-xl text-teal-300 mb-2">Health Resources</h2>
                        <p className="text-gray-400">Access educational materials and tips.</p>
                        <a href="/resources" className="mt-4 inline-block px-4 py-2 bg-teal-600 rounded hover:bg-teal-700 transition">Explore</a>
                    </div>
                </div>
                <div className="mt-12 p-6 bg-gray-800 rounded-lg shadow-lg">
                    <h2 className="text-xl text-teal-300 mb-4"> Healing Scriptures & Messages </h2>
                    <p className="text-gray-400 mb-2">For Migraine: <em>"He heals the brokenhearted and binds up their wounds." (Psalm 147:3)</em></p>
                    <p className="text-gray-400 mb-2">For Heart Issues: <em>"The Lord sustains him on his sickbed." (Psalm 41:3)</em></p>
                    <p className="text-gray-400">Trust in God’s healing power alongside medical care.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;