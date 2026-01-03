import React from 'react';
import { checkPasswordStrength } from '../schemas/userValidation';

const PasswordStrengthIndicator = ({ password }) => {
  const { requirements, strength, isValid } = checkPasswordStrength(password || '');

  const getStrengthColor = () => {
    switch (strength) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getStrengthWidth = () => {
    const passedCount = requirements.filter(req => req.test).length;
    return `${(passedCount / requirements.length) * 100}%`;
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: getStrengthWidth() }}
        />
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center text-xs">
            <span className={`mr-2 ${req.test ? 'text-green-500' : 'text-red-500'}`}>
              {req.test ? '✓' : '✗'}
            </span>
            <span className={req.test ? 'text-green-700' : 'text-gray-600'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

      {/* Overall Status */}
      <div className={`text-xs font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
        Password strength: {strength.charAt(0).toUpperCase() + strength.slice(1)}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;