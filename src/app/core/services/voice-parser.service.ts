import { Injectable } from '@angular/core';
import { DynamicColumn } from '../models/dynamic-column.model';

interface KeywordMatch {
  columnKey: string;
  index: number;
  keywordEnd: number;
}

const BUILTIN_ALIASES: Record<string, string[]> = {
  name: ['नाम', 'name'],
  class: ['क्लास', 'कक्षा', 'clas', 'standard', 'इयत्ता', 'वर्ग', 'class'],
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
    'phone number',
    'mobile',
    'phone',
    'contact',
  ],
  address: ['पता', 'addr', 'address', 'adress', 'ऐड्रेस', 'एड्रेस'],
  admissionNo: [
    'admission number',
    'admission no',
    'admission',
    'प्रवेश संख्या',
    'प्रवेश नंबर',
  ],
  parentName: [
    'parent name',
    'parents name',
    'parent',
    'parents',
    'guardian name',
    'guardian',
    'father name',
    'mother name',
    'अभिभावक',
    'पिता',
    'माता',
  ],
  parentMobile: [
    'parent mobile number',
    'parents mobile number',
    'parent mobile',
    'parents mobile',
    'guardian mobile',
    'guardian mobile number',
  ],
  academicYear: ['academic year', 'session', 'शैक्षणिक वर्ष', 'academic session'],
  section: ['section', 'sec', 'अनुभाग'],
  status: ['student status', 'status'],
  feeStatus: ['fee status', 'fee'],
};

const FIELD_STOP_WORDS =
  /\b(name|class|roll\s*number|roll\s*no|mobile\s*number|mobile|phone|address|admission\s*number|admission\s*no|admission|parent\s*name|parents?\s*name|parent|parents|parent\s*mobile|parents?\s*mobile|guardian|section|academic\s*year|session|status|fee\s*status|fee|नाम|क्लास|रोल|मोबाइल|पता|अनुभाग)\b/i;

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
  'number',
];

const NAME_MARKERS = ['name', 'नाम'];

@Injectable({
  providedIn: 'root',
})
export class VoiceParserService {
  parse(text: string, columns: DynamicColumn[]): Record<string, string> {
    const expandedColumns = this.withBuiltinAliases(columns);
    const normalizedText = this.normalizeSpeechText(text, expandedColumns);

    if (!normalizedText || expandedColumns.length === 0) {
      return {};
    }

    const sortedColumns = [...expandedColumns].sort((a, b) => a.sortOrder - b.sortOrder);
    const lowerText = normalizedText.toLowerCase();
    const matches = this.findKeywordMatches(lowerText, sortedColumns);
    const result: Record<string, string> = {};
    const leadingColumn = sortedColumns.find((column) => column.isLeadingField);

    if (leadingColumn && matches.length > 0) {
      const leadingValue = this.cleanFieldValue(
        leadingColumn.columnKey,
        this.extractLeadingValue(normalizedText, lowerText, leadingColumn, matches[0].index)
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
      const valueEnd = i + 1 < matches.length ? matches[i + 1].index : normalizedText.length;
      const value = normalizedText.substring(match.keywordEnd, valueEnd).trim();

      if (value) {
        result[match.columnKey] = this.cleanFieldValue(match.columnKey, value);
      }
    }

    return result;
  }

  parseFieldValue(text: string, column: DynamicColumn): string {
    const normalizedText = this.normalizeSpeechText(text, [column]);
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
      cleaned = cleaned.replace(new RegExp(`\\b${this.escapeRegex(phrase)}\\b`, 'gi'), ' ');
    }

    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    cleaned = this.stripAtNextFieldKeyword(cleaned);

    if (columnKey === 'name') {
      cleaned = this.cleanNameValue(cleaned);
    }

    if (columnKey === 'mobile' || columnKey === 'parentMobile') {
      cleaned = this.cleanMobileValue(cleaned);
    }

    if (columnKey === 'address') {
      cleaned = cleaned
        .split(/\b(address|adress|ऐड्रेस|एड्रेस|पता)\b/i)[0]
        .replace(/\s+/g, ' ')
        .trim();
      cleaned = this.stripAtNextFieldKeyword(cleaned);
    }

    if (columnKey === 'rollNo') {
      cleaned = cleaned.replace(/\D/g, '').trim();
    }

    if (columnKey === 'admissionNo') {
      cleaned = cleaned
        .replace(/\b(admission\s*number|admission\s*no|admission)\b/gi, ' ')
        .trim();
      const digits = cleaned.match(/[A-Za-z0-9-]+/);
      cleaned = digits ? digits[0] : cleaned.split(/\s+/)[0] ?? '';
    }

    if (columnKey === 'parentName') {
      cleaned = cleaned
        .replace(/\b(parent\s*name|parents?\s*name|parent|parents|guardian)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      cleaned = this.stripAtNextFieldKeyword(cleaned);
    }

    if (columnKey === 'section') {
      cleaned = cleaned.replace(/\b(section|sec|अनुभाग)\b/gi, ' ').trim();
      cleaned = cleaned.split(/\s+/)[0] ?? cleaned;
    }

    if (columnKey === 'academicYear') {
      cleaned = cleaned
        .replace(/\b(academic\s*year|session|शैक्षणिक\s*वर्ष)\b/gi, ' ')
        .trim();
    }

    return this.dedupeRepeatedWords(cleaned);
  }

  private stripAtNextFieldKeyword(value: string): string {
    const match = value.match(FIELD_STOP_WORDS);
    if (!match || match.index == null || match.index === 0) {
      return value.trim();
    }
    return value.substring(0, match.index).trim();
  }

  private cleanNameValue(value: string): string {
    let cleaned = value.replace(/\b(name|नाम)\b/gi, ' ').replace(/\s+/g, ' ').trim();

    const parts = cleaned.split(/\b(?:again|repeat|retipe)\b/i);
    if (parts.length > 1) {
      cleaned = parts[parts.length - 1].trim();
    }

    return this.stripAtNextFieldKeyword(cleaned);
  }

  private cleanMobileValue(value: string): string {
    let cleaned = value
      .split(/\b(address|adress|ऐड्रेस|एड्रेस|पता|parent|section|admission)\b/i)[0]
      .replace(
        /\b(mobile\s*number|mobile|phone\s*number|phone|number|मोबाइल\s*नंबर|मोबाइल|फोन)\b/gi,
        ' '
      )
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

  private normalizeSpeechText(text: string, columns: DynamicColumn[]): string {
    let normalized = text
      .replace(/\s+/g, ' ')
      .replace(/([0-9\u0966-\u096F])([A-Za-z\u0900-\u097F])/g, '$1 $2')
      .replace(/([A-Za-z\u0900-\u097F])([0-9\u0966-\u096F])/g, '$1 $2')
      .replace(/\brole\s+number\b/gi, 'roll number')
      .replace(/\brol\s+number\b/gi, 'roll number')
      .replace(/\brollnumber\b/gi, 'roll number')
      .replace(/\broll\s+no\.?\b/gi, 'roll number')
      .replace(/\bstd\b/gi, 'class')
      .replace(/\bstd\.\b/gi, 'class')
      .replace(/\badress\b/gi, 'address')
      .replace(/\bऐड्रेस\b/g, 'address')
      .replace(/\bएड्रेस\b/g, 'address')
      .replace(/\bparents?\s+mobile\s+number\b/gi, 'parent mobile number')
      .replace(/\bparents?\s+name\b/gi, 'parent name')
      .replace(/\badmission\s+number\b/gi, 'admission number')
      .trim();

    normalized = this.insertKeywordBoundaries(normalized, columns);

    return normalized
      .replace(/([\u0900-\u097F])(class|roll|mobile|address|name|parent|section|admission)/gi, '$1 $2')
      .replace(/(क्लास|कक्षा|रोल|मोबाइल|ऐड्रेस|एड्रेस|पता|नाम|नंबर|अनुभाग|प्रवेश)/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Inserts spaces when speech runs words together, e.g. "KishoreClassMCA". */
  private insertKeywordBoundaries(text: string, columns: DynamicColumn[]): string {
    const keywords = new Set<string>();
    for (const column of this.withBuiltinAliases(columns)) {
      for (const keyword of column.speechKeywords) {
        if (keyword.trim().length >= 3) {
          keywords.add(keyword.toLowerCase().trim());
        }
      }
    }

    const sorted = [...keywords].sort((a, b) => b.length - a.length);
    let result = ` ${text} `;

    for (const keyword of sorted) {
      const pattern = new RegExp(
        `([A-Za-z\u0900-\u097F0-9])(${this.escapeRegex(keyword)})`,
        'gi'
      );
      result = result.replace(pattern, '$1 $2');

      const patternAfter = new RegExp(
        `(${this.escapeRegex(keyword)})([A-Za-z\u0900-\u097F0-9])`,
        'gi'
      );
      result = result.replace(patternAfter, '$1 $2');
    }

    return result.replace(/\s+/g, ' ').trim();
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
      const keywords = [...column.speechKeywords].sort((a, b) => b.length - a.length);

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

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
