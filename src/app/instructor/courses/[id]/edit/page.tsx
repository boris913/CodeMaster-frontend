'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function InstructorCourseEditPage() {
  const { id } = useParams();

  useEffect(() => {
    // Rediriger vers la route existante
    window.location.href = `/courses/by-id/${id}/edit`;
  }, [id]);

  return null;
}