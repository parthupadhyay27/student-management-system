// Game configuration and constants for NEXUS: LIFE BEYOND CODE

export const INITIAL_GAME_STATE = {
  name: '',
  age: 19,
  money: 10000,
  happiness: 70,
  energy: 80,
  attendance: 85,
  day: 1,
  lifeStage: 'STUDENT', // 'CHILD' | 'STUDENT' | 'WORKING' | 'RETIRED'
  inventory: [],
  totalSpent: 0,
  soundEnabled: true,
  history: [],
};

export const SHOP_ITEMS = [
  {
    id: 'coffee',
    name: 'Coffee',
    price: 80,
    happiness: 3,
    energy: 5,
    category: 'DRINK',
    icon: 'Coffee',
    description: 'Fresh brewed filter coffee to awaken your senses before morning lectures.'
  },
  {
    id: 'pizza',
    name: 'Pizza',
    price: 250,
    happiness: 8,
    energy: 5,
    category: 'FOOD',
    icon: 'Pizza',
    description: 'Hot, cheesy wood-fired slices that make any tough study session better.'
  },
  {
    id: 'burger',
    name: 'Burger',
    price: 180,
    happiness: 6,
    energy: 4,
    category: 'FOOD',
    icon: 'Utensils',
    description: 'Juicy campus special burger loaded with crisp lettuce and sauce.'
  },
  {
    id: 'starbucks',
    name: 'Starbucks',
    price: 300,
    happiness: 10,
    energy: 5,
    category: 'DRINK',
    icon: 'CupSoda',
    description: 'Signature iced caramel Frappuccino with rich whipped cream topping.'
  },
  {
    id: 'noodles',
    name: 'Noodles',
    price: 20,
    happiness: 2,
    energy: 4,
    category: 'FOOD',
    icon: 'Soup',
    description: 'Classic 2-minute spicy hostel noodles. Cheap, hot, and lifesaver.'
  },
  {
    id: 'ice_cream',
    name: 'Ice Cream',
    price: 100,
    happiness: 7,
    energy: 0,
    category: 'FOOD',
    icon: 'IceCream',
    description: 'Velvety Belgian chocolate waffle cone to reward yourself after tests.'
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    price: 60,
    happiness: 5,
    energy: 2,
    category: 'FOOD',
    icon: 'Candy',
    description: 'Premium dark chocolate bar packed with mood-boosting polyphenols.'
  },
  {
    id: 'chips',
    name: 'Chips',
    price: 50,
    happiness: 3,
    energy: 1,
    category: 'FOOD',
    icon: 'Cookie',
    description: 'Crispy salted potato chips for quick munching between classes.'
  },
  {
    id: 'sandwich',
    name: 'Sandwich',
    price: 120,
    happiness: 4,
    energy: 5,
    category: 'FOOD',
    icon: 'Sandwich',
    description: 'Grilled three-tier club sandwich with melted cheese and fresh veggies.'
  },
  {
    id: 'juice',
    name: 'Juice',
    price: 70,
    happiness: 2,
    energy: 4,
    category: 'DRINK',
    icon: 'GlassWater',
    description: 'Cold-pressed Valencia orange juice bursting with natural Vitamin C.'
  },
  {
    id: 'movie',
    name: 'Movie',
    price: 250,
    happiness: 15,
    energy: -10,
    category: 'ENTERTAINMENT',
    icon: 'Film',
    description: 'Late night IMAX movie premiere with theater popcorn and fellow classmates.'
  },
  {
    id: 'video_game',
    name: 'Video Game',
    price: 500,
    happiness: 12,
    energy: -8,
    category: 'ENTERTAINMENT',
    icon: 'Gamepad2',
    description: 'An exciting cooperative esports session that keeps you hooked till midnight.'
  }
];

export const RANDOM_EVENTS = [
  {
    id: 'found_money',
    title: 'Pocket Surprise!',
    description: 'You found ₹100 tucked inside your old college jacket pocket!',
    badge: '+₹100 Cash',
    type: 'positive',
    apply: (state) => ({
      money: state.money + 100,
      delta: { money: 100 }
    })
  },
  {
    id: 'friend_happy',
    title: 'Wholesome Hangout',
    description: 'A close campus friend shared great memes and cheered you up!',
    badge: '+10 Happiness',
    type: 'positive',
    apply: (state) => ({
      happiness: Math.min(100, state.happiness + 10),
      delta: { happiness: 10 }
    })
  },
  {
    id: 'stressful_day',
    title: 'Surprise Test & Deadlines',
    description: 'An unexpected pop-quiz and stacked assignments caused a stressful day.',
    badge: '-8 Happiness',
    type: 'negative',
    apply: (state) => ({
      happiness: Math.max(0, state.happiness - 8),
      delta: { happiness: -8 }
    })
  },
  {
    id: 'friend_coffee',
    title: 'Free Coffee Treat!',
    description: 'Someone noticed you studying hard and bought you an espresso!',
    badge: '+5 Energy, +5 Happiness',
    type: 'positive',
    apply: (state) => ({
      energy: Math.min(100, state.energy + 5),
      happiness: Math.min(100, state.happiness + 5),
      delta: { energy: 5, happiness: 5 }
    })
  },
  {
    id: 'routine_day',
    title: 'Quiet Serenity',
    description: 'Nothing unusual happened today. Just smooth, peaceful campus life.',
    badge: 'Neutral',
    type: 'neutral',
    apply: (state) => ({
      delta: {}
    })
  }
];

export const LIFE_STAGE_DETAILS = {
  CHILD: {
    label: 'Childhood Years',
    badgeClass: 'badge-blue',
    description: 'Young and curious, absorbing the world with wonder.'
  },
  STUDENT: {
    label: 'College Student',
    badgeClass: 'badge-purple',
    description: 'Balancing academics, friendships, coffee, and late night code.'
  },
  WORKING: {
    label: 'Young Professional',
    badgeClass: 'badge-emerald',
    description: 'Navigating the career ladder and financial independence.'
  },
  RETIRED: {
    label: 'Senior Emeritus',
    badgeClass: 'badge-amber',
    description: 'Cherishing a rich lifetime of experiences in peaceful comfort.'
  }
};
