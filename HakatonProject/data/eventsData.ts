import { EcoEvent, Language } from '../types';

export const staticEvents: Record<Language, EcoEvent[]> = {
  en: [
    {
      id: 'evt-001',
      title: 'Caspian Coast Cleanup',
      date: '2024-05-15',
      location: 'Bilgah Beach, Baku',
      description: 'Join us for a massive beach cleanup to protect the Caspian seal habitat. Gloves and bags provided.',
      type: 'cleanup'
    },
    {
      id: 'evt-002',
      title: 'Zero Waste Workshop',
      date: '2024-05-18',
      location: 'Icherisheher, Baku',
      description: 'Learn how to reduce your daily plastic footprint and make your own eco-friendly household products.',
      type: 'workshop'
    },
    {
      id: 'evt-003',
      title: 'Sumqayit Green Market',
      date: '2024-05-20',
      location: 'Samed Vurgun Park, Sumqayit',
      description: 'A local market featuring organic produce, upcycled crafts, and plastic-free goods.',
      type: 'market'
    },
    {
      id: 'evt-004',
      title: 'Ganja Tree Planting Drive',
      date: '2024-05-22',
      location: 'Heydar Aliyev Park, Ganja',
      description: 'Help us plant 500 new trees to increase the city\'s green cover. Families welcome!',
      type: 'cleanup'
    },
    {
      id: 'evt-005',
      title: 'E-Waste Recycling Seminar',
      date: '2024-05-25',
      location: 'ADA University, Baku',
      description: 'Expert talk on the importance of proper electronics disposal and where to do it in Azerbaijan.',
      type: 'seminar'
    },
    {
      id: 'evt-006',
      title: 'Kids Eco-Art Festival',
      date: '2024-05-28',
      location: 'Deniz Mall, Baku',
      description: 'Fun activities for children using recycled materials to create art. Educational and creative!',
      type: 'workshop'
    },
    {
      id: 'evt-007',
      title: 'Lankaran Forest Cleanup',
      date: '2024-06-01',
      location: 'Hirkan National Park, Lankaran',
      description: 'A volunteer day to remove litter from the hiking trails of our beautiful national park.',
      type: 'cleanup'
    },
    {
      id: 'evt-008',
      title: 'Sustainable Fashion Swap',
      date: '2024-06-05',
      location: 'Port Baku Mall, Baku',
      description: 'Bring clothes you no longer wear and swap them for something new to you. Refresh your wardrobe sustainably.',
      type: 'market'
    },
    {
      id: 'evt-009',
      title: 'Quba Apple Orchard Volun-tour',
      date: '2024-06-10',
      location: 'Quba Region',
      description: 'Spend a day helping local farmers with sustainable harvesting techniques.',
      type: 'workshop'
    },
    {
      id: 'evt-010',
      title: 'Plastic-Free July Kickoff',
      date: '2024-07-01',
      location: 'Baku Boulevard',
      description: 'A community gathering to pledge against single-use plastics for the month of July.',
      type: 'seminar'
    }
  ],
  az: [
    {
      id: 'evt-001',
      title: 'Xəzər Sahili Təmizliyi',
      date: '2024-05-15',
      location: 'Bilgəh Çimərliyi, Bakı',
      description: 'Xəzər suitilərinin yaşayış mühitini qorumaq üçün böyük çimərlik təmizliyinə qoşulun. Əlcək və torbalar verilir.',
      type: 'cleanup'
    },
    {
      id: 'evt-002',
      title: 'Sıfır Tullantı Seminarı',
      date: '2024-05-18',
      location: 'İçərişəhər, Bakı',
      description: 'Gündəlik plastik istifadəsini azaltmağı və öz ekoloji təmiz məişət məhsullarınızı hazırlamağı öyrənin.',
      type: 'workshop'
    },
    {
      id: 'evt-003',
      title: 'Sumqayıt Yaşıl Bazarı',
      date: '2024-05-20',
      location: 'Səməd Vurğun Parkı, Sumqayıt',
      description: 'Orqanik məhsullar, təkrar emal olunmuş əl işləri və plastiksiz malların satıldığı yerli bazar.',
      type: 'market'
    },
    {
      id: 'evt-004',
      title: 'Gəncə Ağacəkmə Aksiyası',
      date: '2024-05-22',
      location: 'Heydər Əliyev Parkı, Gəncə',
      description: 'Şəhərin yaşıllığını artırmaq üçün 500 yeni ağac əkməyə kömək edin. Ailələr dəvətlidir!',
      type: 'cleanup'
    },
    {
      id: 'evt-005',
      title: 'E-Tullantı Təkrar Emalı Seminarı',
      date: '2024-05-25',
      location: 'ADA Universiteti, Bakı',
      description: 'Elektronikanın düzgün atılmasının vacibliyi və bunu Azərbaycanda harada edə biləcəyiniz barədə ekspert söhbəti.',
      type: 'seminar'
    },
    {
      id: 'evt-006',
      title: 'Uşaq Eko-İncəsənət Festivalı',
      date: '2024-05-28',
      location: 'Dəniz Mall, Bakı',
      description: 'Uşaqlar üçün təkrar emal materiallarından istifadə edərək incəsənət nümunələri yaratmaq üçün əyləncəli fəaliyyətlər.',
      type: 'workshop'
    },
    {
      id: 'evt-007',
      title: 'Lənkəran Meşə Təmizliyi',
      date: '2024-06-01',
      location: 'Hirkan Milli Parkı, Lənkəran',
      description: 'Gözəl milli parkımızın gəzinti yollarını zibildən təmizləmək üçün könüllülük günü.',
      type: 'cleanup'
    },
    {
      id: 'evt-008',
      title: 'Davamlı Dəb Mübadiləsi',
      date: '2024-06-05',
      location: 'Port Baku Mall, Bakı',
      description: 'Artıq geyinmədiyiniz paltarları gətirin və yeniləri ilə dəyişin. Qarderobunuzu davamlı şəkildə yeniləyin.',
      type: 'market'
    },
    {
      id: 'evt-009',
      title: 'Quba Alma Bağı Könüllü Turu',
      date: '2024-06-10',
      location: 'Quba Rayonu',
      description: 'Yerli fermerlərə davamlı məhsul yığımı üsulları ilə kömək edərək bir gün keçirin.',
      type: 'workshop'
    },
    {
      id: 'evt-010',
      title: 'Plastiksiz İyul Başlanğıcı',
      date: '2024-07-01',
      location: 'Bakı Bulvarı',
      description: 'İyul ayı ərzində birdəfəlik plastikdən imtina etmək üçün icma toplantısı.',
      type: 'seminar'
    }
  ],
  ru: [
    {
      id: 'evt-001',
      title: 'Уборка Каспийского Побережья',
      date: '2024-05-15',
      location: 'Пляж Бильгя, Баку',
      description: 'Присоединяйтесь к масштабной уборке пляжа для защиты среды обитания каспийских тюленей.',
      type: 'cleanup'
    },
    {
      id: 'evt-002',
      title: 'Мастер-класс Ноль Отходов',
      date: '2024-05-18',
      location: 'Ичеришехер, Баку',
      description: 'Узнайте, как сократить использование пластика и создать свои экологически чистые товары для дома.',
      type: 'workshop'
    },
    {
      id: 'evt-003',
      title: 'Зеленый Рынок Сумгайыт',
      date: '2024-05-20',
      location: 'Парк Самеда Вургуна, Сумгайыт',
      description: 'Местный рынок с органическими продуктами, поделками из вторсырья и товарами без пластика.',
      type: 'market'
    },
    {
      id: 'evt-004',
      title: 'Посадка Деревьев в Гяндже',
      date: '2024-05-22',
      location: 'Парк Гейдара Алиева, Гянджа',
      description: 'Помогите нам посадить 500 новых деревьев. Приглашаем семьи!',
      type: 'cleanup'
    },
    {
      id: 'evt-005',
      title: 'Семинар по Утилизации Электроники',
      date: '2024-05-25',
      location: 'Университет ADA, Баку',
      description: 'Лекция эксперта о важности правильной утилизации электроники в Азербайджане.',
      type: 'seminar'
    },
    {
      id: 'evt-006',
      title: 'Детский Эко-Арт Фестиваль',
      date: '2024-05-28',
      location: 'Deniz Mall, Баку',
      description: 'Веселые занятия для детей по созданию искусства из переработанных материалов.',
      type: 'workshop'
    },
    {
      id: 'evt-007',
      title: 'Уборка Леса в Ленкорани',
      date: '2024-06-01',
      location: 'Национальный Парк Гиркан',
      description: 'Волонтерский день по уборке мусора с туристических троп нашего прекрасного парка.',
      type: 'cleanup'
    },
    {
      id: 'evt-008',
      title: 'Обмен Модной Одеждой',
      date: '2024-06-05',
      location: 'Port Baku Mall, Баку',
      description: 'Принесите одежду, которую больше не носите, и обменяйте её. Обновите гардероб экологично.',
      type: 'market'
    },
    {
      id: 'evt-009',
      title: 'Волонтерский Тур в Сады Губы',
      date: '2024-06-10',
      location: 'Губинский Район',
      description: 'Проведите день, помогая местным фермерам с устойчивыми методами сбора урожая.',
      type: 'workshop'
    },
    {
      id: 'evt-010',
      title: 'Старт "Июль Без Пластика"',
      date: '2024-07-01',
      location: 'Бакинский Бульвар',
      description: 'Встреча сообщества для отказа от одноразового пластика в течение июля.',
      type: 'seminar'
    }
  ]
};