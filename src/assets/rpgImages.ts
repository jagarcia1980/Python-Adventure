import dungeonCrawlImg from './images/rpg_dungeon_crawl_1789305163473.jpg';
import armoryWeaponsImg from './images/rpg_armory_weapons_1789305184265.jpg';
import treasureLootImg from './images/rpg_treasure_loot_1789305199227.jpg';
import crystalMinesImg from './images/rpg_crystal_mines_1789305214522.jpg';
import dragonBossImg from './images/rpg_dragon_boss_1789305229646.jpg';

import heroWarriorImg from './images/hero_warrior_1789308944279.jpg';
import goblinGuardImg from './images/goblin_guard_1789308954952.jpg';
import dragonAvatarImg from './images/dragon_boss_1789308967871.jpg';
import treasureChestImg from './images/treasure_chest_1789308979479.jpg';
import runicGateImg from './images/runic_gate_1789309001323.jpg';

export const RPG_IMAGES = {
  dungeonCrawl: dungeonCrawlImg,
  armoryWeapons: armoryWeaponsImg,
  treasureLoot: treasureLootImg,
  crystalMines: crystalMinesImg,
  dragonBoss: dragonBossImg,
  heroWarrior: heroWarriorImg,
  goblinGuard: goblinGuardImg,
  dragonAvatar: dragonAvatarImg,
  treasureChest: treasureChestImg,
  runicGate: runicGateImg,
};

export const WORLD_RPG_ART: Record<string, { image: string; tag: string; caption: string }> = {
  world_1: {
    image: dungeonCrawlImg,
    tag: 'Acto I: Mazmorras de Algoritmia',
    caption: 'Exploración de la cripta ancestral: traza la ruta segura para salir de la mazmorra y recoger gemas de maná.',
  },
  world_2: {
    image: armoryWeaponsImg,
    tag: 'Acto II: La Armería y la Guardia',
    caption: 'Evaluación táctica: selecciona el arma óptima y decide el paso en las compuertas blindadas.',
  },
  world_3: {
    image: crystalMinesImg,
    tag: 'Acto III: Las Minas Subterráneas',
    caption: 'Automatización de picos mágicos en los túneles enanos mientras dure la antorcha o la batería rúnica.',
  },
  world_4: {
    image: treasureLootImg,
    tag: 'Acto IV: El Inventario del Héroe',
    caption: 'Gestión de la mochila de aventurero: añadir tesoros (.append), purgar venenos (.remove) y abrir cofres.',
  },
  world_5: {
    image: dragonBossImg,
    tag: 'Acto V: El Dragón Ancestral',
    caption: 'Hechizos modulares y tiradas críticas: programa tus funciones de combate para el asalto final.',
  },
};
