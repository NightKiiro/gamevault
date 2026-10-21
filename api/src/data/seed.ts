import { GameInput } from "../models/game";
import { steamArt } from "../covers/steam";

export const SEED_GAMES: GameInput[] = [
  { title: "Hades", platform: "PC", genre: "Roguelike", completed: true, rating: 9.5, releaseYear: 2020, hoursPlayed: 85, ...steamArt(1145360) },
  { title: "Celeste", platform: "Switch", genre: "Plateforme", completed: true, rating: 9, releaseYear: 2018, hoursPlayed: 30, ...steamArt(504230) },
  { title: "Elden Ring", platform: "PS5", genre: "Action RPG", completed: false, rating: 9.5, releaseYear: 2022, hoursPlayed: 120, ...steamArt(1245620) },
  { title: "Stardew Valley", platform: "PC", genre: "Simulation", completed: false, rating: 8.5, releaseYear: 2016, hoursPlayed: 64, ...steamArt(413150) },
  { title: "Hollow Knight", platform: "Switch", genre: "Metroidvania", completed: true, rating: 9, releaseYear: 2017, hoursPlayed: 45, ...steamArt(367520) },
  { title: "Outer Wilds", platform: "PC", genre: "Exploration", completed: false, rating: 10, releaseYear: 2019, ...steamArt(753640) },
];
