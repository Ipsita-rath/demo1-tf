'use client';

import { useEffect } from 'react';
import TerraformBuilder from './terraform-builder/page';
import securityManager from '@/utils/security';

export default function HomePage() {
  useEffect(() => {
    // Initialize security measures
    securityManager.initialize();
  }, []);

  return <TerraformBuilder />;
}