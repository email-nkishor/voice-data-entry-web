import { Injectable } from '@angular/core';
import { DynamicColumn } from '../models/dynamic-column.model';

interface KeywordMatch {
  columnKey: string;
  index: number;
  keywordEnd: number;
}

const BUILTIN_ALIASES: Record<string, string[]> = {
  name: ['नाम', 'name'],
  class: ['क्लास', 'कक्षा', 'clas', 'standard', 'इयत्ता', 'वर्ग', 'एमसीए', 'mca'],
  rollNo: [
    'रोल नंबर',
    'रोल',
    'role number',
    'rol number',
    'rollnumber',
    'roll no',
    'roll number',
  ],
  mobile: [
    'मोबाइल नंबर',
    'मोबाइल',
    'फोन',
    'mobile number',
    'mobile',
    'phone number',
    'contact',
  ],
  address: ['पता', 'addr', 'address', 'adress', 'ऐड्रेस', 'एड्रेस'],
};

const FILLER_PHRASES = [
  'bola hun',
  'bol raha hun',
  'boli hun',
  'i said',
  'i have said',
  'maine kaha',
  'मैंने कहा',
  'retipe again',
  'repeat again',
  'repeat',
  'again name',
  'again',
];

const NAME_MARKERS = ['name', 'नाम'];

@Injectable({
  providedIn: 'root',
})
export class VoiceParserService {
  parse(text: string, columns: DynamicColumn[]): Record<string, string> {
    const normalizedText = this.normalizeSpeechText(text);
    const expandedColumns = this.withBuiltinAliases(columns);

    if (!normalizedText || expandedColumns.length === 0) {
      return {};
    }

    const sortedColumns = [...expandedColumns].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    const lowerText = normalizedText.toLowerCase();
    const matches = this.findKeywordMatches(lowerText, sortedColumns);
    const result: Record<string, string> = {};
    const leadingColumn = sortedColumns.find((column) => column.isLeadingField);

    if (leadingColumn && matches.length > 0) {
      const leadingValue = this.cleanFieldValue(
        leadingColumn.columnKey,
        this.extractLeadingValue(
          normalizedText,
          lowerText,
          leadingColumn,
          matches[0].index
        )
      );

      if (leadingValue) {
        result[leadingColumn.columnKey] = leadingValue;
      }
    } else if (leadingColumn && matches.length === 0) {
      result[leadingColumn.columnKey] = this.cleanFieldValue(
        leadingColumn.columnKey,
        normalizedText
      );
    }

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const valueEnd =
        i + 1 < matches.length ? matches[i + 1].index : normalizedText.length;
      const value = normalizedText
        .substring(match.keywordEnd, valueEnd)
        .trim();

      if (value) {
        result[match.columnKey] = this.cleanFieldValue(match.columnKey, value);
      }
    }

    return result;
  }

  parseFieldValue(text: string, column: DynamicColumn): string {
    const normalizedText = this.normalizeSpeechText(text);
    if (!normalizedText) {
      return '';
    }

    const parsed = this.parse(normalizedText, [column]);
    if (parsed[column.columnKey]) {
      return parsed[column.columnKey];
    }

    return this.cleanFieldValue(column.columnKey, normalizedText);
  }

  private cleanFieldValue(columnKey: string, value: string): string {
    let cleaned = value;

    for (const phrase of FILLER_PHRASES) {
      cleaned = cleaned.replace(new RegExp(`\\b${phrase}\\b`, 'gi'), ' ');
    }

    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    if (columnKey === 'name') {
      cleaned = this.cleanNameValue(cleaned);
    }

    if (columnKey === 'mobile') {
      cleaned = this.cleanMobileValue(cleaned);
    }

    if (columnKey === 'address') {
      cleaned = cleaned
        .split(/\b(address|adress|ऐड्रेस|एड्रेस|पता)\b/i)[0]
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (columnKey === 'rollNo') {
      cleaned = cleaned.replace(/\D/g, '').trim();
    }

    return this.dedupeRepeatedWords(cleaned);
  }

  private cleanNameValue(value: string): string {
    let cleaned = value.replace(/\b(name|नाम)\b/gi, ' ').replace(/\s+/g, ' ').trim();

    const parts = cleaned.split(/\b(?:again|repeat|retipe)\b/i);
    if (parts.length > 1) {
      cleaned = parts[parts.length - 1].trim();
    }

    return cleaned;
  }

  private cleanMobileValue(value: string): string {
    let cleaned = value
      .split(/\b(address|adress|ऐड्रेस|एड्रेस|पता)\b/i)[0]
      .replace(/\b(mobile\s*number|mobile|phone\s*number|number|मोबाइल\s*नंबर|मोबाइल|फोन)\b/gi, ' ')
      .trim();

    const digits = cleaned.replace(/\D/g, '');
    return digits || cleaned;
  }

  private dedupeRepeatedWords(value: string): string {
    const words = value.split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      return value.trim();
    }

    const half = Math.floor(words.length / 2);
    const firstHalf = words.slice(0, half).join(' ').toLowerCase();
    const secondHalf = words.slice(half).join(' ').toLowerCase();

    if (firstHalf === secondHalf) {
      return words.slice(0, half).join(' ');
    }

    return value.trim();
  }

  private normalizeSpeechText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/([0-9\u0966-\u096F])([A-Za-z\u0900-\u097F])/g, '$1 $2')
      .replace(/([A-Za-z\u0900-\u097F])([0-9\u0966-\u096F])/g, '$1 $2')
      .replace(/([\u0900-\u097F])(class|roll|mobile|address|name)/gi, '$1 $2')
      .replace(/(क्लास|कक्षा|रोल|मोबाइल|ऐड्रेस|एड्रेस|पता|नाम|नंबर)/g, ' $1 ')
      .replace(/\brole\s+number\b/gi, 'roll number')
      .replace(/\brol\s+number\b/gi, 'roll number')
      .replace(/\brollnumber\b/gi, 'roll number')
      .replace(/\broll\s+no\.?\b/gi, 'roll number')
      .replace(/\bstd\b/gi, 'class')
      .replace(/\bstd\.\b/gi, 'class')
      .replace(/\badress\b/gi, 'address')
      .replace(/\bऐड्रेस\b/g, 'address')
      .replace(/\bएड्रेस\b/g, 'address')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private withBuiltinAliases(columns: DynamicColumn[]): DynamicColumn[] {
    return columns.map((column) => ({
      ...column,
      speechKeywords: [
        ...new Set([
          ...column.speechKeywords,
          ...(BUILTIN_ALIASES[column.columnKey] ?? []),
        ]),
      ],
    }));
  }

  private findKeywordMatches(
    lowerText: string,
    columns: DynamicColumn[]
  ): KeywordMatch[] {
    const matches: KeywordMatch[] = [];

    for (const column of columns) {
      if (column.isLeadingField) {
        continue;
      }

      let bestMatch: KeywordMatch | null = null;
      const keywords = [...column.speechKeywords].sort(
        (a, b) => b.length - a.length
      );

      for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase().trim();
        if (!normalizedKeyword) {
          continue;
        }

        const index = lowerText.indexOf(normalizedKeyword);
        const keywordLength = normalizedKeyword.length;

        if (index >= 0) {
          const shouldReplace =
            !bestMatch ||
            index < bestMatch.index ||
            (index === bestMatch.index &&
              keywordLength > bestMatch.keywordEnd - bestMatch.index);

          if (shouldReplace) {
            bestMatch = {
              columnKey: column.columnKey,
              index,
              keywordEnd: index + keywordLength,
            };
          }
        }
      }

      if (bestMatch) {
        matches.push(bestMatch);
      }
    }

    matches.sort((a, b) => a.index - b.index);

    const seen = new Set<string>();
    return matches.filter((match) => {
      if (seen.has(match.columnKey)) {
        return false;
      }
      seen.add(match.columnKey);
      return true;
    });
  }

  private extractLeadingValue(
    text: string,
    lowerText: string,
    column: DynamicColumn,
    firstKeywordIndex: number
  ): string {
    let startIndex = 0;

    for (const marker of NAME_MARKERS) {
      let searchFrom = 0;
      while (searchFrom < firstKeywordIndex) {
        const index = lowerText.indexOf(marker, searchFrom);
        if (index < 0 || index >= firstKeywordIndex) {
          break;
        }
        startIndex = Math.max(startIndex, index + marker.length);
        searchFrom = index + marker.length;
      }
    }

    if (startIndex > 0) {
      return text.substring(startIndex, firstKeywordIndex).trim();
    }

    for (const keyword of column.speechKeywords) {
      const normalizedKeyword = keyword.toLowerCase().trim();
      if (!normalizedKeyword || !lowerText.startsWith(normalizedKeyword)) {
        continue;
      }

      return text.substring(normalizedKeyword.length, firstKeywordIndex).trim();
    }

    return text.substring(0, firstKeywordIndex).trim();
  }
}
