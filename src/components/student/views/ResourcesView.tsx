import React from 'react';
import { LearningResourcesCenter } from './LearningResourcesCenter';

interface ResourcesViewProps {
  studentClassGrade?: string;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  studentClassGrade = 'Class 10'
}) => {
  return <LearningResourcesCenter initialCategory="notes" studentClassGrade={studentClassGrade} />;
};
