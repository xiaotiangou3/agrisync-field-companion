import { useState } from 'react';
import FarmProfileSetup, { type FarmProfile } from '@/components/FarmProfileSetup';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleSave = (profile: FarmProfile) => {
    localStorage.setItem('agrisync_farm_profile', JSON.stringify(profile));
    setTimeout(() => navigate('/'), 100);
  };

  return <FarmProfileSetup onProfileSave={handleSave} />;
}
