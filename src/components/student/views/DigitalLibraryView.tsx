import React from 'react';
import { LearningResourcesCenter } from './LearningResourcesCenter';
import { useStudentClass } from '../../../context/StudentClassContext';

interface DigitalLibraryViewProps {
  studentClassGrade?: string;
  initialSubject?: string;
  initialChapter?: string;
}

export const DigitalLibraryView: React.FC<DigitalLibraryViewProps> = ({
  studentClassGrade,
  initialSubject,
  initialChapter
}) => {
  const { selectedClass } = useStudentClass();

  // Strict: Never default to Class 5. Always use student's actual selected class!
  const effectiveClass = studentClassGrade || selectedClass || 'Class 10';

  return (
    <LearningResourcesCenter 
      initialCategory="ALL" 
      studentClassGrade={effectiveClass}
      initialSubject={initialSubject}
      initialChapter={initialChapter}
    />
  );
};
