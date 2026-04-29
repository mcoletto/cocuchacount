/**
 * REIMPORT COMPLETO
 * Borra TODOS los registros existentes e importa el dataset corregido.
 */

import { PrismaClient } from "@prisma/client";
import type { FormatType, DrinkType, DatePrecision } from "@prisma/client";

const prisma = new PrismaClient();

interface Entry {
  quantity: number;
  format: FormatType;
  formatOther?: string;
  drinkType: DrinkType;
  mlOverride?: number;
  datePrecision: DatePrecision;
  month: number;
  year: number;
  country: string;
  place?: string;
  sharedWith?: string[];
  notes: string;
}

const MO = (month: number, year: number, country: string): Pick<Entry, "month" | "year" | "country" | "datePrecision"> => ({
  month, year, country, datePrecision: "MONTH_ONLY",
});

const AR = "Argentina";
const UY = "Uruguay";
const BR = "Brasil";
const US = "Estados Unidos";

const ENTRIES: Entry[] = [

  // ══════════════════════════════════════════
  // ENERO 2026 - BRASIL
  // ══════════════════════════════════════════
  { ...MO(1,2026,BR), quantity:1, format:"MC",             drinkType:"COMUN",                            notes:"1 coca Mc" },
  { ...MO(1,2026,BR), quantity:1, format:"BOTELLA_VIDRIO", drinkType:"COMUN", mlOverride:300,             notes:"1 botella de vidrio 300ml" },
  { ...MO(1,2026,BR), quantity:1, format:"BOTELLA_VIDRIO", drinkType:"COMUN", mlOverride:300, sharedWith:["fede"], notes:"1 botella de vidrio 300ml con fede" },
  { ...MO(1,2026,BR), quantity:2, format:"VASO",           drinkType:"COMUN",                            notes:"2 vasos de coca" },
  { ...MO(1,2026,BR), quantity:1, format:"VASO",           drinkType:"COMUN",                            notes:"1 vaso de coca" },
  { ...MO(1,2026,BR), quantity:1, format:"VASO",           drinkType:"COMUN", sharedWith:["vicu"],        notes:"1 vaso de coca con vicu" },
  { ...MO(1,2026,BR), quantity:1, format:"LATA",           drinkType:"COMUN", mlOverride:350,             notes:"1 lata de coca 350" },
  { ...MO(1,2026,BR), quantity:1, format:"LATA",           drinkType:"COMUN", mlOverride:350, sharedWith:["fede"], notes:"1 lata de coca 350 con fede" },
  { ...MO(1,2026,BR), quantity:6, format:"VASO",           drinkType:"COMUN",                            notes:"6 vasos de coca" },
  { ...MO(1,2026,BR), quantity:1, format:"LATA",           drinkType:"COMUN",                            notes:"1 lata de coca" },
  { ...MO(1,2026,BR), quantity:2, format:"VASO",           drinkType:"COMUN",                            notes:"2 vasos de coca" },
  { ...MO(1,2026,BR), quantity:1, format:"MC",             drinkType:"COMUN",                            notes:"1 coca de mc" },
  { ...MO(1,2026,BR), quantity:1, format:"MC",             drinkType:"COMUN",                            notes:"1 coca de mc" },
  { ...MO(1,2026,BR), quantity:1, format:"MC",             drinkType:"COMUN", sharedWith:["vicu","fede"], notes:"1 coca de mc con vicu y fede" },
  { ...MO(1,2026,BR), quantity:2, format:"VASO",           drinkType:"COMUN", sharedWith:["fede"],        notes:"2 vasos de coca con fede" },
  { ...MO(1,2026,BR), quantity:1, format:"LATA",           drinkType:"COMUN",                            notes:"1 lata de coca" },

  // ══════════════════════════════════════════
  // ENERO 2026 - URUGUAY
  // ══════════════════════════════════════════
  { ...MO(1,2026,UY), quantity:1, format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:2, format:"VASO",           drinkType:"COMUN", notes:"2 vasos de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"VASO",           drinkType:"COMUN", notes:"1 vaso de coca" },
  { ...MO(1,2026,UY), quantity:2, format:"VASO",           drinkType:"COMUN", notes:"2 vasos de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1, format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1, format:"VASO",           drinkType:"COMUN", notes:"1 vaso de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"VASO",           drinkType:"COMUN", notes:"1 vaso de coca" },
  { ...MO(1,2026,UY), quantity:2, format:"VASO",           drinkType:"COMUN", notes:"2 vasos de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"VASO",           drinkType:"COMUN", notes:"1 vaso de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:3, format:"VASO",           drinkType:"COMUN", notes:"3 vasos de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1, format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1, format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:2, format:"VASO",           drinkType:"COMUN", notes:"2 vasos de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1, format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 botella de vidrio" },

  // ══════════════════════════════════════════
  // ENERO 2026 - ARGENTINA
  // ══════════════════════════════════════════
  { ...MO(1,2026,AR), quantity:1, format:"MC",             drinkType:"COMUN", notes:"1 coca de mc" },

  // ══════════════════════════════════════════
  // ENERO 2026 - URUGUAY (cont.)
  // ══════════════════════════════════════════
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1,   format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1,   format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1,   format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1,   format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"BOTELLA_PLASTICA", drinkType:"PEPSI",  notes:"1 pepsi chica" },
  { ...MO(1,2026,UY), quantity:0.5, format:"LATA",           drinkType:"COMUN", notes:"1/2 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:4,   format:"VASO",           drinkType:"COMUN", notes:"4 vasos de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"LATA",           drinkType:"COMUN", notes:"1 lata de coca" },
  { ...MO(1,2026,UY), quantity:1,   format:"BOTELLA_VIDRIO", drinkType:"COMUN", notes:"1 coca de vidrio" },
  { ...MO(1,2026,UY), quantity:1,   format:"VASO",           drinkType:"COMUN", notes:"1 vaso de coca" },

  // ══════════════════════════════════════════
  // FEBRERO 2026 - URUGUAY
  // ══════════════════════════════════════════
  { ...MO(2,2026,UY), quantity:1, format:"VASO",            drinkType:"COMUN",              notes:"1 vaso de coca" },
  { ...MO(2,2026,UY), quantity:1, format:"VASO",            drinkType:"COMUN",              notes:"1 vaso de coca" },
  { ...MO(2,2026,UY), quantity:1, format:"BOTELLA_PLASTICA",drinkType:"COMUN", mlOverride:500, notes:"1 botella de coca 500ml" },
  { ...MO(2,2026,UY), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",              notes:"1 coca de vidrio" },
  { ...MO(2,2026,UY), quantity:1, format:"LATA",            drinkType:"COMUN",              notes:"1 lata de coca" },
  { ...MO(2,2026,UY), quantity:1, format:"LATA",            drinkType:"COMUN",              notes:"1 lata de coca" },
  { ...MO(2,2026,UY), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",              notes:"1 coca de vidrio" },

  // ══════════════════════════════════════════
  // FEBRERO 2026 - ARGENTINA
  // ══════════════════════════════════════════
  { ...MO(2,2026,AR), quantity:1, format:"LATA",            drinkType:"COMUN",                            notes:"1 lata de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"LATA",            drinkType:"COMUN", sharedWith:["fede"],        notes:"1 lata de coca con fede" },
  { ...MO(2,2026,AR), quantity:1, format:"VASO",            drinkType:"COMUN",                            notes:"1 vaso de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"VASO",            drinkType:"COMUN",                            notes:"1 vaso de coca" },
  { ...MO(2,2026,AR), quantity:2, format:"VASO",            drinkType:"COMUN",                            notes:"2 vasos de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"VASO",            drinkType:"COMUN", place:"avión",              notes:"1 vaso de coca en el avion" },
  { ...MO(2,2026,AR), quantity:2, format:"VASO",            drinkType:"ZERO",                             notes:"2 vasos de coca ZERO" },
  { ...MO(2,2026,AR), quantity:4, format:"VASO",            drinkType:"COMUN",                            notes:"4 vasos de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"VASO",            drinkType:"COMUN",                            notes:"1 vaso de coca" },
  { ...MO(2,2026,AR), quantity:2, format:"VASO",            drinkType:"COMUN",                            notes:"2 vasos de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"BOTELLA_PLASTICA",drinkType:"COMUN", mlOverride:375,             notes:"1 botella de coca 375ml" },
  { ...MO(2,2026,AR), quantity:1, format:"VASO",            drinkType:"COMUN",                            notes:"1 vaso de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"VASO",            drinkType:"COMUN",                            notes:"1 vaso de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"VASO",            drinkType:"COMUN", place:"avión",              notes:"1 vaso de coca en el avion" },
  { ...MO(2,2026,AR), quantity:1, format:"MC",              drinkType:"COMUN",                            notes:"1 coca de mc" },
  { ...MO(2,2026,AR), quantity:2, format:"LATA",            drinkType:"COMUN", sharedWith:["fede"],        notes:"2 latas de coca con fede" },
  { ...MO(2,2026,AR), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                            notes:"1 coca de vidrio" },
  { ...MO(2,2026,AR), quantity:2, format:"VASO",            drinkType:"COMUN",                            notes:"2 vasos de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                            notes:"1 coca de vidrio" },
  { ...MO(2,2026,AR), quantity:1, format:"LATA",            drinkType:"COMUN", sharedWith:["fede"],        notes:"1 lata de coca con fede" },
  { ...MO(2,2026,AR), quantity:1, format:"VASO",            drinkType:"COMUN",                            notes:"1 vaso de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"VASO",            drinkType:"COMUN", sharedWith:["fede"],        notes:"1 vaso de coca con fede" },
  { ...MO(2,2026,AR), quantity:1, format:"VASO",            drinkType:"COMUN",                            notes:"1 vaso de coca" },
  { ...MO(2,2026,AR), quantity:4, format:"VASO",            drinkType:"COMUN",                            notes:"4 vasos de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"LATA",            drinkType:"COMUN", mlOverride:220,             notes:"1 lata de coca chiquita" },
  { ...MO(2,2026,AR), quantity:4, format:"VASO",            drinkType:"PEPSI",                            notes:"4 vasos de pepsi black" },
  { ...MO(2,2026,AR), quantity:1, format:"VASO",            drinkType:"COMUN",                            notes:"1 vaso de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                            notes:"1 coca de vidrio" },
  { ...MO(2,2026,AR), quantity:1, format:"LATA",            drinkType:"COMUN",                            notes:"1 lata de coca" },
  { ...MO(2,2026,AR), quantity:3, format:"VASO",            drinkType:"COMUN",                            notes:"3 vasos de coca" },
  { ...MO(2,2026,AR), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                            notes:"1 coca de vidrio" },
  { ...MO(2,2026,AR), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN", sharedWith:["fede"],        notes:"1 coca de vidrio con fede" },
  { ...MO(2,2026,AR), quantity:4, format:"LATA",            drinkType:"COMUN", sharedWith:["fede"],        notes:"4 latas de coca con fede" },

  // ══════════════════════════════════════════
  // FEBRERO 2026 - ESTADOS UNIDOS
  // ══════════════════════════════════════════
  { ...MO(2,2026,US), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                notes:"1 coca de vidrio" },
  { ...MO(2,2026,US), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN", mlOverride:237, notes:"1 coca de vidrio chiquita" },
  { ...MO(2,2026,US), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                notes:"1 coca de vidrio" },
  { ...MO(2,2026,US), quantity:2, format:"MAQUINA",         drinkType:"COMUN", place:"Shake Shack", notes:"2 cocas de maquina en Shake Shack" },
  { ...MO(2,2026,US), quantity:1, format:"LATA",            drinkType:"COMUN",                notes:"1 lata de coca" },
  { ...MO(2,2026,US), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                notes:"1 coca de vidrio" },
  { ...MO(2,2026,US), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                notes:"1 coca de vidrio" },
  { ...MO(2,2026,US), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                notes:"1 coca de vidrio" },
  { ...MO(2,2026,US), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                notes:"1 coca de vidrio" },
  { ...MO(2,2026,US), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN", mlOverride:237, notes:"1 coca de vidrio chiquita" },
  { ...MO(2,2026,US), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                notes:"1 coca de vidrio" },
  { ...MO(2,2026,US), quantity:3, format:"MAQUINA",         drinkType:"COMUN", place:"Pastis", notes:"3 cocas de maquina en Pastis" },
  { ...MO(2,2026,US), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                notes:"1 coca de vidrio" },

  // ══════════════════════════════════════════
  // MARZO 2026 - ESTADOS UNIDOS
  // ══════════════════════════════════════════
  { ...MO(3,2026,US), quantity:1, format:"LATA",    drinkType:"COMUN",                                      notes:"1 lata de coca" },
  { ...MO(3,2026,US), quantity:1, format:"BOTELLA_VIDRIO", drinkType:"COMUN",                               notes:"1 coca de vidrio" },
  { ...MO(3,2026,US), quantity:1, format:"BOTELLA_VIDRIO", drinkType:"COMUN",                               notes:"1 coca de vidrio" },
  { ...MO(3,2026,US), quantity:2, format:"MAQUINA", drinkType:"COMUN", place:"",                            notes:"2 cocas de maquina grande" },
  { ...MO(3,2026,US), quantity:1, format:"MAQUINA", drinkType:"COMUN", place:"Disney Epcot",                notes:"1 coca de maquina grande en Disney Epcot" },
  { ...MO(3,2026,US), quantity:2, format:"MAQUINA", drinkType:"COMUN", place:"Disney Epcot",                notes:"2 cocas de maquina medianas en Disney Epcot" },
  { ...MO(3,2026,US), quantity:2, format:"MAQUINA", drinkType:"COMUN", place:"Disney Animal Kingdom",       notes:"2 cocas de maquina medianas en Disney Animal Kingdom" },
  { ...MO(3,2026,US), quantity:1, format:"MAQUINA", drinkType:"COMUN", place:"Disney Springs",              notes:"1 coca de maquina chica en Disney Springs" },
  { ...MO(3,2026,US), quantity:2, format:"MAQUINA", drinkType:"COMUN", place:"Summerhouse on the Lake",     notes:"2 cocas de maquina en Summerhouse on the Lake" },
  { ...MO(3,2026,US), quantity:3, format:"MAQUINA", drinkType:"COMUN", place:"Universal Studios",           notes:"3 cocas de maquina en Universal" },
  { ...MO(3,2026,US), quantity:1, format:"MAQUINA", drinkType:"COMUN", place:"Antojitos",                   notes:"1 coca de maquina en Antojitos" },
  { ...MO(3,2026,US), quantity:1, format:"MAQUINA", drinkType:"COMUN", place:"Disney Hollywood Studios",    notes:"1 coca de maquina grande en Disney Hollywood Studios" },
  { ...MO(3,2026,US), quantity:1, format:"OTRO",    drinkType:"COMUN", place:"Disney Hollywood Studios",    notes:"frozen slushi coke en Hollywood Studios" },
  { ...MO(3,2026,US), quantity:1, format:"MAQUINA", drinkType:"COMUN", place:"Disney Hollywood Studios",    notes:"1 coca de maquina grande en Disney Hollywood Studios" },
  { ...MO(3,2026,US), quantity:2, format:"MAQUINA", drinkType:"COMUN", place:"Disney Magic Kingdom",        notes:"2 cocas de maquina medianas en Disney Magic Kingdom" },
  { ...MO(3,2026,US), quantity:2, format:"MAQUINA", drinkType:"COMUN", place:"Universal Studios",           notes:"2 cocas de maquina en Universal" },
  { ...MO(3,2026,US), quantity:2, format:"MAQUINA", drinkType:"COMUN", place:"Planet Hollywood",            notes:"2 cocas de maquina en Planet Hollywood" },
  { ...MO(3,2026,US), quantity:1, format:"LATA",    drinkType:"COMUN",                                      notes:"1 lata de coca" },
  { ...MO(3,2026,US), quantity:2, format:"MAQUINA", drinkType:"COMUN", place:"Uchi",                        notes:"2 cocas de maquina chica en Uchi" },
  { ...MO(3,2026,US), quantity:1, format:"MAQUINA", drinkType:"COMUN", place:"Cheesecake Factory",          notes:"1 coca de maquina en Cheesecake Factory" },

  // ══════════════════════════════════════════
  // MARZO 2026 - ARGENTINA
  // ══════════════════════════════════════════
  { ...MO(3,2026,AR), quantity:1, format:"BOTELLA_PLASTICA", drinkType:"COMUN", mlOverride:250,              notes:"1 botella de coca chiquita" },
  { ...MO(3,2026,AR), quantity:1, format:"BOTELLA_VIDRIO",   drinkType:"COMUN",                             notes:"1 coca de vidrio" },
  { ...MO(3,2026,AR), quantity:1, format:"LATA",             drinkType:"COMUN",                             notes:"1 lata de coca" },
  { ...MO(3,2026,AR), quantity:1, format:"BOTELLA_PLASTICA", drinkType:"COMUN", mlOverride:500,              notes:"1 botella de coca 500ml" },
  { ...MO(3,2026,AR), quantity:1, format:"LATA",             drinkType:"COMUN",                             notes:"1 lata de coca" },
  { ...MO(3,2026,AR), quantity:1, format:"BOTELLA_PLASTICA", drinkType:"COMUN",                             notes:"1 botella de coca" },
  { ...MO(3,2026,AR), quantity:1, format:"MC",               drinkType:"COMUN",                             notes:"1 coca de mc" },
  { ...MO(3,2026,AR), quantity:2, format:"BOTELLA_PLASTICA", drinkType:"COMUN", mlOverride:250, sharedWith:["fede"], notes:"2 botellas chicas de coca con fede" },
  { ...MO(3,2026,AR), quantity:1, format:"BOTELLA_PLASTICA", drinkType:"COMUN", mlOverride:250,              notes:"1 botella chica de coca" },
  { ...MO(3,2026,AR), quantity:1, format:"BOTELLA_PLASTICA", drinkType:"COMUN", mlOverride:500,              notes:"1 botella de coca 500ml" },
  { ...MO(3,2026,AR), quantity:1, format:"VASO",             drinkType:"COMUN", place:"avión",               notes:"1 vaso de coca en el avion" },
  { ...MO(3,2026,AR), quantity:1, format:"LATA",             drinkType:"COMUN",                             notes:"1 lata de coca" },
  { ...MO(3,2026,AR), quantity:1, format:"LATA",             drinkType:"ZERO",                              notes:"1 lata de coca zero" },
  { ...MO(3,2026,AR), quantity:1, format:"VASO",             drinkType:"COMUN", place:"avión",               notes:"1 vaso de coca en el avion" },
  { ...MO(3,2026,AR), quantity:2, format:"LATA",             drinkType:"COMUN", sharedWith:["fede"],         notes:"2 latas de coca con fede" },
  { ...MO(3,2026,AR), quantity:2, format:"BOTELLA_PLASTICA", drinkType:"COMUN", mlOverride:250, sharedWith:["fede"], notes:"2 botellas chicas de coca con fede" },
  { ...MO(3,2026,AR), quantity:2, format:"VASO",             drinkType:"COMUN", sharedWith:["vicu"],         notes:"2 vasos de coca con vicu" },
  { ...MO(3,2026,AR), quantity:2, format:"BOTELLA_VIDRIO",   drinkType:"COMUN", sharedWith:["fede"],         notes:"2 cocas de vidrio con fede" },
  { ...MO(3,2026,AR), quantity:1, format:"LATA",             drinkType:"ZERO",  sharedWith:["fede"],         notes:"1 lata de coca zero grande con fede" },
  { ...MO(3,2026,AR), quantity:1, format:"LATA",             drinkType:"COMUN",                             notes:"1 lata de coca" },
  { ...MO(3,2026,AR), quantity:1, format:"BOTELLA_VIDRIO",   drinkType:"COMUN",                             notes:"1 coca de vidrio" },
  { ...MO(3,2026,AR), quantity:1, format:"LATA",             drinkType:"PEPSI",                             notes:"1 lata de pepsi comun" },
  { ...MO(3,2026,AR), quantity:1, format:"VASO",             drinkType:"COMUN",                             notes:"1 vaso de coca" },
  { ...MO(3,2026,AR), quantity:2, format:"VASO",             drinkType:"COMUN",                             notes:"2 vasos de coca" },
  { ...MO(3,2026,AR), quantity:4, format:"VASO",             drinkType:"COMUN", sharedWith:["fede"],         notes:"4 vasos de coca con fede" },
  { ...MO(3,2026,AR), quantity:2, format:"VASO",             drinkType:"COMUN",                             notes:"2 copas de coca" },
  { ...MO(3,2026,AR), quantity:2, format:"MAQUINA",          drinkType:"COMUN", place:"RF",                  notes:"2 vasos de coca de maquina en RF" },
  { ...MO(3,2026,AR), quantity:1, format:"LATA",             drinkType:"COMUN",                             notes:"1 lata de coca" },
  { ...MO(3,2026,AR), quantity:1, format:"LATA",             drinkType:"COMUN",                             notes:"1 lata de coca" },
  { ...MO(3,2026,AR), quantity:3, format:"LATA",             drinkType:"COMUN", sharedWith:["fede"],         notes:"3 latas de coca con fede" },
  { ...MO(3,2026,AR), quantity:2, format:"LATA",             drinkType:"PEPSI", sharedWith:["fede"],         notes:"2 latas de pepsi con fede" },
  { ...MO(3,2026,AR), quantity:3, format:"VASO",             drinkType:"COMUN",                             notes:"3 vasos de coca" },
  { ...MO(3,2026,AR), quantity:1, format:"LATA",             drinkType:"PEPSI",                             notes:"1 lata de pepsi" },
  { ...MO(3,2026,AR), quantity:3, format:"VASO",             drinkType:"COMUN",                             notes:"3 vasos de coca" },

  // ══════════════════════════════════════════
  // ABRIL 2026 - URUGUAY
  // ══════════════════════════════════════════
  { ...MO(4,2026,UY), quantity:1, format:"LATA",            drinkType:"COMUN",                            notes:"1 lata de coca" },
  { ...MO(4,2026,UY), quantity:1, format:"LATA",            drinkType:"COMUN", sharedWith:["fede"],        notes:"1 lata de coca con fede" },
  { ...MO(4,2026,UY), quantity:1, format:"LATA",            drinkType:"COMUN",                            notes:"1 lata de coca" },
  { ...MO(4,2026,UY), quantity:1, format:"BOTELLA_PLASTICA",drinkType:"PEPSI",                            notes:"1 botella de pepsi" },
  { ...MO(4,2026,UY), quantity:1, format:"LATA",            drinkType:"COMUN", sharedWith:["nacho"],       notes:"1 lata de coca con nacho" },
  { ...MO(4,2026,UY), quantity:2, format:"LATA",            drinkType:"COMUN", sharedWith:["fede"],        notes:"2 latas de coca con fede" },
  { ...MO(4,2026,UY), quantity:1, format:"LATA",            drinkType:"COMUN", sharedWith:["fede","nacho"],notes:"1 lata de coca con fede y nacho" },
  { ...MO(4,2026,UY), quantity:1, format:"BOTELLA_VIDRIO",  drinkType:"COMUN",                            notes:"1 coca de vidrio" },

];

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("🗑  Borrando todos los registros existentes...");
  await prisma.sharedEntry.deleteMany({});
  await prisma.consumo.deleteMany({});
  console.log("✓ Base de datos limpia");

  console.log(`\n💾 Importando ${ENTRIES.length} registros...`);
  let ok = 0;
  let errors = 0;

  for (const entry of ENTRIES) {
    const { sharedWith, ...data } = entry;
    try {
      await prisma.consumo.create({
        data: {
          ...data,
          consumedAt: null,
          sharedWith: sharedWith?.length
            ? { create: sharedWith.map((name) => ({ name })) }
            : undefined,
        },
      });
      ok++;
    } catch (err) {
      errors++;
      console.error(`  ✗ Error en "${entry.notes}":`, err);
    }
  }

  console.log(`\n✅ Listo: ${ok} registros creados, ${errors} errores`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
