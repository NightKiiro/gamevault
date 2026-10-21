import { GameInput } from "../models/game";

export const SEED_GAMES: GameInput[] = [
  { title: "Hades", platform: "PC", genre: "Roguelike", completed: true, rating: 9.5, releaseYear: 2020, hoursPlayed: 85 },
  { title: "Celeste", platform: "Switch", genre: "Platformer", completed: true, rating: 9, releaseYear: 2018, hoursPlayed: 30 },
  { title: "Elden Ring", platform: "PS5", genre: "Action RPG", completed: false, rating: 9.5, releaseYear: 2022, hoursPlayed: 120 },
  { title: "Stardew Valley", platform: "PC", genre: "Simulation", completed: false, rating: 8.5, releaseYear: 2016 },
  { title: "Hollow Knight", platform: "Switch", genre: "Metroidvania", completed: true, rating: 9, releaseYear: 2017, hoursPlayed: 45 },
];
