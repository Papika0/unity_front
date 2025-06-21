export interface TranslationKeys {
  // Header
  'header.home': string;
  'header.about': string;
  'header.projects': string;
  'header.gallery': string;
  'header.contact': string;
  'header.language': string;
  
  // Hero Section
  'hero.title': string;
  'hero.subtitle': string;
  'hero.cta': string;
  
  // About Section
  'about.title': string;
  'about.description': string;
  
  // Projects Section
  'projects.title': string;
  'projects.viewAll': string;
  'projects.details': string;
  
  // Footer
  'footer.company': string;
  'footer.address': string;
  'footer.phone': string;
  'footer.email': string;
  'footer.social': string;
  'footer.rights': string;
  
  // Contact
  'contact.title': string;
  'contact.name': string;
  'contact.email': string;
  'contact.message': string;
  'contact.send': string;
  
  // Gallery
  'gallery.title': string;
  'gallery.filter': string;
}

// Mock translations - in the future this will come from backend
const translations: TranslationKeys = {
  'header.home': 'მთავარი',
  'header.about': 'ჩვენს შესახებ',
  'header.projects': 'პროექტები',
  'header.gallery': 'გალერეა',
  'header.contact': 'კონტაქტი',
  'header.language': 'EN',
  
  'hero.title': 'თანამედროვე არქიტექტურა',
  'hero.subtitle': 'ვქმნით სივრცეებს, რომლებიც ახდენენ გავლენას',
  'hero.cta': 'იხილეთ პროექტები',
  
  'about.title': 'ჩვენს შესახებ',
  'about.description': 'ჩვენ ვართ არქიტექტორების პროფესიონალი გუნდი',
  
  'projects.title': 'ჩვენი პროექტები',
  'projects.viewAll': 'ყველას ნახვა',
  'projects.details': 'დეტალები',
  
  'footer.company': 'კომპანია',
  'footer.address': 'მისამართი',
  'footer.phone': 'ტელეფონი',
  'footer.email': 'ელ. ფოსტა',
  'footer.social': 'სოც. ქსელები',
  'footer.rights': 'ყველა უფლება დაცულია',
  
  'contact.title': 'კონტაქტი',
  'contact.name': 'სახელი',
  'contact.email': 'ელ. ფოსტა',
  'contact.message': 'შეტყობინება',
  'contact.send': 'გაგზავნა',
  
  'gallery.title': 'გალერეა',
  'gallery.filter': 'ფილტრი',
};

export function useTranslations() {
  const t = (key: keyof TranslationKeys): string => {
    return translations[key] || key;
  };

  return { t };
}
