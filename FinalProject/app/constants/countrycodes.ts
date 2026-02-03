export interface CountryCode {
    code: string;
    flag: string;
    name: string;
  }
  
  export const countries: CountryCode[] = [
    { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
    { code: '+1', flag: '🇺🇸', name: 'USA' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+90', flag: '🇹🇷', name: 'Turkey' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
  ];
  
  export const formatLocalNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, ''); 
    let formatted = '';
    
    if (cleaned.length > 0) formatted += cleaned.substring(0, 2);
    if (cleaned.length > 2) formatted += ' ' + cleaned.substring(2, 5);
    if (cleaned.length > 5) formatted += ' ' + cleaned.substring(5, 7);
    if (cleaned.length > 7) formatted += ' ' + cleaned.substring(7, 9);
    
    return formatted.trim();
  };