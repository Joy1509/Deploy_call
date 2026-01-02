import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const PasswordStrengthIndicator = ({ password, onValidation }) => {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!password) {
      setValidation(null);
      onValidation?.(null);
      return;
    }

    const validatePassword = async () => {
      setLoading(true);
      try {
        const response = await apiClient.post('/auth/validate-password', { password });
        setValidation(response.data);
        onValidation?.(response.data);
      } catch (error) {
        console.error('Password validation error:', error);
        setValidation({ isValid: false, errors: ['Validation failed'], strength: 'weak' });
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(validatePassword, 300);
    return () => clearTimeout(debounceTimer);
  }, [password, onValidation]);

  if (!password || loading) return null;

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'strong': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'weak': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStrengthWidth = (strength) => {
    switch (strength) {
      case 'strong': return 'w-full';
      case 'medium': return 'w-2/3';
      case 'weak': return 'w-1/3';
      default: return 'w-0';
    }
  };

  const getStrengthBg = (strength) => {
    switch (strength) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'weak': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {validation && (
        <>
          {/* Strength Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Password Strength</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStrengthColor(validation.strength)}`}>
                {validation.strength?.toUpperCase()}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ease-out ${getStrengthBg(validation.strength)} ${getStrengthWidth(validation.strength)}`}
              />
            </div>
          </div>

          {/* Requirements Checklist */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-600 mb-2">Requirements:</div>
            {[
              { check: password.length >= 8, text: 'At least 8 characters' },
              { check: /[a-z]/.test(password), text: 'One lowercase letter' },
              { check: /[A-Z]/.test(password), text: 'One uppercase letter' },
              { check: /\d/.test(password), text: 'One number' },
              { check: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), text: 'One special character' }
            ].map((req, index) => (
              <div key={index} className="flex items-center text-xs">
                <div className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center ${req.check ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {req.check && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={req.check ? 'text-green-600' : 'text-gray-500'}>{req.text}</span>
              </div>
            ))}
          </div>

          {/* Error Messages */}
          {validation.errors && validation.errors.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-red-600 mb-1">Issues to fix:</div>
              {validation.errors.map((error, index) => (
                <p key={index} className="text-xs text-red-600 flex items-start">
                  <span className="mr-1 mt-0.5">•</span>
                  <span>{error}</span>
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;