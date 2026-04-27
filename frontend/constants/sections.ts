export const SECTIONS = [
  "Kisumu Central Section",
  "Kondele Section",
  "Nakuru Town Section",
  "Eldoret Town Section",
  "Thika Section",
  "Nyeri Town Section",
  "Machakos Town Section",
  "Kitale Town Section",
  "Malindi Section",
  "Kericho Town Section",
  "Nairobi CBD Section",
  "Eastlands Section",
  "Bungoma Town Section",
  "Nyali Section",
  "Kakamega Town Section",
  "Kisauni Section",
] as const;

export type Section = (typeof SECTIONS)[number];
