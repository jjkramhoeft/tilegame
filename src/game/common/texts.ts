import { GEAR, POTION, WEAPON } from './common';
import { DataManager } from './data-manager';

export type LanguageCode = 'en' | 'da';

type TextParams = Record<string, string | number>;

const TEXTS = {
    //Intro Scene
    'intro.title': {
        en: "The 1st Garden - The Gardener's Apprentice",
        da: 'Den 1. Have - Gartnerens Lærling',
    },
    'intro.exit': {
        en: 'Exit',
        da: 'Afslut',
    },
    'intro.credits': {
        en: 'Credits',
        da: 'Krediteringer',
    },
    'intro.settings': {
        en: 'Settings',
        da: 'Indstillinger',
    },
    'intro.newGame': {
        en: 'New Game',
        da: 'Nyt spil',
    },
    //Setting Scene
    'settings.title': {
        en: 'Settings',
        da: 'Indstillinger',
    },
    'settings.musicVolume': {
        en: 'Music Volume',
        da: 'Musik lydniveau',
    },
    'settings.language': {
        en: 'Language',
        da: 'Sprog',
    },
    'settings.playingAs': {
        en: 'Playing as',
        da: 'Spil som',
    },
    'settings.player.adam': {
        en: 'Adam',
        da: 'Adam',
    },
    'settings.player.eve': {
        en: 'Eve',
        da: 'Eva',
    },
    'settings.difficulty': {
        en: 'Difficulty',
        da: 'Sværhedsgrad',
    },
    'settings.back': {
        en: 'Back',
        da: 'Tilbage',
    },
    'settings.language.danish': {
        en: 'Danish',
        da: 'Dansk',
    },
    'settings.language.english': {
        en: 'English',
        da: 'Engelsk',
    },
    'settings.difficulty.easy': {
        en: 'Easy',
        da: 'Let',
    },
    'settings.difficulty.hard': {
        en: 'Hard',
        da: 'Svær',
    },
    'settings.difficulty.debug': {
        en: 'Debug',
        da: 'Debug',
    },
    //Credit Scene
    'credits.title': {
        en: 'Credits',
        da: 'Krediteringer',
    },
    'credits.madeFor': {
        en: 'Made for Sunday school in 2026, inspiration: Genesis and C.S. Lewis',
        da: 'Lavet til søndagsskolen i 2026, inspiration: Første Mosebog og C.S. Lewis',
    },
    'credits.thanks': {
        en: 'Beta Testers, Supporters and Special Thanks:\nWilliam F. Eriksen & Richard D. Eriksen',
        da: 'Betatestere, hjælpere og særlig tak til:\nWilliam F. Eriksen & Richard D. Eriksen',
    },
    'credits.codeHelp': {
        en: 'Code help: GitHub Copilot, ChatGPT & Grok',
        da: 'Kodehjælp: GitHub Copilot, ChatGPT & Grok',
    },
    'credits.tutorials': {
        en: 'Phaser Tutorials: Scott Westover',
        da: 'Phaser Tutorials: Scott Westover',
    },
    'credits.graphicsMusic': {
        en: 'Graphics & Music: ComfyUI, AceStep, Flux_2-Turbo-LoRA',
        da: 'Grafik og musik: ComfyUI, AceStep, Flux_2-Turbo-LoRA',
    },
    'credits.graphicsOther': {
        en: 'Graphics Other: LPC, OpenGameArt, Itch.io',
        da: 'Grafik Andet: LPC, OpenGameArt, Itch.io',
    },
    'credits.graphicsFont': {
        en: 'Graphics Font: PixelSerif',
        da: 'Grafik Font: PixelSerif',
    },
    'credits.tokenBudget': {
        en: 'Copilot token budget: BiQ A/S',
        da: 'Copilot token budget: BiQ A/S',
    },
    'credits.humanOperator': {
        en: 'Human Operator: Jens Jakob Kramhæft',
        da: 'Menneskelig operatør: Jens Jakob Kramhæft',
    },
    'credits.back': {
        en: 'Back',
        da: 'Tilbage',
    },
    //Save UI
    'ui.save.backToMainMenu': {
        en: 'Back to Main Menu',
        da: 'Tilbage til hovedmenuen',
    },
    'ui.save.save': {
        en: 'Save',
        da: 'Gem',
    },
    'ui.save.continuePlaying': {
        en: 'Continue Playing',
        da: 'Spil videre',
    },    
    //Narrator Progression Dialog UI
    'ui.progression.continue': {
        en: 'Continue   (\'x\' or \'enter\')',
        da: 'Fortsæt   (\'x\' eller \'retur\')',
    },
    'ui.progression.gameOver': {
        en: 'Game Over',
        da: 'Spillet er slut',
    },    
    //Narrator (game progression)
    'narrator.start.intro': {
        en: '...In the beginning the earth was formless and empty...',
        da: '...I begyndelsen var jorden tomhed og øde...',
    },
    'narrator.start.youCreated': {
        en: '...God created the earth and the heavens, and you. Move carefully...',
        da: '...Gud skabte jorden og himlen, og dig. Bevæg dig forsigtigt...',
    },
    'narrator.assignment': {
        en: '...And you shall help create!, make the land, fill it with green forest and then animals. Do not let it be empty...',
        da: '...Og du skal hjælpe med at skabe; frembring landet, fyld det med grøn skov og så dyr. Lad det ikke være tomt...',
    },
    'narrator.garden.lush': {
        en: 'Fine! Your first rocks and pebbles. Practice and grow your skills. We need more than this wasteland. In time you will bring forth green fields, flowing rivers and trees.',
        da: 'Fint! Dine første klipper og småsten. Øv dig og udvikl dine færdigheder. Vi har brug for mere end denne ødemark. Med tiden vil du frembringe grønne marker, strømmende floder og træer.',
    },
    'narrator.garden.assignment': {
        en: 'Let me give you the first garden. Your assignment is to create a lush forest with many animals. If you pick an evil path you will have to face the demon.',
        da: 'Lad mig give dig den første have. Din opgave er at skabe en frodig skov med mange dyr. Hvis du vælger en ond vej, bliver du nødt til at stå ansigt til ansigt med dæmonen.',
    },
    'narrator.firstTree': {
        en: 'You added your first tree. Here, animals can thrive...',
        da: 'Du har plantet dit første træ. Her kan dyr trives...',
    },
    'narrator.firstAnimal': {
        en: 'You are not alone! Let life multiply...',
        da: 'Du er ikke alene! Lad livet formere sig...',
    },
    'narrator.gameOver': {
        en: 'Game Over...',
        da: 'Spillet er slut...',
    },
    //Chest Dialog
    'chest.empty': {
        en: 'You opened an empty chest.',
        da: 'Du åbnede en tom kiste.',
    },
    'chest.found': {
        en: 'You opened a chest and found {items}.',
        da: 'Du åbner en kiste og finder {items}.',
    },
    'chest.leave': {
        en: 'Leave',
        da: 'Luk kisten',
    },
    'chest.foundJoin': {
        en: ' and ',
        da: ' og ',
    },
    'chest.takeWeapon': {
        en: 'Take {item}',
        da: 'Tag {item}',
    },
    'chest.takeWeaponAndLeave': {
        en: 'Take {item} and leave your current {currentItem}',
        da: 'Tag {item} og læg din nuværende {currentItem}',
    },
    'chest.leaveWeapon': {
        en: 'Leave your current {currentItem}',
        da: 'Læg din nuværende {currentItem}',
    },
    'chest.takeGear': {
        en: 'Take {item}',
        da: 'Tag {item}',
    },
    'chest.takeGearAndLeave': {
        en: 'Take {item} and leave your current {currentItem}',
        da: 'Tag {item} og læg dit nuværende {currentItem}',
    },
    'chest.leaveGear': {
        en: 'Leave your current {currentItem}',
        da: 'Læg dit nuværende {currentItem}',
    },
    //Potions from chests
    'potion.fruit.found': {
        en: 'mysterious fruit from the tree of life',
        da: 'magiske frugter fra livets træ',
    },
    'potion.fruit.take': {
        en: 'Eat the fruit from the tree of life...',
        da: 'Spis frugten fra livets træ...',
    },
    'potion.fruit.repeat': {
        en: 'Eat fruit again from the tree of life...',
        da: 'Spis igen af frugten fra livets træ...',
    },
    //Gear from chests
    'gear.bare.found': {
        en: 'a piece of cloth',
        da: 'et stykke stof',
    },
    'gear.basic.found': {
        en: 'some simple clothing',
        da: 'noget simpelt tøj',
    },
    'gear.armor.found': {
        en: 'a shining armor',
        da: 'en skinnende rustning',
    },
    'gear.bare.option': {
        en: 'the piece of cloth',
        da: 'stof stykket',
    },
    'gear.basic.option': {
        en: 'the simple clothing',
        da: 'det simple tøj',
    },
    'gear.armor.option': {
        en: 'the shining armor',
        da: 'den skinnende rustning',
    },
    'gear.bare.current': {
        en: 'piece of cloth',
        da: 'stykke stof',
    },
    'gear.basic.current': {
        en: 'simple clothing',
        da: 'simple tøj',
    },
    'gear.armor.current': {
        en: 'shining armor',
        da: 'skinnende rustningssæt',
    },
    //Weapons from chests
    'weapon.dagger.found': {
        en: 'a dagger',
        da: 'en dolk',
    },
    'weapon.staff.found': {
        en: 'a staff',
        da: 'en stav',
    },
    'weapon.sword.found': {
        en: 'a sword',
        da: 'et sværd',
    },
    'weapon.dagger.option': {
        en: 'the dagger',
        da: 'dolken',
    },
    'weapon.staff.option': {
        en: 'the staff',
        da: 'staven',
    },
    'weapon.sword.option': {
        en: 'the sword',
        da: 'sablen',
    },
    'weapon.dagger.current': {
        en: 'dagger',
        da: 'dolk',
    },
    'weapon.staff.current': {
        en: 'staff',
        da: 'stav',
    },
    'weapon.sword.current': {
        en: 'sword',
        da: 'sabel',
    },
} as const;

export type TextKey = keyof typeof TEXTS;

type GearDisplayContext = 'found' | 'option' | 'current';
type WeaponDisplayContext = 'found' | 'option' | 'current';

export function getCurrentLanguage(): LanguageCode {
    return DataManager.instance.data.languageIsDanish ? 'da' : 'en';
}

export function getText(key: TextKey, params: TextParams = {}, language: LanguageCode = getCurrentLanguage()): string {
    let text: string = TEXTS[key][language] ?? TEXTS[key].en ?? `XXX-no-text-${key}-XXX`;
    Object.entries(params).forEach(([name, value]) => {
        text = text.split(`{${name}}`).join(String(value));
    });
    return text;
}

export function getPotionText(potion: string, language: LanguageCode = getCurrentLanguage()): string {
    switch (potion) {
        case POTION.FRUIT: return getText('potion.fruit.found', {}, language);
        default: return '';
    }
}

export function getGearText(gear: string, context: GearDisplayContext, language: LanguageCode = getCurrentLanguage()): string {
    switch (gear) {
        case GEAR.BARE: return getText(`gear.bare.${context}`, {}, language);
        case GEAR.BASIC: return getText(`gear.basic.${context}`, {}, language);
        case GEAR.ARMOR: return getText(`gear.armor.${context}`, {}, language);
        default: return '';
    }
}

export function getWeaponText(weapon: string, context: WeaponDisplayContext, language: LanguageCode = getCurrentLanguage()): string {
    switch (weapon) {
        case WEAPON.DAGGER: return getText(`weapon.dagger.${context}`, {}, language);
        case WEAPON.STAFF: return getText(`weapon.staff.${context}`, {}, language);
        case WEAPON.SWORD: return getText(`weapon.sword.${context}`, {}, language);
        default: return '';
    }
}

export function formatChestHeading(contents: { potion: string; gear: string; weapon: string }, language: LanguageCode = getCurrentLanguage()): string {
    const foundItems = [
        getPotionText(contents.potion, language),
        getGearText(contents.gear, 'found', language),
        getWeaponText(contents.weapon, 'found', language),
    ].filter((item) => item.length > 0);

    if (foundItems.length === 0) {
        return getText('chest.empty', {}, language);
    }

    return getText('chest.found', {
        items: foundItems.join(getText('chest.foundJoin', {}, language)),
    }, language);
}

export function formatChestPotionOption(chestPotion: string, currentPotion: string, language: LanguageCode = getCurrentLanguage()): string {
    const repeat = chestPotion === currentPotion && chestPotion.length > 0;
    if (repeat) {
        return getText('potion.fruit.repeat', {}, language);
    }
    return getText('potion.fruit.take', {}, language);
}

export function formatChestWeaponOption(chestWeapon: string, currentWeapon: string, language: LanguageCode = getCurrentLanguage()): string {
    const item = getWeaponText(chestWeapon, 'option', language);
    const currentItem = getWeaponText(currentWeapon, 'current', language);

    if (item && currentItem) {
        return getText('chest.takeWeaponAndLeave', { item, currentItem }, language);
    }
    if (item) {
        return getText('chest.takeWeapon', { item }, language);
    }
    if (currentItem) {
        return getText('chest.leaveWeapon', { currentItem }, language);
    }
    return '';
}

export function formatChestGearOption(chestGear: string, currentGear: string, language: LanguageCode = getCurrentLanguage()): string {
    const item = getGearText(chestGear, 'option', language);
    const currentItem = getGearText(currentGear, 'current', language);

    if (item && currentItem) {
        return getText('chest.takeGearAndLeave', { item, currentItem }, language);
    }
    if (item) {
        return getText('chest.takeGear', { item }, language);
    }
    if (currentItem) {
        return getText('chest.leaveGear', { currentItem }, language);
    }
    return '';
}
