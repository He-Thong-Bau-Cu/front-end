import React from 'react';
import moment from 'moment-timezone';
import removeVietnameseTones from './removeVietnameseTones';

export const getTimeAgo = (date: Date) => {
  return moment(date).tz('Asia/Ho_Chi_Minh').fromNow();
}

export const formatDate = (date: Date) => {
  return moment(date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
}

export const formatDateOfBirth = (date: Date) => {
  return moment(date).tz('Asia/Ho_Chi_Minh').format('DD-HH-YYYY');
}

export const formatSecondsToClock = (seconds?: number | null) => {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return "--:--:--";
  }
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((safe % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (safe % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${secs}`;
};

/**
 * Highlight keyword in text with yellow background (case-insensitive and diacritic-insensitive)
 * @param text - The text to search in
 * @param keyword - The keyword to highlight
 * @returns React element with highlighted keyword
 */
export const highlightKeyword = (text: string, keyword?: string): React.ReactNode => {
  if (!keyword || !text) {
    return text;
  }

  // Normalize both text and keyword to find matches without diacritics
  const normalizedText = removeVietnameseTones(text);
  const normalizedKeyword = removeVietnameseTones(keyword);
  const normalizedKeywordLower = normalizedKeyword.toLowerCase();
  const normalizedTextLower = normalizedText.toLowerCase();

  // Find all matches in normalized text
  const matches: Array<{ start: number; end: number }> = [];
  let searchIndex = 0;

  while (searchIndex < normalizedText.length) {
    const index = normalizedTextLower.indexOf(normalizedKeywordLower, searchIndex);
    if (index === -1) break;
    matches.push({ start: index, end: index + normalizedKeyword.length });
    searchIndex = index + 1;
  }

  if (matches.length === 0) {
    return text;
  }

  // Build highlighted parts
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match) => {
    // Add text before match
    if (match.start > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.start)}</span>);
    }

    // Add highlighted match (use original text with diacritics)
    // Note: Since removeVietnameseTones only removes diacritics, the length stays the same
    // So we can safely use the same indices from normalized text on original text
    parts.push(
      <span
        key={`highlight-${match.start}`}
        style={{
          backgroundColor: '#ffeb3b',
          color: '#000',
          fontWeight: 600,
          padding: '2px 4px',
          borderRadius: '3px',
        }}
      >
        {text.substring(match.start, match.end)}
      </span>
    );

    lastIndex = match.end;
  });

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return <>{parts}</>;
};
