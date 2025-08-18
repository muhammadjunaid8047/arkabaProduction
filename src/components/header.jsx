import React from "react";
import { MdOutlineEmail } from "react-icons/md";
import { FaPhoneVolume, FaFacebook, FaInstagram } from "react-icons/fa";
import Link from "next/link";

const Header = () => {
  return (
    <div className="bg-gray-900 text-white py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        {/* Social Links */}
        <div className="flex items-center space-x-4 text-xs sm:text-sm">
          <Link 
            href="https://www.facebook.com/ArkansasABA/?eid=ARAZWqoBR7cktpJBGoKPbccAlIOlkdv08ICNHLDf5pHqSVVmX35rMGSgiiw19GXRMfdzjURZHxy6AxUH"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-red-400 transition-colors duration-200"
          >
            <FaFacebook className="h-3 w-3" />
            <span className="hidden sm:inline">Facebook</span>
          </Link>
          <span className="text-gray-600">|</span>
          <Link 
            href="https://www.instagram.com/arkansasaba/#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-red-400 transition-colors duration-200"
          >
            <FaInstagram className="h-3 w-3" />
            <span className="hidden sm:inline">Instagram</span>
          </Link>
          <span className="text-gray-600">|</span>
          <Link 
            href="mailto:info@arkaba.org"
            className="flex items-center space-x-1 hover:text-red-400 transition-colors duration-200"
          >
            <MdOutlineEmail className="h-3 w-3" />
            <span className="hidden sm:inline">Email</span>
          </Link>
        </div>

        {/* Contact Info */}
        <div className="flex items-center space-x-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <FaPhoneVolume className="h-3 w-3 text-gray-400" />
            <span className="text-gray-400">Call Us:</span>
            <span className="hidden sm:inline">(501) 555-0123</span>
          </div>
          <Link
            href="mailto:info@arkaba.org"
            className="flex items-center space-x-2 hover:text-red-400 transition-colors duration-200"
          >
            <MdOutlineEmail className="h-3 w-3" />
            <span className="text-gray-400">Email:</span>
            <span className="hidden sm:inline">info@arkaba.org</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
