/**
 * 音频配置：后续拿到音乐素材后，只需要在这里填写文件路径。
 *
 * 文件约定放在 frontend/public/assets/audio/ 下，例如：
 *   /assets/audio/music/battle.mp3
 *   /assets/audio/sfx/hit.mp3
 */

export type MusicKey = "menu" | "training" | "battle" | "boss" | "fxTest";

export type SfxKey =
  | "click"
  | "draw"
  | "place"
  | "upgrade"
  | "recycle"
  | "synthesize"
  | "farm"
  | "hit"
  | "melee"
  | "spear"
  | "bow"
  | "cavalry"
  | "general_liubei"
  | "general_zhaoyun"
  | "general_guanyu"
  | "lubu_attack"
  | "lubu_skill1"
  | "lubu_skill2"
  | "diaochan_attack"
  | "diaochan_skill1"
  | "diaochan_skill2"
  | "general_death"
  | "lubu_death"
  | "diaochan_death"
  | "caocao_death"
  | "wei_hit"
  | "zombie_bite"
  | "boss_warning"
  | "game_over";

export const MUSIC_FILES: Record<MusicKey, string> = {
  menu: "",
  training: "",
  battle: "",
  boss: "",
  fxTest: "",
};

export const SFX_FILES: Record<SfxKey, string> = {
  click: "/game/baoweiadou/audio/sfx/button.wav",
  draw: "/game/baoweiadou/audio/sfx/slider.wav",
  place: "/game/baoweiadou/audio/sfx/checkbox.wav",
  upgrade: "",
  recycle: "/game/baoweiadou/audio/sfx/receive.wav",
  synthesize: "/game/baoweiadou/audio/sfx/bell.wav",
  farm: "/game/baoweiadou/audio/sfx/gold.ogg",
  hit: "",
  melee: "/game/baoweiadou/audio/sfx/刀兵.ogg",
  spear: "/game/baoweiadou/audio/sfx/枪兵.ogg",
  bow: "/game/baoweiadou/audio/sfx/弓兵.ogg",
  cavalry: "/game/baoweiadou/audio/sfx/骑兵.wav",
  general_liubei: "/game/baoweiadou/audio/sfx/刘备的普攻.ogg",
  general_zhaoyun: "/game/baoweiadou/audio/sfx/赵云攻击特效.wav",
  general_guanyu: "/game/baoweiadou/audio/sfx/关羽普攻.ogg",
  lubu_attack: "/game/baoweiadou/audio/sfx/吕布的普通攻击.wav",
  lubu_skill1: "/game/baoweiadou/audio/sfx/吕布一技能.ogg",
  lubu_skill2: "/game/baoweiadou/audio/sfx/吕布技能2.ogg",
  diaochan_attack: "/game/baoweiadou/audio/sfx/貂蝉普攻.ogg",
  diaochan_skill1: "/game/baoweiadou/audio/sfx/貂蝉技能1.wav",
  diaochan_skill2: "/game/baoweiadou/audio/sfx/貂蝉的技能2.wav",
  general_death: "/game/baoweiadou/audio/sfx/human-die-1.ogg",
  lubu_death: "/game/baoweiadou/audio/sfx/ogre-die-1.ogg",
  diaochan_death: "/game/baoweiadou/audio/sfx/human-female-die-1.ogg",
  caocao_death: "/game/baoweiadou/audio/sfx/human-old-die-1.ogg",
  wei_hit: "/game/baoweiadou/audio/sfx/魏兵撞到目标后.ogg",
  zombie_bite: "/game/baoweiadou/audio/sfx/zombie-attack.wav",
  boss_warning: "/game/baoweiadou/audio/sfx/horn-1.ogg",
  game_over: "/game/baoweiadou/audio/sfx/wail-sml.wav",
};
