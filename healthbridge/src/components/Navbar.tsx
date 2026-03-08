import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav className="bg-gray-900 p-4 shadow-lg">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-200">Virtual Hospital</h1>
                <ul className="flex space-x-6 text-white">
                    <li><Link to="/" className="hover:text-blue-300 transition">Home</Link></li>
                    <li><Link to="/symptoms-analysis" className="hover:text-blue-300 transition">Symptom Analysis</Link></li>
                    <li><Link to="/patient-records" className="hover:text-blue-300 transition">Patient Records</Link></li>
                    <li><Link to="/virtual-consult" className="hover:text-blue-300 transition">Virtual Consult</Link></li>
                    <li><Link to="/about-us" className="hover:text-blue-300 transition">About Us</Link></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;