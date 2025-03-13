import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Feli</div>
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="hover:text-gray-300">Home</Link>
          </li>
          <li>
            <Link to="/builder" className="hover:text-gray-300">Builder</Link>
          </li>
          <li>
            <Link to="/communities" className="hover:text-gray-300">Communities</Link>
          </li>
          {/* ...existing nav items... */}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
