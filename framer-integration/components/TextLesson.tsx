import React from 'react';

interface TextLessonProps {
  content?: string;
}

export default function TextLesson({
  content = '# Preview Content\n\nThis is a preview of a text lesson. In production, this will display the actual lesson content with proper formatting.\n\n## Features\n\n- Supports headings\n- Supports paragraphs\n- Supports lists\n\nReplace this with real content by passing the `content` prop.'
}: TextLessonProps) {
  // Simple text rendering - in the future, you can add markdown support
  // For now, we'll respect line breaks and basic formatting

  const formatContent = (text: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = (text || '').split('\n\n');

    return paragraphs.map((paragraph, index) => {
      // Check if it's a heading (starts with #)
      if (paragraph.startsWith('# ')) {
        return (
          <h1 key={index} style={styles.h1}>
            {paragraph.substring(2)}
          </h1>
        );
      }
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} style={styles.h2}>
            {paragraph.substring(3)}
          </h2>
        );
      }
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} style={styles.h3}>
            {paragraph.substring(4)}
          </h3>
        );
      }

      // Check if it's a list item
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        const items = paragraph.split('\n').filter((line) => line.trim());
        return (
          <ul key={index} style={styles.ul}>
            {items.map((item, i) => (
              <li key={i} style={styles.li}>
                {item.substring(2)}
              </li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p key={index} style={styles.paragraph}>
          {paragraph.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < paragraph.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>{formatContent(content)}</div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
  },
  content: {
    backgroundColor: '#1A1A1A',
    padding: '32px',
    borderRadius: '12px',
    border: '1px solid #333333',
  },
  h1: {
    fontSize: '32px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: '0',
    marginBottom: '24px',
    lineHeight: '1.2',
  },
  h2: {
    fontSize: '24px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: '32px',
    marginBottom: '16px',
    lineHeight: '1.3',
  },
  h3: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginTop: '24px',
    marginBottom: '12px',
    lineHeight: '1.4',
  },
  paragraph: {
    fontSize: '16px',
    color: '#CCCCCC',
    lineHeight: '1.8',
    marginBottom: '16px',
    marginTop: '0',
  },
  ul: {
    fontSize: '16px',
    color: '#CCCCCC',
    lineHeight: '1.8',
    marginBottom: '16px',
    marginTop: '0',
    paddingLeft: '24px',
  },
  li: {
    marginBottom: '8px',
  },
};
