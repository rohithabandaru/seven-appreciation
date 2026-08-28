import { Member } from '@/types';

export const MEMBERS_DATA: Member[] = [
  {
    id: '1',
    slug: 'heeseung',
    name: 'Lee Hee-seung',
    displayName: 'Heeseung',
    koreanName: '이희승',
    image: '/images/members/heeseung.jpg',
    heroImage: '/images/members/heeseung.jpg',
    quote: 'Expression through music is the purest way to connect hearts across borders.',
    role: 'Main Vocalist, Lead Dancer',
    birthDate: 'October 15, 2001',
    bio: 'Renowned for his captivating vocal range, pitch perfection, and effortless stage presence, Heeseung brings deep passion and artistry to every performance.',
    colorGradient: 'from-amber-500/20 via-rose-500/20 to-purple-600/20',
    accentColor: '#F59E0B',
    journey: [
      {
        year: '2020',
        title: 'Beginning of the Musical Journey',
        description: 'Demonstrated outstanding versatility, vocal control, and leadership skills during debut preparations.'
      },
      {
        year: '2021',
        title: 'Vocal Recognition & Artistry Growth',
        description: 'Praised by producers worldwide for pitch accuracy, acoustic guitar covers, and arrangement skills.'
      },
      {
        year: '2023',
        title: 'World Tour Highlights',
        description: 'Delivered unforgettable solo vocal sections during international arena tours.'
      },
      {
        year: '2025',
        title: 'Continuous Innovation',
        description: 'Actively participating in vocal styling, melody compositions, and sound experimentation.'
      }
    ],
    achievements: [
      {
        id: 'ach-hee-1',
        memberId: 'heeseung',
        memberName: 'Heeseung',
        title: 'Ace Vocal Performance Showcase',
        category: 'Music',
        eventDate: '2023-10-15',
        description: 'Celebrated globally for acoustic song covers showcasing raw vocal tone and emotional delivery.',
        verifiedSourceUrl: 'https://www.youtube.com/results?search_query=ENHYPEN+HEESEUNG+Off+My+Face+Cover'
      },
      {
        id: 'ach-hee-2',
        memberId: 'heeseung',
        memberName: 'Heeseung',
        title: 'Pitch Perfection Distinction',
        category: 'Artistry',
        eventDate: '2022-05-20',
        description: 'Acknowledged by industry vocal coaches for exceptional relative pitch and live vocal stability.',
        verifiedSourceUrl: 'https://www.youtube.com/results?search_query=ENHYPEN+Heeseung+Lee+Mujin+Service'
      }
    ],
    inspirationStories: [
      "Heeseung's dedication to perfecting his vocal technique inspired me to never give up on my music studies.",
      "His humble attitude despite immense talent reminds us to stay grounded while reaching for our dreams."
    ],
    officialLinks: [
      { platform: 'YouTube', url: 'https://www.youtube.com/@ENHYPENOFFICIAL', label: 'Official Covers' },
      { platform: 'Spotify', url: 'https://open.spotify.com/artist/5t5FqBwTcgKTaWmfEbwQY9', label: 'Discography' }
    ],
    photos: [
      {
        id: 'hee-photo-1',
        url: '/images/members/heeseung.jpg',
        caption: 'Heeseung at Music Bank broadcast live appearance.',
        category: 'Stage',
        date: '2022-06-24',
        credit: 'Press Archive'
      },
      {
        id: 'hee-photo-2',
        url: '/images/members/heeseung_2.jpg',
        caption: 'Heeseung official portrait and event appearance.',
        category: 'Studio',
        date: '2024-11-07',
        credit: 'Official Archive'
      },
      {
        id: 'hee-photo-3',
        url: '/images/members/heeseung_3.jpg',
        caption: 'Heeseung at high-fashion beauty showcase event in Seongsu-dong.',
        category: 'Concept',
        date: '2024-09-11',
        credit: 'Fashion Showcase'
      },
      {
        id: 'hee-photo-4',
        url: '/images/members/heeseung_4.jpg',
        caption: 'Heeseung portrait showcasing charismatic visual charm.',
        category: 'Casual',
        date: '2026-04-22',
        credit: 'Event Gallery'
      }
    ]
  },
  {
    id: '2',
    slug: 'jay',
    name: 'Park Jong-seong',
    displayName: 'Jay',
    koreanName: '박종성',
    image: '/images/members/jay.jpg',
    heroImage: '/images/members/jay.jpg',
    quote: 'Passionate commitment is not optional; it is the energy that brings every dream to life.',
    role: 'Main Rapper, Lead Dancer, Vocalist',
    birthDate: 'April 20, 2002',
    bio: 'Known for his fierce passion, electric guitar performances, stylish fashion sense, and genuine care for his team and community.',
    colorGradient: 'from-orange-500/20 via-amber-500/20 to-red-600/20',
    accentColor: '#F97316',
    journey: [
      {
        year: '2020',
        title: 'Unwavering Passion',
        description: 'Stood out for his resilient attitude, clear vision, and intense work ethic.'
      },
      {
        year: '2022',
        title: 'Guitar Performance Debut',
        description: 'Surprised fans globally with live electric guitar collaborations and rock-infused stage solos.'
      },
      {
        year: '2024',
        title: 'Style & Art Collaboration',
        description: 'Recognized by global fashion publications for unique personal style and artistic flair.'
      }
    ],
    achievements: [
      {
        id: 'ach-jay-1',
        memberId: 'jay',
        memberName: 'Jay',
        title: 'Live Guitar Collaboration',
        category: 'Performance',
        eventDate: '2024-05-12',
        description: 'Performed alongside legendary rock artists, earning high praise for stage charisma and guitar skill.',
        verifiedSourceUrl: 'https://www.youtube.com/results?search_query=ENHYPEN+Jay+Guitar+Performance'
      }
    ],
    inspirationStories: [
      "Jay's mindset of 'RAS' (Resentment, Anger, Shame turned into positive fuel) helped me overcome my own self-doubt.",
      "His thoughtful cooking and care for others shows how strength and gentleness go hand in hand."
    ],
    officialLinks: [
      { platform: 'Weverse', url: 'https://weverse.io/enhypen/artist', label: 'Artist Messages' }
    ],
    photos: [
      {
        id: 'jay-photo-1',
        url: '/images/members/jay.jpg',
        caption: 'Jay greeting fans and press with fierce charisma.',
        category: 'Stage',
        date: '2022-06-24',
        credit: 'Press Archive'
      },
      {
        id: 'jay-photo-2',
        url: '/images/members/jay_3.jpg',
        caption: 'Jay commanding the stage with electrifying energy.',
        category: 'Stage',
        date: '2023-05-18',
        credit: 'Concert Archive'
      },
      {
        id: 'jay-photo-3',
        url: '/images/members/jay_concert_1.jpg',
        caption: 'Jay performing live guitar solo at world tour.',
        category: 'Stage',
        date: '2024-03-10',
        credit: 'Tour Gallery'
      }
    ]
  },
  {
    id: '3',
    slug: 'jake',
    name: 'Sim Jae-yun',
    displayName: 'Jake',
    koreanName: '심재윤',
    image: '/images/members/jake.jpg',
    heroImage: '/images/members/jake.jpg',
    quote: 'Growth is a journey of consistency, warmth, and constant learning every single day.',
    role: 'Vocalist, Rapper',
    birthDate: 'November 15, 2002',
    bio: 'Celebrated for his rapid artistic growth, warm soothing tone, bright positivity, and heartfelt connection with supporters around the globe.',
    colorGradient: 'from-emerald-500/20 via-teal-500/20 to-sky-600/20',
    accentColor: '#10B981',
    journey: [
      {
        year: '2020',
        title: 'Remarkable Growth Trajectory',
        description: 'Achieved extraordinary progress in performance and vocals in record time.'
      },
      {
        year: '2022',
        title: 'Vocal Tone Discovery',
        description: 'Established a distinctive sweet and comforting vocal color featured prominently in acoustic tracks.'
      },
      {
        year: '2024',
        title: 'Songwriting & Composition',
        description: 'Contributed directly to lyric writing and track themes.'
      }
    ],
    achievements: [
      {
        id: 'ach-jake-1',
        memberId: 'jake',
        memberName: 'Jake',
        title: 'Songwriting Credits Milestone',
        category: 'Artistry',
        eventDate: '2023-07-10',
        description: 'Co-wrote heartfelt lyrics connecting deeply with international listeners.',
        verifiedSourceUrl: 'https://open.spotify.com/artist/5t5FqBwTcgKTaWmfEbwQY9'
      }
    ],
    inspirationStories: [
      "Jake showed me that starting later than others is never an excuse to hold back; diligence bridges any gap.",
      "His joyful interaction with supporters always brings light to tough days."
    ],
    officialLinks: [
      { platform: 'Spotify', url: 'https://open.spotify.com/artist/5t5FqBwTcgKTaWmfEbwQY9', label: 'Credits' }
    ],
    photos: [
      {
        id: 'jake-photo-1',
        url: '/images/members/jake.jpg',
        caption: 'Jake radiating warmth and sweetness during official press showcase.',
        category: 'Stage',
        date: '2022-07-09',
        credit: 'Press Archive'
      },
      {
        id: 'jake-photo-2',
        url: '/images/members/jake_2.jpg',
        caption: 'Jake sharing a bright smile with fans at fanmeeting event.',
        category: 'Casual',
        date: '2023-09-15',
        credit: 'Event Gallery'
      },
      {
        id: 'jake-photo-3',
        url: '/images/members/jake_concert_1.jpg',
        caption: 'Jake performing with passion at concert stage.',
        category: 'Stage',
        date: '2024-06-22',
        credit: 'Concert Archive'
      }
    ]
  },
  {
    id: '4',
    slug: 'sunghoon',
    name: 'Park Sung-hoon',
    displayName: 'Sunghoon',
    koreanName: '박성훈',
    image: '/images/members/sunghoon.jpg',
    heroImage: '/images/members/sunghoon.jpg',
    quote: 'Elegance is forged through discipline, resilience, and quiet dedication behind the scenes.',
    role: 'Vocalist, Lead Dancer',
    birthDate: 'December 8, 2002',
    bio: 'Former figure skating champion who transitioned seamlessly into a graceful performer, combining athletic precision with elegant stage presence.',
    colorGradient: 'from-blue-500/20 via-indigo-500/20 to-sky-600/20',
    accentColor: '#3B82F6',
    journey: [
      {
        year: '2010-2020',
        title: 'Figure Skating Excellence',
        description: 'Won international silver medals and national podium spots in competitive figure skating.'
      },
      {
        year: '2021',
        title: 'Smooth Transition & Host Role',
        description: 'Appointed as MC for major weekly broadcast music shows, earning awards for hosting charm.'
      },
      {
        year: '2023',
        title: 'Fluid Performing Distinction',
        description: 'Renowned for clean line posture, pirouette controls, and sharp dance execution.'
      }
    ],
    achievements: [
      {
        id: 'ach-sh-1',
        memberId: 'sunghoon',
        memberName: 'Sunghoon',
        title: 'Best Couple MC Award',
        category: 'Milestone',
        eventDate: '2021-12-25',
        description: 'Received national broadcasting award for outstanding music show hosting chemistry and professionalism.',
        verifiedSourceUrl: 'https://www.youtube.com/results?search_query=ENHYPEN+Sunghoon+KBS+Entertainment+Awards+2021'
      }
    ],
    inspirationStories: [
      "Sunghoon's history of practicing on ice early in the morning taught me true self-discipline.",
      "His poise under pressure inspires me to stay graceful no matter how chaotic life gets."
    ],
    officialLinks: [
      { platform: 'YouTube', url: 'https://www.youtube.com/results?search_query=sunghoon+figure+skating', label: 'Skating & Dance Cuts' }
    ],
    photos: [
      {
        id: 'sh-photo-1',
        url: '/images/members/sunghoon.jpg',
        caption: 'Sunghoon presenting clean elegance and regal charm.',
        category: 'Stage',
        date: '2022-06-24',
        credit: 'Press Archive'
      },
      {
        id: 'sh-photo-2',
        url: '/images/members/sunghoon_4.jpg',
        caption: 'Sunghoon charming smile and graceful posture.',
        category: 'Studio',
        date: '2024-03-12',
        credit: 'Official Spotlight'
      },
      {
        id: 'sh-photo-3',
        url: '/images/members/sunghoon_concert_1.jpg',
        caption: 'Sunghoon captivating the audience during live performance.',
        category: 'Stage',
        date: '2024-08-05',
        credit: 'Concert Archive'
      }
    ]
  },
  {
    id: '5',
    slug: 'sunoo',
    name: 'Kim Sun-oo',
    displayName: 'Sunoo',
    koreanName: '김선우',
    image: '/images/members/sunoo.jpg',
    heroImage: '/images/members/sunoo.jpg',
    quote: 'A bright smile has the power to warm hearts and turn dark moments into light.',
    role: 'Vocalist',
    birthDate: 'June 24, 2003',
    bio: 'Famous for his luminous facial expressions, soulful vocal tone, magnetic charm, and innate ability to spread warmth to everyone around him.',
    colorGradient: 'from-pink-500/20 via-rose-400/20 to-amber-400/20',
    accentColor: '#EC4899',
    journey: [
      {
        year: '2020',
        title: 'Captivating Charm & Public Love',
        description: 'Won hearts worldwide with expressive facial dynamics and versatile vocal colors.'
      },
      {
        year: '2022',
        title: 'Vocal Versatility Highlight',
        description: 'Showcased rich falsettos and gentle ballads in special OST and unit stages.'
      },
      {
        year: '2024',
        title: 'Radiant Visual & Variety Icon',
        description: 'Brought bright joy to variety programs and special radio host broadcasts.'
      }
    ],
    achievements: [
      {
        id: 'ach-sun-1',
        memberId: 'sunoo',
        memberName: 'Sunoo',
        title: 'Special Vocal Cover Recognition',
        category: 'Music',
        eventDate: '2023-04-18',
        description: 'Ballad vocal covers reached millions, praised for emotional resonance and crystal-clear tone.',
        verifiedSourceUrl: 'https://www.youtube.com/results?search_query=ENHYPEN+Sunoo+Vocal+Cover'
      }
    ],
    inspirationStories: [
      "Sunoo's sunshine energy brightened my darkest days when I was going through difficult times.",
      "His self-care awareness and genuine kindness remind us all to prioritize mental wellness."
    ],
    officialLinks: [
      { platform: 'Weverse', url: 'https://weverse.io/enhypen/artist', label: 'Sunoo Space' }
    ],
    photos: [
      {
        id: 'sun-photo-1',
        url: '/images/members/sunoo.jpg',
        caption: 'Sunoo lighting up the venue with his radiant smile and bright energy.',
        category: 'Stage',
        date: '2022-06-24',
        credit: 'Press Archive'
      },
      {
        id: 'sun-photo-2',
        url: '/images/members/sunoo_2.jpg',
        caption: 'Sunoo spreading warmth during fan interaction event.',
        category: 'Casual',
        date: '2023-11-20',
        credit: 'Event Gallery'
      }
    ]
  },
  {
    id: '6',
    slug: 'jungwon',
    name: 'Yang Jung-won',
    displayName: 'Jungwon',
    koreanName: '양정원',
    image: '/images/members/jungwon.jpg',
    heroImage: '/images/members/jungwon.jpg',
    quote: 'True leadership is listening deeply, staying dependable, and guiding with empathy.',
    role: 'Leader, Lead Vocalist, Lead Dancer',
    birthDate: 'February 9, 2004',
    bio: 'Respected for his steady, wise leadership, unique vocal timbre, martial arts foundation, and deep accountability toward team stability.',
    colorGradient: 'from-violet-500/20 via-purple-500/20 to-indigo-600/20',
    accentColor: '#8B5CF6',
    journey: [
      {
        year: '2020',
        title: 'Entrusted with Leadership',
        description: 'Selected as team leader at a young age, displaying extraordinary maturity and emotional intelligence.'
      },
      {
        year: '2022',
        title: 'Taekwondo Precision in Dance',
        description: 'Infused popping stability and martial arts body control into powerful choreography routines.'
      },
      {
        year: '2024',
        title: 'Global Ambassador & Pillar',
        description: 'Represented the group gracefully at global press summits, award shows, and community initiatives.'
      }
    ],
    achievements: [
      {
        id: 'ach-jw-1',
        memberId: 'jungwon',
        memberName: 'Jungwon',
        title: 'Exemplary Leadership Recognition',
        category: 'Global Impact',
        eventDate: '2023-11-05',
        description: 'Highlighted by music media as one of the most composed and supportive group leaders.',
        verifiedSourceUrl: 'https://www.billboard.com/music/pop/enhypen-interview-new-album-manifesto-day-1-1235111166/'
      }
    ],
    inspirationStories: [
      "Jungwon's calm demeanor in stressful situations taught me how to lead my own student projects with patience.",
      "His daily evening check-ins with community members show true dedication."
    ],
    officialLinks: [
      { platform: 'Weverse', url: 'https://weverse.io/enhypen/artist', label: 'Leader Notes' }
    ],
    photos: [
      {
        id: 'jw-photo-1',
        url: '/images/members/jungwon.jpg',
        caption: 'Leader Jungwon greeting fans with composure and bright dimpled smile.',
        category: 'Stage',
        date: '2022-07-09',
        credit: 'Press Archive'
      },
      {
        id: 'jw-photo-2',
        url: '/images/members/jungwon_3.png',
        caption: 'Jungwon showcasing powerful charisma in concept photoshoot.',
        category: 'Concept',
        date: '2024-01-15',
        credit: 'Official Concept'
      },
      {
        id: 'jw-photo-3',
        url: '/images/members/jungwon_concert_1.jpg',
        caption: 'Jungwon leading the team on stage with confidence.',
        category: 'Stage',
        date: '2024-07-20',
        credit: 'Concert Archive'
      }
    ]
  },
  {
    id: '7',
    slug: 'ni-ki',
    name: 'Nishimura Riki',
    displayName: 'Ni-ki',
    koreanName: '니키',
    image: '/images/members/ni-ki.jpg',
    heroImage: '/images/members/ni-ki.jpg',
    quote: 'Movement is my voice; when words fall short, dance expresses every nuance of passion.',
    role: 'Main Dancer, Vocalist',
    birthDate: 'December 9, 2005',
    bio: 'Prodigious dancer renowned globally for fluid isolation, precise groove retention, choreographic mastery, and electrifying stage presence.',
    colorGradient: 'from-cyan-500/20 via-teal-500/20 to-blue-600/20',
    accentColor: '#06B6D4',
    journey: [
      {
        year: '2019-2020',
        title: 'Dance Prodigy Recognition',
        description: 'Captured global attention as a child prodigy dancer with mesmerizing performance instincts.'
      },
      {
        year: '2022',
        title: 'Choreography Contribution',
        description: 'Participated in dance breaks composition and detail polishing for major concerts.'
      },
      {
        year: '2024',
        title: 'Performance Pinnacle',
        description: 'Delivered legendary solo dance stages at global stadium venues.'
      }
    ],
    achievements: [
      {
        id: 'ach-niki-1',
        memberId: 'ni-ki',
        memberName: 'Ni-ki',
        title: 'Studio Choom Artist of the Month Showcase',
        category: 'Performance',
        eventDate: '2022-09-14',
        description: 'Solos reached historic dance view milestones, applauded by global choreographers.',
        verifiedSourceUrl: 'https://www.youtube.com/results?search_query=ENHYPEN+Ni-ki+Studio+Choom+Artist+of+the+Month'
      }
    ],
    inspirationStories: [
      "Ni-ki moving away from home at a young age to pursue dance showed me what real commitment means.",
      "His fluid dance control makes me want to learn dance and express myself without fear."
    ],
    officialLinks: [
      { platform: 'YouTube', url: 'https://www.youtube.com/@STUDIOCHOOM', label: 'Dance Covers' }
    ],
    photos: [
      {
        id: 'niki-photo-1',
        url: '/images/members/ni-ki.jpg',
        caption: 'Ni-ki exuding effortless poise and natural star presence.',
        category: 'Stage',
        date: '2022-06-24',
        credit: 'Press Archive'
      },
      {
        id: 'niki-photo-2',
        url: '/images/members/ni-ki_3.jpg',
        caption: 'Ni-ki meeting supporters during SBS Inkigayo live fan meeting.',
        category: 'Casual',
        date: '2022-08-07',
        credit: 'Fan Meeting Archive'
      },
      {
        id: 'niki-photo-3',
        url: '/images/members/ni-ki_4.jpg',
        caption: 'Ni-ki attending the Love Your W celebration in sleek styling.',
        category: 'Concept',
        date: '2024-10-14',
        credit: 'Love Your W Event'
      }
    ]
  }
];
