// ClearPath — canonical word list definitions
// Single source of truth loaded by both content.js (via manifest) and popup.html.
// DO NOT duplicate this in content.js or popup.js.

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
      "liquor", "liqueur", "liqueurs",
      "whiskey", "whisky", "bourbon", "scotch", "rye whiskey",
      "vodka", "gin", "rum", "tequila", "mezcal", "brandy", "cognac",
      "cocktail", "cocktails", "mocktail", "martini", "margarita", "mimosa", "bloody mary", "daiquiri",
      "bartender", "mixologist", "happy hour", "last call",
      "drunk", "buzzed", "tipsy", "sober curious",
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
      "cocaine",
      "heroin", "opioid", "opiate", "fentanyl", "oxycodone", "hydrocodone", "percocet", "vicodin",
      "meth", "methamphetamine", "crystal meth",
      "marijuana", "cannabis", "weed", "edibles", "thc", "dispensary", "high on",
      "ecstasy", "mdma", "molly",
      "lsd", "shrooms", "psilocybin",
      "ketamine", "xanax", "adderall", "benzodiazepine",
      "drug use", "drug abuse", "drug addiction",
      "getting high",
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
