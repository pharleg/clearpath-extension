// ClearPath — canonical word list definitions
// Single source of truth loaded by both content.js (via manifest) and popup.html.
// DO NOT duplicate this in content.js or popup.js.

// Words that confirm drug/alcohol context when found near an ambiguous match.
// Checked against the nearest block-level ancestor's full textContent.
const CONTEXT_SIGNALS = {
  drugs: [
    "smoke", "smoked", "smoking", "high", "dealer", "stash", "pipe", "bong",
    "joint", "blunt", "snort", "inject", "needle", "rehab", "addiction",
    "drug", "drugs", "substance", "cannabis", "marijuana", "weed", "thc",
    "overdose", "detox", "withdrawal", "narcotic", "illegal", "street drug",
    "recreational", "psychedelic", "hallucin"
  ],
  alcohol: [
    "drink", "drinking", "drunk", "bar", "pub", "glass", "bottle", "pour",
    "sip", "hangover", "cheers", "brewery", "wine", "beer", "cocktail",
    "liquor", "booze", "intoxicat", "alcohol", "distill"
  ]
};

// Ambiguous words that are only filtered when CONTEXT_SIGNALS for their
// category appear in the surrounding text. Confident words (not listed here)
// are always filtered regardless of context.
const AMBIGUOUS_WORDS = {
  drugs: ["pot", "acid", "wasted", "tripping", "mushrooms", "coke", "stoned"],
  alcohol: ["spirits", "hammered", "wasted"]
};

const DEFAULT_WORD_LISTS = {
  alcohol: {
    label: "Alcohol",
    enabled: true,
    words: [
      "alcohol", "alcoholic", "alcoholism",
      "beer", "lager", "ale", "craft beer", "brew", "brewery", "brewpub",
      "wine", "wines", "winery", "wineries", "vineyard", "vineyards",
      "champagne", "prosecco", "rosé", "rose wine", "pinot", "merlot", "cabernet", "chardonnay",
      "sauvignon", "riesling", "zinfandel", "syrah", "shiraz", "grenache",
      "spirits", "liquor", "liqueur", "liqueurs",
      "whiskey", "whisky", "bourbon", "scotch", "rye whiskey",
      "vodka", "gin", "rum", "tequila", "mezcal", "brandy", "cognac",
      "cocktail", "cocktails", "mocktail", "martini", "margarita", "mimosa", "bloody mary", "daiquiri",
      "bartender", "mixologist", "happy hour", "last call",
      "drunk", "buzzed", "tipsy", "wasted", "hammered", "sober curious",
      "drinking", "booze", "boozy", "intoxicated",
      "shot glass", "nightcap", "chaser",
      "keg", "six-pack", "six pack",
      "wine tasting", "wine review", "wine pairing", "beer garden", "taproom", "distillery",
      "beers", "ales", "brews", "breweries"
    ]
  },
  drugs: {
    label: "Drugs & Substances",
    enabled: true,
    words: [
      "cocaine", "coke",
      "heroin", "opioid", "opiate", "fentanyl", "oxycodone", "hydrocodone", "percocet", "vicodin",
      "meth", "methamphetamine", "crystal meth",
      "marijuana", "cannabis", "weed", "pot", "edibles", "thc", "dispensary", "high on",
      "ecstasy", "mdma", "molly",
      "lsd", "acid", "mushrooms", "shrooms", "psilocybin",
      "ketamine", "xanax", "adderall", "benzodiazepine",
      "drug use", "drug abuse", "drug addiction",
      "getting high", "stoned", "tripping",
      "overdose", "od'd"
    ]
  },
  gambling: {
    label: "Gambling",
    enabled: false,
    words: [
      "casino", "gambling", "sports betting", "bet on", "place a bet",
      "poker", "blackjack", "slot machine", "slots",
      "lottery", "scratch ticket",
      "sportsbook", "odds on", "wager"
    ]
  },
  custom: {
    label: "Custom",
    enabled: true,
    words: []
  }
};
