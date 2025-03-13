import React from 'react';
import { AiLessonConverter } from '../components/AiLessonConverter';
import styles from '../styles/Lesson.module.css';

function LessonPage() {
  return (
    <div className={styles.lessonContainer}>
      <h2>Lesson Converter</h2>
      <AiLessonConverter />
    </div>
  );
}

export default LessonPage;
