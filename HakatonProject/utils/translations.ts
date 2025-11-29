import { Language } from '../types';

export const translations = {
  en: {
    nav: {
      home: "Home",
      map: "Recycle Map",
      events: "Eco Events",
      about: "About",
      profile: "My Events"
    },
    hero: {
      badge: "AI-Powered Environmental Platform",
      title_start: "Turn Awareness Into",
      title_end: "Action",
      subtitle: "Easily find nearby recycling points, join local clean-up events, and discover how you can make a real difference in your city today.",
      btn_find: "Find Recycling Points",
      btn_events: "Browse Events"
    },
    features: {
      locator_title: "Interactive Locator",
      locator_desc: "Locate specialized recycling bins for batteries, electronics, glass, and more using our map search.",
      events_title: "Community Events",
      events_desc: "Connect with local volunteers. Join beach clean-ups, tree planting drives, and sustainability workshops.",
      advice_title: "Smart Advice",
      advice_desc: "Not sure how to recycle an item? Find verified locations that accept specific materials."
    },
    stats: {
      live_data: "Live Data Analysis",
      title: "Community Pulse",
      desc_start: "We analyzed responses from",
      desc_participants: "participants",
      desc_cities: "cities to understand real recycling habits and barriers.",
      top_barrier: "Top Challenge",
      barrier_label: "Primary obstacle to recycling",
      votes: "votes",
      eco_leader: "Eco Leader",
      sorting_rate: "Highest Sorting Rate",
      residents_sort: "residents sort waste",
      habits: "Habits",
      plastic_freq: "Plastic Usage Frequency",
      plastic_always: "Uses Plastic 'Always'",
      plastic_sometimes: "Uses Plastic 'Sometimes'",
      gen_z: "Gen Z",
      youth_concern: "of youth (under 25)",
      youth_desc: "are highly concerned about ecology.",
      gap_title: "Knowledge Gap",
      gap_desc: "While {sortRate}% of people sort their waste, only {awareRate}% actually know where local recycling points are located.",
      gap_btn: "Close the gap with our map",
      stat_sort: "Sort Waste",
      stat_know: "Know Locations"
    },
    finder: {
      title: "Find Recycling Points",
      placeholder: "Search by name or address...",
      btn_search: "Search",
      quick_filters: "Filter by Category:",
      filters: {
        battery: "Batteries",
        glass: "Glass",
        electronics: "Electronics",
        plastic: "Plastic",
        paper: "Paper",
        clothing: "Clothing",
        general: "General Waste"
      },
      reset: "Clear Filters",
      showing: "Showing",
      locations: "locations",
      filter_label: "Filters",
      no_results: "No locations found for these filters.",
      show_all: "Show all locations",
      legend: "Map Legend",
      legend_verified: "Verified Point",
      legend_user: "Your Location"
    },
    events: {
      title: "Community Eco-Events",
      subtitle: "Discover volunteer opportunities, sustainability workshops, and clean-up drives happening across Azerbaijan.",
      search_placeholder: "Search events by city or type...",
      no_events: "No events found matching",
      view_all: "View all events",
      join_btn: "Join Event",
      joined_btn: "Joined",
      leave_btn: "Leave Event"
    },
    profile: {
      title: "My Events",
      subtitle: "Events you are participating in.",
      no_events: "You haven't joined any events yet.",
      browse_btn: "Browse Events"
    },
    about: {
      title: "About EcoRoute",
      lead: "EcoRoute was born from a simple idea: doing the right thing for the planet should be easy, not confusing.",
      p1: "Every day, millions of tons of recyclable materials end up in landfills simply because people don't know where to take them. Batteries, electronics, glass, and textiles often require specific drop-off points that aren't on standard maps.",
      how_works: "How It Works",
      how_works_text: "Our platform uses smart data integration to bridge the gap between intention and action. By interpreting your specific recycling needs, we search our verified database to pinpoint the exact facilities you need.",
      mission: "Our Mission",
      mission_1: "Accessibility: Making environmental resources available to everyone.",
      mission_2: "Community: Connecting like-minded individuals through local events.",
      mission_3: "Education: Providing instant, accurate advice on waste management.",
      quote: "The greatest threat to our planet is the belief that someone else will save it."
    },
    footer: {
      tagline: "Empowering communities to reduce, reuse, and recycle.",
      sub_tagline: "Azerbaijan's leading environmental platform.",
      rights: "All rights reserved."
    },
    data_mappings: {
      barriers: {
        "I don't know where": "I don't know where",
        "There is no time": "There is no time",
        "Not interesting": "Not interesting",
        "I don't believe in the effect": "I don't believe in the effect",
        "Not answered": "Not answered"
      },
      plastic: {
        "Always": "Always",
        "Sometimes": "Sometimes",
        "Never": "Never"
      },
      general: {
        "None": "None"
      }
    }
  },
  az: {
    nav: {
      home: "Ana Səhifə",
      map: "Xəritə",
      events: "Tədbirlər",
      about: "Haqqımızda",
      profile: "Tədbirlərim"
    },
    hero: {
      badge: "Ekoloji Platforma",
      title_start: "Fərqindəliyi",
      title_end: "Fəaliyyətə Çevirin",
      subtitle: "Yaxınlıqdakı təkrar emal məntəqələrini tapın, təmizlik aksiyalarına qoşulun və bu gün şəhərinizdə necə fərq yarada biləcəyinizi kəşf edin.",
      btn_find: "Məntəqələri Tapın",
      btn_events: "Tədbirlərə Baxın"
    },
    features: {
      locator_title: "İnteraktiv Xəritə",
      locator_desc: "Batareyalar, elektronika, şüşə və daha çoxu üçün xüsusi təkrar emal qutularını xəritəmizdən istifadə edərək tapın.",
      events_title: "İcma Tədbirləri",
      events_desc: "Yerli könüllülərlə əlaqə qurun. Çimərlik təmizliyi, ağac əkmə aksiyaları və davamlılıq seminarlarına qoşulun.",
      advice_title: "Ağıllı Məsləhət",
      advice_desc: "Bir əşyanı necə təkrar emal edəcəyinizdən əmin deyilsiniz? Təsdiqlənmiş məntəqələrimiz sizə yol göstərəcək."
    },
    stats: {
      live_data: "Canlı Məlumat Analizi",
      title: "İcma Nəbzi",
      desc_start: "Biz",
      desc_participants: "iştirakçının",
      desc_cities: "şəhərdən cavablarını təhlil edərək real təkrar emal vərdişlərini və maneələri öyrəndik.",
      top_barrier: "Əsas Problem",
      barrier_label: "Təkrar emala əsas maneə",
      votes: "səs",
      eco_leader: "Eko Lider",
      sorting_rate: "Ən Yüksək Çeşidləmə",
      residents_sort: "sakin tullantıları çeşidləyir",
      habits: "Vərdişlər",
      plastic_freq: "Plastik İstifadə Tezliyi",
      plastic_always: "'Həmişə' istifadə edənlər",
      plastic_sometimes: "'Bəzən' istifadə edənlər",
      gen_z: "Gənclər",
      youth_concern: "gənc (25 yaş altı)",
      youth_desc: "ekologiya haqqında yüksək narahatdır.",
      gap_title: "Məlumat Boşluğu",
      gap_desc: "İnsanların {sortRate}%-i tullantıları çeşidləsə də, yalnız {awareRate}%-i təkrar emal məntəqələrinin yerini bilir.",
      gap_btn: "Xəritəmizlə bu boşluğu doldurun",
      stat_sort: "Çeşidləyən",
      stat_know: "Yerini Bilən"
    },
    finder: {
      title: "Təkrar Emal Məntəqələri",
      placeholder: "Ad və ya ünvan üzrə axtar...",
      btn_search: "Axtar",
      quick_filters: "Kateqoriya üzrə süzgəc:",
      filters: {
        battery: "Batareya",
        glass: "Şüşə",
        electronics: "Elektronika",
        plastic: "Plastik",
        paper: "Kağız",
        clothing: "Paltar",
        general: "Ümumi"
      },
      reset: "Təmizlə",
      showing: "Göstərilir",
      locations: "məntəqə",
      filter_label: "Filtrlər",
      no_results: "Bu filtrlər üçün məntəqə tapılmadı.",
      show_all: "Bütün məntəqələri göstər",
      legend: "Xəritə Leqendası",
      legend_verified: "Təsdiqlənmiş Məntəqə",
      legend_user: "Sizin Yeriniz"
    },
    events: {
      title: "Eko-Tədbirlər",
      subtitle: "Azərbaycan üzrə könüllülük imkanlarını, davamlılıq seminarlarını və təmizlik aksiyalarını kəşf edin.",
      search_placeholder: "Şəhər və ya növ üzrə axtar...",
      no_events: "Uyğun gələn tədbir tapılmadı:",
      view_all: "Bütün tədbirlərə bax",
      join_btn: "Qoşul",
      joined_btn: "Qoşuldunuz",
      leave_btn: "Tərk et"
    },
    profile: {
      title: "Tədbirlərim",
      subtitle: "İştirak etdiyiniz tədbirlər.",
      no_events: "Hələ heç bir tədbirə qoşulmamısınız.",
      browse_btn: "Tədbirlərə Baxın"
    },
    about: {
      title: "EcoRoute Haqqında",
      lead: "EcoRoute sadə bir ideyadan yarandı: planet üçün doğru olanı etmək çaşdırıcı deyil, asan olmalıdır.",
      p1: "Hər gün milyonlarla ton təkrar emal edilə bilən material zibilxanalara atılır, çünki insanlar onları hara aparacaqlarını bilmirlər. Batareyalar, elektronika və şüşə tez-tez standart xəritələrdə olmayan xüsusi toplama məntəqələri tələb edir.",
      how_works: "Necə İşləyir",
      how_works_text: "Platformamız niyyət və fəaliyyət arasındakı boşluğu doldurmaq üçün ağıllı məlumat inteqrasiyasından istifadə edir. Sizin xüsusi ehtiyaclarınızı anlayaraq, sizə lazım olan dəqiq obyektləri tapırıq.",
      mission: "Missiyamız",
      mission_1: "Əlçatanlıq: Ekoloji resursları hər kəs üçün əlçatan etmək.",
      mission_2: "İcma: Yerli tədbirlər vasitəsilə həmfikir insanları birləşdirmək.",
      mission_3: "Təhsil: Tullantıların idarə olunması üzrə dəqiq məsləhətlər vermək.",
      quote: "Planetimiz üçün ən böyük təhlükə, onu başqasının xilas edəcəyinə inanmaqdır."
    },
    footer: {
      tagline: "İcmaları azaltmağa, təkrar istifadəyə və təkrar emala təşviq edirik.",
      sub_tagline: "Azərbaycanın aparıcı ekoloji platforması.",
      rights: "Bütün hüquqlar qorunur."
    },
    data_mappings: {
      barriers: {
        "I don't know where": "Harada olduğunu bilmirəm",
        "There is no time": "Vaxt yoxdur",
        "Not interesting": "Maraqlı deyil",
        "I don't believe in the effect": "Effektinə inanmıram",
        "Not answered": "Cavab verilməyib"
      },
      plastic: {
        "Always": "Həmişə",
        "Sometimes": "Bəzən",
        "Never": "Heç vaxt"
      },
      general: {
        "None": "Heç biri"
      }
    }
  },
  ru: {
    nav: {
      home: "Главная",
      map: "Карта",
      events: "События",
      about: "О нас",
      profile: "Мои События"
    },
    hero: {
      badge: "Экологическая Платформа",
      title_start: "Превратите Осознанность в",
      title_end: "Действие",
      subtitle: "Легко находите пункты переработки, присоединяйтесь к субботникам и узнайте, как вы можете изменить свой город к лучшему уже сегодня.",
      btn_find: "Найти Пункты",
      btn_events: "События"
    },
    features: {
      locator_title: "Интерактивная Карта",
      locator_desc: "Находите специальные контейнеры для батареек, электроники, стекла и многого другого с помощью нашей карты.",
      events_title: "События Сообщества",
      events_desc: "Общайтесь с волонтерами. Присоединяйтесь к уборке пляжей, посадке деревьев и семинарам по устойчивому развитию.",
      advice_title: "Умные Советы",
      advice_desc: "Не знаете, как переработать вещь? Мы подскажем проверенные пункты приема."
    },
    stats: {
      live_data: "Анализ Данных",
      title: "Пульс Сообщества",
      desc_start: "Мы проанализировали ответы",
      desc_participants: "участников",
      desc_cities: "городов, чтобы понять реальные привычки и барьеры.",
      top_barrier: "Главный Барьер",
      barrier_label: "Основное препятствие к переработке",
      votes: "голосов",
      eco_leader: "Эко-Лидер",
      sorting_rate: "Уровень Сортировки",
      residents_sort: "жителей сортируют отходы",
      habits: "Привычки",
      plastic_freq: "Использование Пластика",
      plastic_always: "Используют 'Всегда'",
      plastic_sometimes: "Используют 'Иногда'",
      gen_z: "Молодежь",
      youth_concern: "молодых людей (до 25)",
      youth_desc: "сильно обеспокоены экологией.",
      gap_title: "Разрыв Знаний",
      gap_desc: "Хотя {sortRate}% людей сортируют отходы, только {awareRate}% знают, где находятся пункты приема.",
      gap_btn: "Заполните пробел с нашей картой",
      stat_sort: "Сортируют",
      stat_know: "Знают Места"
    },
    finder: {
      title: "Пункты Переработки",
      placeholder: "Поиск по названию или адресу...",
      btn_search: "Поиск",
      quick_filters: "Фильтр по категориям:",
      filters: {
        battery: "Батарейки",
        glass: "Стекло",
        electronics: "Электроника",
        plastic: "Пластик",
        paper: "Бумага",
        clothing: "Одежда",
        general: "Общее"
      },
      reset: "Сброс",
      showing: "Показано",
      locations: "пунктов",
      filter_label: "Фильтры",
      no_results: "По этим фильтрам ничего не найдено.",
      show_all: "Показать все пункты",
      legend: "Легенда Карты",
      legend_verified: "Проверенный Пункт",
      legend_user: "Ваше Местоположение"
    },
    events: {
      title: "Эко-События",
      subtitle: "Откройте для себя возможности волонтерства, семинары и акции по уборке в Азербайджане.",
      search_placeholder: "Поиск по городу или типу...",
      no_events: "Событий не найдено по запросу",
      view_all: "Смотреть все события",
      join_btn: "Участвовать",
      joined_btn: "Вы участвуете",
      leave_btn: "Покинуть"
    },
    profile: {
      title: "Мои События",
      subtitle: "События, в которых вы участвуете.",
      no_events: "Вы еще не присоединились ни к одному событию.",
      browse_btn: "Посмотреть События"
    },
    about: {
      title: "О EcoRoute",
      lead: "EcoRoute родился из простой идеи: поступать правильно для планеты должно быть легко, а не сложно.",
      p1: "Каждый день миллионы тонн перерабатываемых материалов попадают на свалки просто потому, что люди не знают, куда их сдать. Батарейки, электроника и стекло часто требуют специальных пунктов приема.",
      how_works: "Как это работает",
      how_works_text: "Наша платформа использует умную интеграцию данных. Понимая ваши конкретные потребности, мы находим точные объекты в нашей базе данных.",
      mission: "Наша Миссия",
      mission_1: "Доступность: Сделать экологические ресурсы доступными для всех.",
      mission_2: "Сообщество: Объединение единомышленников через местные события.",
      mission_3: "Образование: Предоставление точных советов по управлению отходами.",
      quote: "Самая большая угроза для нашей планеты — это вера в то, что её спасет кто-то другой."
    },
    footer: {
      tagline: "Вдохновляем сообщества сокращать, использовать повторно и перерабатывать.",
      sub_tagline: "Ведущая экологическая платформа Азербайджана.",
      rights: "Все права защищены."
    },
    data_mappings: {
      barriers: {
        "I don't know where": "Я не знаю где",
        "There is no time": "Нет времени",
        "Not interesting": "Не интересно",
        "I don't believe in the effect": "Не верю в эффект",
        "Not answered": "Нет ответа"
      },
      plastic: {
        "Always": "Всегда",
        "Sometimes": "Иногда",
        "Never": "Никогда"
      },
      general: {
        "None": "Нет"
      }
    }
  }
};