import { ComfortMood, ComfortNote } from '@/types';

export const COMFORT_MOODS: ComfortMood[] = [
  { id: 'tired', label: 'Tired', prompt: 'I need rest, not more pressure.', accent: 'from-amber-400 to-rose-400' },
  { id: 'anxious', label: 'Anxious', prompt: 'My thoughts are moving too fast.', accent: 'from-sky-400 to-indigo-400' },
  { id: 'lonely', label: 'Lonely', prompt: 'I want to feel less alone tonight.', accent: 'from-violet-400 to-rose-400' },
  { id: 'proud', label: 'Proud', prompt: 'I want to celebrate something quietly.', accent: 'from-emerald-400 to-teal-400' },
  { id: 'grateful', label: 'Grateful', prompt: 'I want to say thank you out loud.', accent: 'from-rose-400 to-amber-400' },
  { id: 'unmotivated', label: 'Stuck', prompt: 'I cannot find the next small step.', accent: 'from-orange-400 to-amber-500' },
  { id: 'homesick', label: 'Homesick', prompt: 'I miss a place, a person, or a version of me.', accent: 'from-cyan-400 to-blue-500' },
  { id: 'hopeful', label: 'Hopeful', prompt: 'I want to keep a small light on.', accent: 'from-fuchsia-400 to-amber-400' }
];

export const COMFORT_NOTES: ComfortNote[] = [
  {
    moodId: 'tired',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    quote: 'Expression through music is the purest way to connect hearts across borders.',
    note: 'Rest is part of the work. Even the most careful voices need silence between phrases.',
    nextStep: 'Write Heeseung a short thank-you for showing up with care.',
    nextHref: '/appreciation'
  },
  {
    moodId: 'tired',
    memberId: 'jay',
    memberName: 'Jay',
    quote: 'Passionate commitment is not optional; it is the energy that brings every dream to life.',
    note: 'Passion is not the same as running on empty. You can love something and still sit down.',
    nextStep: 'Leave Jay a note about steady effort, not grind.',
    nextHref: '/members/jay'
  },
  {
    moodId: 'tired',
    memberId: 'jake',
    memberName: 'Jake',
    quote: 'Growth is a journey of consistency, warmth, and constant learning every single day.',
    note: 'Consistency includes sleep. Tomorrow’s warmth starts with tonight’s pause.',
    nextStep: 'Read a short story and then close the tab.',
    nextHref: '/stories'
  },
  {
    moodId: 'tired',
    memberId: 'sunghoon',
    memberName: 'Sunghoon',
    quote: 'Elegance is forged through discipline, resilience, and quiet dedication behind the scenes.',
    note: 'Discipline also means knowing when the ice is too thin to keep skating.',
    nextStep: 'Send Sunghoon a calm message about poise under pressure.',
    nextHref: '/members/sunghoon'
  },
  {
    moodId: 'tired',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    quote: 'A bright smile has the power to warm hearts and turn dark moments into light.',
    note: 'You do not have to smile first. Let someone else’s warmth hold the room for a minute.',
    nextStep: 'Sit with a comfort track before you write anything.',
    nextHref: '/music'
  },
  {
    moodId: 'tired',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    quote: 'True leadership is listening deeply, staying dependable, and guiding with empathy.',
    note: 'A good leader rests so the whole room can stay steady. That includes you.',
    nextStep: 'Write yourself a sealed letter that says you can stop for today.',
    nextHref: '/letters'
  },
  {
    moodId: 'tired',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    quote: 'Movement is my voice; when words fall short, dance expresses every nuance of passion.',
    note: 'Stillness is also a movement. Stretch once, then let the day end.',
    nextStep: 'Cheer for Ni-ki’s craft, then step away from the screen.',
    nextHref: '/members/ni-ki'
  },
  {
    moodId: 'anxious',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    quote: 'Expression through music is the purest way to connect hearts across borders.',
    note: 'You do not have to solve the whole melody. Hum one line and breathe on the rest.',
    nextStep: 'Open the comfort playlist and stay for one song only.',
    nextHref: '/music'
  },
  {
    moodId: 'anxious',
    memberId: 'jay',
    memberName: 'Jay',
    quote: 'Passionate commitment is not optional; it is the energy that brings every dream to life.',
    note: 'Name the feeling, then put it down. Commitment can wait until your hands are steady.',
    nextStep: 'Write a private letter you do not have to send.',
    nextHref: '/letters'
  },
  {
    moodId: 'anxious',
    memberId: 'jake',
    memberName: 'Jake',
    quote: 'Growth is a journey of consistency, warmth, and constant learning every single day.',
    note: 'Growth is allowed to be slow on anxious days. Warmth still counts.',
    nextStep: 'Send Jake a gentle message about learning at your own pace.',
    nextHref: '/members/jake'
  },
  {
    moodId: 'anxious',
    memberId: 'sunghoon',
    memberName: 'Sunghoon',
    quote: 'Elegance is forged through discipline, resilience, and quiet dedication behind the scenes.',
    note: 'Hold your posture. Unclench your jaw. The next minute is enough.',
    nextStep: 'Read Sunghoon’s journey and notice the quiet years, not only the medals.',
    nextHref: '/members/sunghoon'
  },
  {
    moodId: 'anxious',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    quote: 'A bright smile has the power to warm hearts and turn dark moments into light.',
    note: 'If your mind is loud, borrow a softer face for a while. You are allowed to be held.',
    nextStep: 'Leave a kind note on Sunoo’s wall.',
    nextHref: '/members/sunoo'
  },
  {
    moodId: 'anxious',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    quote: 'True leadership is listening deeply, staying dependable, and guiding with empathy.',
    note: 'Listen to yourself the way a good leader would: without rushing, without scolding.',
    nextStep: 'Share a short encouragement in the community.',
    nextHref: '/community'
  },
  {
    moodId: 'anxious',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    quote: 'Movement is my voice; when words fall short, dance expresses every nuance of passion.',
    note: 'Shake out your hands. Walk to the window. Let the body finish the sentence.',
    nextStep: 'Find a performance clip through Ni-ki’s official links, then come back when you are ready.',
    nextHref: '/members/ni-ki'
  },
  {
    moodId: 'lonely',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    quote: 'Expression through music is the purest way to connect hearts across borders.',
    note: 'Someone else is listening to the same song tonight. That is already a kind of company.',
    nextStep: 'Leave a message so another person finds company too.',
    nextHref: '/appreciation'
  },
  {
    moodId: 'lonely',
    memberId: 'jay',
    memberName: 'Jay',
    quote: 'Passionate commitment is not optional; it is the energy that brings every dream to life.',
    note: 'Care is a form of company. You can give some without pretending you are not lonely.',
    nextStep: 'Write Jay about a time their passion made a room feel less empty.',
    nextHref: '/members/jay'
  },
  {
    moodId: 'lonely',
    memberId: 'jake',
    memberName: 'Jake',
    quote: 'Growth is a journey of consistency, warmth, and constant learning every single day.',
    note: 'Warmth can be a single sentence. You do not need a crowd to belong here.',
    nextStep: 'Read an inspiration story written by someone who needed the same thing.',
    nextHref: '/stories'
  },
  {
    moodId: 'lonely',
    memberId: 'sunghoon',
    memberName: 'Sunghoon',
    quote: 'Elegance is forged through discipline, resilience, and quiet dedication behind the scenes.',
    note: 'Quiet people still leave lights on for each other. This page is one of them.',
    nextStep: 'Send a calm letter that another lonely person might later read.',
    nextHref: '/letters'
  },
  {
    moodId: 'lonely',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    quote: 'A bright smile has the power to warm hearts and turn dark moments into light.',
    note: 'You can sit in this corner without performing happiness. The light can be borrowed.',
    nextStep: 'Cheer for Sunoo, then stay for one more song.',
    nextHref: '/music'
  },
  {
    moodId: 'lonely',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    quote: 'True leadership is listening deeply, staying dependable, and guiding with empathy.',
    note: 'Being held by a community does not require you to speak first.',
    nextStep: 'Browse the wall. You are already in the room.',
    nextHref: '/appreciation'
  },
  {
    moodId: 'lonely',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    quote: 'Movement is my voice; when words fall short, dance expresses every nuance of passion.',
    note: 'You can be far from home and still have a place that recognizes your effort.',
    nextStep: 'Write Ni-ki about courage across distance.',
    nextHref: '/members/ni-ki'
  },
  {
    moodId: 'proud',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    quote: 'Expression through music is the purest way to connect hearts across borders.',
    note: 'Pride can be quiet and still be true. Keep the moment. Do not rush past it.',
    nextStep: 'Write down what you are proud of, then thank Heeseung for modeling care.',
    nextHref: '/letters'
  },
  {
    moodId: 'proud',
    memberId: 'jay',
    memberName: 'Jay',
    quote: 'Passionate commitment is not optional; it is the energy that brings every dream to life.',
    note: 'You showed up. That is already the energy. Let yourself feel it.',
    nextStep: 'Share a proud, comparison-free note on the community board.',
    nextHref: '/community'
  },
  {
    moodId: 'proud',
    memberId: 'jake',
    memberName: 'Jake',
    quote: 'Growth is a journey of consistency, warmth, and constant learning every single day.',
    note: 'Starting later, finishing softer, or trying again still counts as growth.',
    nextStep: 'Tell Jake what you learned this week.',
    nextHref: '/members/jake'
  },
  {
    moodId: 'proud',
    memberId: 'sunghoon',
    memberName: 'Sunghoon',
    quote: 'Elegance is forged through discipline, resilience, and quiet dedication behind the scenes.',
    note: 'The unseen hours deserve a bow too. Include yours.',
    nextStep: 'Celebrate a milestone on the achievements page — theirs and yours, side by side.',
    nextHref: '/achievements'
  },
  {
    moodId: 'proud',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    quote: 'A bright smile has the power to warm hearts and turn dark moments into light.',
    note: 'Let the pride be bright. You do not have to shrink a good day.',
    nextStep: 'Leave Sunoo a joyful message.',
    nextHref: '/members/sunoo'
  },
  {
    moodId: 'proud',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    quote: 'True leadership is listening deeply, staying dependable, and guiding with empathy.',
    note: 'Taking care of a group — a class, a family, a chat — is a real accomplishment.',
    nextStep: 'Write Jungwon about the people you look after.',
    nextHref: '/members/jungwon'
  },
  {
    moodId: 'proud',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    quote: 'Movement is my voice; when words fall short, dance expresses every nuance of passion.',
    note: 'Your body remembered something today. That is worth celebrating.',
    nextStep: 'Save a comfort track for the next time you need this feeling back.',
    nextHref: '/music'
  },
  {
    moodId: 'grateful',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    quote: 'Expression through music is the purest way to connect hearts across borders.',
    note: 'Gratitude sounds best when it is specific. Name the note that helped you.',
    nextStep: 'Publish a thank-you on the appreciation wall.',
    nextHref: '/appreciation'
  },
  {
    moodId: 'grateful',
    memberId: 'jay',
    memberName: 'Jay',
    quote: 'Passionate commitment is not optional; it is the energy that brings every dream to life.',
    note: 'Someone’s effort made your day easier. Say it while the feeling is warm.',
    nextStep: 'Write Jay a precise thank-you.',
    nextHref: '/members/jay'
  },
  {
    moodId: 'grateful',
    memberId: 'jake',
    memberName: 'Jake',
    quote: 'Growth is a journey of consistency, warmth, and constant learning every single day.',
    note: 'Thank-you is also a kind of learning: it teaches the room what to keep doing.',
    nextStep: 'Share a grateful story.',
    nextHref: '/stories'
  },
  {
    moodId: 'grateful',
    memberId: 'sunghoon',
    memberName: 'Sunghoon',
    quote: 'Elegance is forged through discipline, resilience, and quiet dedication behind the scenes.',
    note: 'Thank the unseen work — theirs, and the people who hold you up offstage.',
    nextStep: 'Leave a quiet note on Sunghoon’s wall.',
    nextHref: '/members/sunghoon'
  },
  {
    moodId: 'grateful',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    quote: 'A bright smile has the power to warm hearts and turn dark moments into light.',
    note: 'If someone made the day lighter, let them know. Brightness likes company.',
    nextStep: 'Send Sunoo a thank-you for the warmth.',
    nextHref: '/members/sunoo'
  },
  {
    moodId: 'grateful',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    quote: 'True leadership is listening deeply, staying dependable, and guiding with empathy.',
    note: 'Thank the people who listen. Then be that person for one message.',
    nextStep: 'Write a letter to all seven.',
    nextHref: '/letters'
  },
  {
    moodId: 'grateful',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    quote: 'Movement is my voice; when words fall short, dance expresses every nuance of passion.',
    note: 'Some thanks are better danced than spoken. Some are better written. Choose one.',
    nextStep: 'Write Ni-ki about a movement that stayed with you.',
    nextHref: '/members/ni-ki'
  },
  {
    moodId: 'unmotivated',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    quote: 'Expression through music is the purest way to connect hearts across borders.',
    note: 'You do not need a whole song. One honest line is a start.',
    nextStep: 'Write one sentence of appreciation and stop there.',
    nextHref: '/appreciation'
  },
  {
    moodId: 'unmotivated',
    memberId: 'jay',
    memberName: 'Jay',
    quote: 'Passionate commitment is not optional; it is the energy that brings every dream to life.',
    note: 'Start smaller than pride would like. Five minutes still counts as showing up.',
    nextStep: 'Open Jay’s profile, then do one tiny task in your own life.',
    nextHref: '/members/jay'
  },
  {
    moodId: 'unmotivated',
    memberId: 'jake',
    memberName: 'Jake',
    quote: 'Growth is a journey of consistency, warmth, and constant learning every single day.',
    note: 'You can begin again without a speech. Just the next kind action.',
    nextStep: 'Read Jake’s journey and pick one small practice of your own.',
    nextHref: '/members/jake'
  },
  {
    moodId: 'unmotivated',
    memberId: 'sunghoon',
    memberName: 'Sunghoon',
    quote: 'Elegance is forged through discipline, resilience, and quiet dedication behind the scenes.',
    note: 'Show up to the unseen part. Make the bed. Open the file. That is enough.',
    nextStep: 'Visit Sunghoon’s milestones, then take one quiet step.',
    nextHref: '/members/sunghoon'
  },
  {
    moodId: 'unmotivated',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    quote: 'A bright smile has the power to warm hearts and turn dark moments into light.',
    note: 'Motivation is not required for kindness. Send warmth anyway.',
    nextStep: 'Leave a light message for Sunoo.',
    nextHref: '/members/sunoo'
  },
  {
    moodId: 'unmotivated',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    quote: 'True leadership is listening deeply, staying dependable, and guiding with empathy.',
    note: 'Lead yourself the way you would lead a tired friend: clearly, and with a short list.',
    nextStep: 'Write tomorrow’s letter with one task only.',
    nextHref: '/letters'
  },
  {
    moodId: 'unmotivated',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    quote: 'Movement is my voice; when words fall short, dance expresses every nuance of passion.',
    note: 'Move first. Think later. One song, one stretch, one glass of water.',
    nextStep: 'Play a comfort track and stand up for the chorus.',
    nextHref: '/music'
  },
  {
    moodId: 'homesick',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    quote: 'Expression through music is the purest way to connect hearts across borders.',
    note: 'Music can be a room you still have the key to, even when the city changed.',
    nextStep: 'Listen, then write Heeseung about the place you miss.',
    nextHref: '/music'
  },
  {
    moodId: 'homesick',
    memberId: 'jay',
    memberName: 'Jay',
    quote: 'Passionate commitment is not optional; it is the energy that brings every dream to life.',
    note: 'Carrying two homes is heavy. You do not have to pick one to be loyal.',
    nextStep: 'Write Jay about the kitchen, street, or language you miss.',
    nextHref: '/members/jay'
  },
  {
    moodId: 'homesick',
    memberId: 'jake',
    memberName: 'Jake',
    quote: 'Growth is a journey of consistency, warmth, and constant learning every single day.',
    note: 'You can grow in a new place and still love the old one. Both can be true.',
    nextStep: 'Share a homesick-but-hopeful story.',
    nextHref: '/stories'
  },
  {
    moodId: 'homesick',
    memberId: 'sunghoon',
    memberName: 'Sunghoon',
    quote: 'Elegance is forged through discipline, resilience, and quiet dedication behind the scenes.',
    note: 'Some homes are made of routine. Rebuild one small ritual tonight.',
    nextStep: 'Leave Sunghoon a note about discipline as comfort.',
    nextHref: '/members/sunghoon'
  },
  {
    moodId: 'homesick',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    quote: 'A bright smile has the power to warm hearts and turn dark moments into light.',
    note: 'If home is a feeling, you can set a small lamp for it here.',
    nextStep: 'Send Sunoo a warm message from wherever you are.',
    nextHref: '/members/sunoo'
  },
  {
    moodId: 'homesick',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    quote: 'True leadership is listening deeply, staying dependable, and guiding with empathy.',
    note: 'You can miss people and still be a steady place for someone else.',
    nextStep: 'Write a sealed letter to the version of you that still lives at home.',
    nextHref: '/letters'
  },
  {
    moodId: 'homesick',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    quote: 'Movement is my voice; when words fall short, dance expresses every nuance of passion.',
    note: 'Leaving home to chase a craft is brave. Missing it does not undo the bravery.',
    nextStep: 'Write Ni-ki about distance and devotion.',
    nextHref: '/members/ni-ki'
  },
  {
    moodId: 'hopeful',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    quote: 'Expression through music is the purest way to connect hearts across borders.',
    note: 'Keep the hope specific. One person, one song, one tomorrow.',
    nextStep: 'Write Heeseung what you are looking forward to.',
    nextHref: '/members/heeseung'
  },
  {
    moodId: 'hopeful',
    memberId: 'jay',
    memberName: 'Jay',
    quote: 'Passionate commitment is not optional; it is the energy that brings every dream to life.',
    note: 'Hope works better with a plan the size of this afternoon.',
    nextStep: 'Leave Jay a note about the dream you are still carrying.',
    nextHref: '/members/jay'
  },
  {
    moodId: 'hopeful',
    memberId: 'jake',
    memberName: 'Jake',
    quote: 'Growth is a journey of consistency, warmth, and constant learning every single day.',
    note: 'If you can still learn, the story is not finished.',
    nextStep: 'Share a hopeful community post.',
    nextHref: '/community'
  },
  {
    moodId: 'hopeful',
    memberId: 'sunghoon',
    memberName: 'Sunghoon',
    quote: 'Elegance is forged through discipline, resilience, and quiet dedication behind the scenes.',
    note: 'Second chapters exist. Skating became a stage. Your next shape can be kind too.',
    nextStep: 'Read Sunghoon’s journey, then write your own next line.',
    nextHref: '/members/sunghoon'
  },
  {
    moodId: 'hopeful',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    quote: 'A bright smile has the power to warm hearts and turn dark moments into light.',
    note: 'Hold the light loosely. You do not have to prove it. Just keep it nearby.',
    nextStep: 'Send Sunoo a hopeful thank-you.',
    nextHref: '/members/sunoo'
  },
  {
    moodId: 'hopeful',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    quote: 'True leadership is listening deeply, staying dependable, and guiding with empathy.',
    note: 'Hope is easier in a room that listens. You are in one now.',
    nextStep: 'Write a letter to all seven about the future you want for this community.',
    nextHref: '/letters'
  },
  {
    moodId: 'hopeful',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    quote: 'Movement is my voice; when words fall short, dance expresses every nuance of passion.',
    note: 'The next step can be a dance step. Forward is still forward.',
    nextStep: 'Play a track, then write Ni-ki one brave sentence.',
    nextHref: '/music'
  }
];

export function pickComfortNote(moodId: ComfortMood['id'], shift = 0, date = new Date()) {
  const pool = COMFORT_NOTES.filter((note) => note.moodId === moodId);
  if (pool.length === 0) return null;
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfYear = Math.floor((now - start) / 86_400_000);
  const index = (dayOfYear + shift) % pool.length;
  return pool[index];
}
