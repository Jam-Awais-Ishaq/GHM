/**
 * Extra tokens for suburb / area nicknames (matched against normalized haystack).
 * Key: single normalized word from user query. Value: phrase that must be findable in haystack.
 */
export const LOCATION_SEARCH_ALIASES: Record<string, string> = {
  cbd: "brisbane city",
  city: "brisbane city",
  valley: "fortitude valley",
  "fortitude": "fortitude valley",
  southbank: "south bank",
  westend: "west end",
  kangaroo: "kangaroo point",
  newfarm: "new farm",
  paddington: "paddington",
  redhill: "red hill",
  fairfield: "fairfield",
  annerley: "annerley",
  woolloongabba: "woolloongabba",
  stlucia: "st lucia",
  toowong: "toowong",
  chermside: "chermside",
  ipswich: "ipswich",
};
