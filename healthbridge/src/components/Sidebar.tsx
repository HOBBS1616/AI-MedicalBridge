import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white shadow-lg z-20">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-teal-300 mb-6">Virtual Hospital</h2>
                <ul className="space-y-4">
                    <li><Link to="/" className="block px-4 py-2 hover:bg-teal-700 rounded transition">Home</Link></li>
                    <li><Link to="/dashboard" className="block px-4 py-2 hover:bg-teal-700 rounded transition">Dashboard</Link></li>
                    <li><Link to="/virtual-consult" className="block px-4 py-2 hover:bg-teal-700 rounded transition">Virtual Consult</Link></li>
                    <li><Link to="/about-us" className="block px-4 py-2 hover:bg-teal-700 rounded transition">About Us</Link></li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;