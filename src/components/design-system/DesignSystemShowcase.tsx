import React, { useState } from 'react';
import { DesignSystemHeader, DesignSystemSection } from './DesignSystemHeader';
import { BrandOverview } from './BrandOverview';
import { ColorPaletteSpec } from './ColorPaletteSpec';
import { TypographySpec } from './TypographySpec';
import { SpacingRadiusSpec } from './SpacingRadiusSpec';
import { ComponentLibraryShowcase } from './ComponentLibraryShowcase';
import { AIComponentsShowcase } from './AIComponentsShowcase';
import { AccessibilitySpec } from './AccessibilitySpec';
import { DevTokensExport } from './DevTokensExport';

interface DesignSystemShowcaseProps {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export const DesignSystemShowcase: React.FC<DesignSystemShowcaseProps> = ({
  isDarkMode,
  setIsDarkMode
}) => {
  const [activeSection, setActiveSection] = useState<DesignSystemSection>('overview');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Design System Header & Section Bar */}
      <DesignSystemHeader
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Section Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'overview' && <BrandOverview />}
        {activeSection === 'colors' && <ColorPaletteSpec />}
        {activeSection === 'typography' && <TypographySpec />}
        {activeSection === 'spacing_radius' && <SpacingRadiusSpec />}
        {activeSection === 'components' && <ComponentLibraryShowcase />}
        {activeSection === 'ai_components' && <AIComponentsShowcase />}
        {activeSection === 'accessibility' && <AccessibilitySpec />}
        {activeSection === 'dev_export' && <DevTokensExport />}
      </div>

    </div>
  );
};
