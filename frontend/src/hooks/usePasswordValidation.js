import { useState, useEffect } from 'react';
import { checkPasswordStrength } from '../schemas/userValidation';

export const usePasswordValidation = (password) => {
  const [validation, setValidation] = useState({
    requirements: [],
    strength: 'weak',
    isValid: false
  });

  useEffect(() => {
    if (password) {
      const result = checkPasswordStrength(password);
      setValidation(result);
    } else {
      setValidation({
        requirements: [],
        strength: 'weak',
        isValid: false
      });
    }
  }, [password]);

  return validation;
};