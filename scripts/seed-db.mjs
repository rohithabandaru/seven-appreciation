import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DEMO_PASSWORD = 'demo-password'

const DEMO_USERS = [
  {
    id: 'user-demo-supporter',
    email: 'supporter@seven.app',
    name: 'Kind Supporter',
    role: 'user',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'user-demo-mod',
    email: 'mod@seven.app',
    name: 'Community Moderator',
    role: 'admin',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'user-demo-aria',
    email: 'aria@seven.app',
    name: 'Aria_Vocalist',
    role: 'user',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'user-demo-sunny',
    email: 'sunny@seven.app',
    name: 'SunnyDays_J',
    role: 'user',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  }
]

const INITIAL_APPRECIATION_MESSAGES = [
  {
    id: 'msg-1',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    userName: 'Aria_Vocalist',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    content: 'Thank you Heeseung for always putting your whole heart into every melody. Your acoustic performance of "Off My Face" gave me comfort during my college exams!',
    status: 'approved',
    likesCount: 142
  },
  {
    id: 'msg-2',
    memberId: 'jay',
    memberName: 'Jay',
    userName: 'RockStarPulse',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    content: 'Jay, your guitar solos and passionate dedication on stage inspire me to practice my instrument every single day. Keep shining brightly!',
    status: 'approved',
    likesCount: 98
  },
  {
    id: 'msg-3',
    memberId: 'jake',
    memberName: 'Jake',
    userName: 'SunnyDays_J',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    content: 'Jake, your warm smile and comforting lyrics always make rainy days feel brighter. Thank you for showing that consistent hard work transforms dreams into reality.',
    status: 'approved',
    likesCount: 115
  },
  {
    id: 'msg-4',
    memberId: 'sunghoon',
    memberName: 'Sunghoon',
    userName: 'IceGrace',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    content: 'Sunghoon, the grace and poise you bring from your ice skating days to the music stage is truly breathtaking. Wishing you endless happiness!',
    status: 'approved',
    likesCount: 104
  },
  {
    id: 'msg-5',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    userName: 'PeachSun',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    content: 'Sunoo, your joyful facial expressions and angelic vocal color bring so much genuine happiness to our community. Thank you for being yourself!',
    status: 'approved',
    likesCount: 167
  },
  {
    id: 'msg-6',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    userName: 'LeaderAnchor',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    content: 'Jungwon, thank you for guiding the team with such wisdom, patience, and kindness. You are an exemplary leader and an absolute joy to support.',
    status: 'approved',
    likesCount: 189
  },
  {
    id: 'msg-7',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    userName: 'GrooveMaster',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    content: 'Ni-ki, watching your dance isolations and performance power leaves me in awe every time. Thank you for sharing your gift with the world!',
    status: 'approved',
    likesCount: 210
  }
]

const DEMO_POSTS = [
  {
    id: 'post-demo-1',
    userId: 'user-demo-aria',
    type: 'story',
    memberId: 'heeseung',
    title: 'How Heeseung\'s vocals got me through finals week',
    content: 'I played "Sweet Venom" on loop while studying for my final exams. Every time I felt like giving up, his voice reminded me to keep pushing. This community has been such a warm place to share that journey. Thank you all for being so kind!'
  },
  {
    id: 'post-demo-2',
    userId: 'user-demo-supporter',
    type: 'achievement',
    memberId: 'jungwon',
    title: 'Celebrating Jungwon\'s leadership milestone',
    content: 'Five years of Jungwon leading ENHYPEN with grace beyond his age. From being the youngest leader to guiding sold-out world tours — his growth inspires me to lead with kindness in my own life too.'
  },
  {
    id: 'post-demo-3',
    userId: 'user-demo-sunny',
    type: 'letter',
    memberId: 'jake',
    title: 'A thank you letter to Jake',
    content: 'Dear Jake, your radio show gets me through my morning commute every single day. The way you laugh at your own jokes before finishing them makes my whole week. Thank you for always being so genuine with us.'
  },
  {
    id: 'post-demo-4',
    userId: 'user-demo-supporter',
    type: 'story',
    memberId: 'sunoo',
    title: 'Sunoo helped me love myself',
    content: 'Seeing Sunoo stay confident and bright through every hardship taught me that joy is a form of strength. I used to hide my smile — now I wear it proudly because of him.'
  },
  {
    id: 'post-demo-5',
    userId: 'user-demo-mod',
    type: 'achievement',
    memberId: null,
    title: 'Our community reached 10,000 kind messages!',
    content: 'Milestone moment: together we have shared over ten thousand appreciation notes with zero hate comments. This is what fandom should feel like. Proud of every single person here.'
  },
  {
    id: 'post-demo-6',
    userId: 'user-demo-aria',
    type: 'reel',
    memberId: 'ni-ki',
    title: 'Ni-ki\'s dance break compilation',
    content: 'Compiled my favorite Ni-ki dance breaks from this era. The control, the precision, the charisma — he keeps leveling up every single comeback!'
  },
  {
    id: 'post-demo-7',
    userId: 'user-demo-sunny',
    type: 'story',
    memberId: 'jay',
    title: 'Jay\'s cooking content cured my burnout',
    content: 'Watching Jay cook and share stories from his life reminded me it is okay to slow down and enjoy small things. I started cooking again after months of exhaustion. Thank you, Jay.'
  },
  {
    id: 'post-demo-8',
    userId: 'user-demo-supporter',
    type: 'letter',
    memberId: 'sunghoon',
    title: 'To Sunghoon, from a fellow skater',
    content: 'I skate too, and I know how hard those early mornings are. Seeing where figure skating took you gives me courage at the rink every day. Thank you for never giving up on either ice or stage.'
  }
]

const DEMO_LETTERS = [
  {
    id: 'letter-demo-1',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    userId: 'user-demo-aria',
    userName: 'Aria_Vocalist',
    title: 'Your voice is my safe place',
    body: 'Dear Heeseung, whenever the world feels too loud, I put on your covers and everything slows down. Thank you for sharing your voice with us so generously. I hope this year brings you as much comfort as you bring to us.'
  },
  {
    id: 'letter-demo-2',
    memberId: 'jay',
    memberName: 'Jay',
    userId: 'user-demo-sunny',
    userName: 'SunnyDays_J',
    title: 'Thank you for wearing your heart openly',
    body: 'Dear Jay, you show your emotions honestly and it teaches me that vulnerability is strength. Your passion on stage and gentleness off stage inspire me daily.'
  },
  {
    id: 'letter-demo-3',
    memberId: 'jake',
    memberName: 'Jake',
    userId: 'user-demo-supporter',
    userName: 'Kind Supporter',
    title: 'For the brightest smile',
    body: 'Dear Jake, your positivity feels like sunshine on cloudy days. Thank you for working so hard and still keeping that warm heart of yours.'
  },
  {
    id: 'letter-demo-4',
    memberId: 'sunghoon',
    memberName: 'Sunghoon',
    userId: 'user-demo-mod',
    userName: 'Community Moderator',
    title: 'Grace on every stage',
    body: 'Dear Sunghoon, watching you transition from ice to stage taught me that changing dreams is not losing them — it is growing. Wishing you endless standing ovations.'
  },
  {
    id: 'letter-demo-5',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    userId: 'user-demo-aria',
    userName: 'Aria_Vocalist',
    title: 'Our ray of sunshine',
    body: 'Dear Sunoo, your energy lifts this whole community. On hard days your variety show appearances are my comfort watch. Please always be as radiant as you are.'
  },
  {
    id: 'letter-demo-6',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    userId: 'user-demo-supporter',
    userName: 'Kind Supporter',
    title: 'To our steady leader',
    body: 'Dear Jungwon, leading seven talented people is no small feat, yet you do it with humility and warmth. Thank you for taking care of the team and us.'
  },
  {
    id: 'letter-demo-7',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    userId: 'user-demo-sunny',
    userName: 'SunnyDays_J',
    title: 'Watching you grow has been a gift',
    body: 'Dear Ni-ki, from the trainee we met years ago to the powerhouse performer you are now — your growth amazes me. Keep dancing like the whole world is watching, because we are.'
  }
]

async function seed() {
  console.log('Seeding initial data into Prisma Postgres...')

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)

  for (const user of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password: hashedPassword, emailVerified: new Date() }
    })
  }
  console.log(`Seeded ${DEMO_USERS.length} demo users (password: ${DEMO_PASSWORD})`)

  for (const msg of INITIAL_APPRECIATION_MESSAGES) {
    await prisma.appreciationMessage.upsert({
      where: { id: msg.id },
      update: {},
      create: msg
    })
  }
  console.log(`Seeded ${INITIAL_APPRECIATION_MESSAGES.length} appreciation messages`)

  for (const post of DEMO_POSTS) {
    const { id, ...data } = post
    await prisma.post.upsert({
      where: { id },
      update: {},
      create: { id, ...data, status: 'approved', mediaUrl: null }
    })
  }
  console.log(`Seeded ${DEMO_POSTS.length} community feed posts`)

  for (const letter of DEMO_LETTERS) {
    await prisma.letter.upsert({
      where: { id: letter.id },
      update: {},
      create: letter
    })
  }
  console.log(`Seeded ${DEMO_LETTERS.length} letters`)

  console.log('Seeding completed successfully!')
  await prisma.$disconnect()
  await pool.end()
}

seed().catch(async (err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
