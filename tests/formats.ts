// Formats parser test

"use strict";

import assert from "assert";

import { parsePokemonShowdownFormats } from "../src/formats";

function sortById(a, b): number {
    if (a[0] < b[0]) {
        return -1;
    } else {
        return 1;
    }
}

describe("Formats parser", () => {
    const formatsString = ",1|S/V Singles|[Gen 9] Random Battle,f|[Gen 9] Unrated Random Battle,b|[Gen 9] Free-For-All Random Battle,7|[Gen 9] Random Battle (Blitz),f|[Gen 9] Multi Random Battle,5|[Gen 9] OU,e|[Gen 9] Ubers,e|[Gen 9] UU,e|[Gen 9] RU,e|[Gen 9] NU,e|[Gen 9] PU,e|[Gen 9] LC,e|[Gen 9] Monotype,e|[Gen 9] Monothreat Water,c|[Gen 9] 1v1,e|[Gen 9] Anything Goes,e|[Gen 9] NFE,e|[Gen 9] ZU,e|[Gen 9] LC UU,c|[Gen 9] CAP,e|[Gen 9] Free-For-All,6|[Gen 9] Battle Stadium Singles Regulation C,1c|[Gen 9] Battle Stadium Singles Regulation D,1e|[Gen 9] Custom Game,c|,1|S/V Doubles|[Gen 9] Random Doubles Battle,f|[Gen 9] Doubles OU,e|[Gen 9] Doubles Ubers,e|[Gen 9] Doubles UU,e|[Gen 9] Doubles LC,e|[Gen 9] 2v2 Doubles,e|[Gen 9] VGC 2023 Regulation C,1c|[Gen 9] VGC 2023 Regulation D,1e|[Gen 9] Doubles Custom Game,c|,1|National Dex|[Gen 9] National Dex,e|[Gen 9] National Dex Ubers,e|[Gen 9] National Dex UU,e|[Gen 9] National Dex RU,c|[Gen 9] National Dex Monotype,e|[Gen 9] National Dex Doubles,e|[Gen 9] National Dex AG,c|[Gen 9] National Dex BH,c|[Gen 8] National Dex,e|[Gen 8] National Dex UU,c|[Gen 8] National Dex Monotype,c|,1|Pet Mods|[Gen 8] JolteMons Random Battle,f|[Gen 6] NEXT OU,8|,1|Draft|[Gen 9] Paldea Dex Draft,c|[Gen 9] Tera Preview Paldea Dex Draft,c|[Gen 9] 6v6 Doubles Draft,c|[Gen 9] 4v4 Doubles Draft,1c|[Gen 9] NatDex Draft,c|[Gen 9] Tera Preview NatDex Draft,c|[Gen 9] NatDex 6v6 Doubles Draft,c|[Gen 9] NatDex 4v4 Doubles Draft,1c|[Gen 9] NatDex LC Draft,c|[Gen 8] Galar Dex Draft,c|[Gen 8] NatDex Draft,c|[Gen 8] NatDex 4v4 Doubles Draft,1c|[Gen 7] Draft,c|[Gen 6] Draft,c|,2|OM of the Month|[Gen 9] 350 Cup,e|[Gen 9] Bonus Type,e|,2|Other Metagames|[Gen 9] Almost Any Ability,e|[Gen 9] Balanced Hackmons,e|[Gen 9] Pre-Full Dex BH,c|[Gen 9] Mix and Mega,e|[Gen 9] Godly Gift,e|[Gen 9] STABmons,e|[Gen 9] Partners in Crime,e|[Gen 9] Inheritance,e|,2|Challengeable OMs|[Gen 9] Camomons,c|[Gen 9] Convergence,c|[Gen 9] Cross Evolution,c|[Gen 9] Fortemons,c|[Gen 9] Full Potential,c|[Gen 9] Pokebilities,c|[Gen 9] Pure Hackmons,c|[Gen 9] Revelationmons,c|[Gen 9] Shared Power,c|[Gen 9] Tera Donation,c|[Gen 9] The Card Game,c|[Gen 9] The Loser's Game,c|[Gen 9] Trademarked,c|,2|Retro Other Metagames|[Gen 6] Pure Hackmons,e|,3|Randomized Format Spotlight|[Gen 9] Random Roulette,f|,3|Randomized Metas|[Gen 9] Monotype Random Battle,f|[Gen 9] Random Battle Mayhem,f|[Gen 9] Computer-Generated Teams,f|[Gen 9] Hackmons Cup,f|[Gen 9] Doubles Hackmons Cup,d|[Gen 9] Broken Cup,d|[Gen 9] Challenge Cup 1v1,f|[Gen 9] Challenge Cup 2v2,f|[Gen 9] Challenge Cup 6v6,d|[Gen 8] Random Battle,f|[Gen 8] Random Doubles Battle,f|[Gen 8] Free-For-All Random Battle,7|[Gen 8] Multi Random Battle,5|[Gen 8] Battle Factory,f|[Gen 8] BSS Factory,1f|[Gen 8] Super Staff Bros 4,f|[Gen 8] Hackmons Cup,f|[Gen 8] CAP 1v1,d|[Gen 8 BDSP] Random Battle,d|[Gen 7] Random Battle,f|[Gen 7] Random Doubles Battle,9|[Gen 7] Battle Factory,f|[Gen 7] BSS Factory,1d|[Gen 7] Hackmons Cup,d|[Gen 7 Let's Go] Random Battle,d|[Gen 6] Random Battle,f|[Gen 6] Battle Factory,9|[Gen 5] Random Battle,f|[Gen 4] Random Battle,f|[Gen 3] Random Battle,f|[Gen 2] Random Battle,f|[Gen 1] Random Battle,f|[Gen 1] Challenge Cup,9|[Gen 1] Hackmons Cup,9|,3|Metronome Battle|[Gen 9] Metronome Battle,e|[Gen 8] Metronome Battle,c|,4|RoA Spotlight|[Gen 3] Ubers,e|[Gen 3] LC,e|[Gen 7 Let's Go] OU,1e|,4|Past Gens OU|[Gen 8] OU,e|[Gen 7] OU,e|[Gen 6] OU,e|[Gen 5] OU,e|[Gen 4] OU,e|[Gen 3] OU,e|[Gen 2] OU,e|[Gen 1] OU,e|,4|Past Gens Doubles OU|[Gen 8] Doubles OU,e|[Gen 7] Doubles OU,e|[Gen 6] Doubles OU,e|[Gen 5] Doubles OU,c|[Gen 4] Doubles OU,e|[Gen 3] Doubles OU,c|,4|Sw/Sh Singles|[Gen 8] Ubers,c|[Gen 8] UU,c|[Gen 8] RU,c|[Gen 8] NU,c|[Gen 8] PU,c|[Gen 8] LC,c|[Gen 8] Monotype,c|[Gen 8] 1v1,c|[Gen 8] Anything Goes,c|[Gen 8] ZU,c|[Gen 8] CAP,c|[Gen 8] Battle Stadium Singles,1c|[Gen 8 BDSP] OU,c|[Gen 8] Custom Game,c|,5|Sw/Sh Doubles|[Gen 8] Doubles Ubers,c|[Gen 8] Doubles UU,c|[Gen 8] VGC 2022,1c|[Gen 8] VGC 2021,1c|[Gen 8] VGC 2020,1c|[Gen 8 BDSP] Doubles OU,c|[Gen 8 BDSP] Battle Festival Doubles,1c|[Gen 8] Doubles Custom Game,c|,5|US/UM Singles|[Gen 7] Ubers,c|[Gen 7] UU,c|[Gen 7] RU,c|[Gen 7] NU,c|[Gen 7] PU,c|[Gen 7] LC,c|[Gen 7] Monotype,c|[Gen 7] 1v1,c|[Gen 7] Anything Goes,c|[Gen 7] ZU,c|[Gen 7] CAP,c|[Gen 7] Battle Spot Singles,1c|[Gen 7] Custom Game,c|,5|US/UM Doubles|[Gen 7] Doubles UU,c|[Gen 7] VGC 2019,1c|[Gen 7] VGC 2018,1c|[Gen 7] VGC 2017,1c|[Gen 7] Battle Spot Doubles,1c|[Gen 7 Let's Go] Doubles OU,c|[Gen 7] Doubles Custom Game,c|,6|OR/AS Singles|[Gen 6] Ubers,c|[Gen 6] UU,c|[Gen 6] RU,c|[Gen 6] NU,c|[Gen 6] PU,c|[Gen 6] LC,c|[Gen 6] Monotype,c|[Gen 6] 1v1,c|[Gen 6] Anything Goes,c|[Gen 6] ZU,c|[Gen 6] CAP,c|[Gen 6] Battle Spot Singles,1c|[Gen 6] Custom Game,c|,6|OR/AS Doubles/Triples|[Gen 6] VGC 2016,1c|[Gen 6] VGC 2015,1c|[Gen 6] VGC 2014,1c|[Gen 6] Battle Spot Doubles,1c|[Gen 6] Doubles Custom Game,c|[Gen 6] Battle Spot Triples,1c|[Gen 6] Triples Custom Game,c|,6|B2/W2 Singles|[Gen 5] Ubers,c|[Gen 5] UU,c|[Gen 5] RU,c|[Gen 5] NU,c|[Gen 5] PU,c|[Gen 5] LC,c|[Gen 5] Monotype,c|[Gen 5] 1v1,c|[Gen 5] ZU,c|[Gen 5] CAP,c|[Gen 5] GBU Singles,1c|[Gen 5] Custom Game,c|,6|B2/W2 Doubles|[Gen 5] VGC 2013,1c|[Gen 5] VGC 2012,1c|[Gen 5] VGC 2011,1c|[Gen 5] Doubles Custom Game,c|[Gen 5] Triples Custom Game,c|,7|DPP Singles|[Gen 4] Ubers,c|[Gen 4] UU,c|[Gen 4] NU,c|[Gen 4] PU,c|[Gen 4] LC,c|[Gen 4] Anything Goes,c|[Gen 4] 1v1,c|[Gen 4] ZU,c|[Gen 4] CAP,c|[Gen 4] Custom Game,c|,7|DPP Doubles|[Gen 4] VGC 2010,1c|[Gen 4] VGC 2009,1c|[Gen 4] Doubles Custom Game,c|,7|Past Generations|[Gen 3] UU,c|[Gen 3] NU,c|[Gen 3] PU,c|[Gen 3] 1v1,c|[Gen 3] Custom Game,c|[Gen 3] Doubles Custom Game,c|[Gen 2] Ubers,c|[Gen 2] UU,c|[Gen 2] NU,c|[Gen 2] 1v1,c|[Gen 2] Nintendo Cup 2000,c|[Gen 2] Stadium OU,c|[Gen 2] Custom Game,c|[Gen 1] Ubers,c|[Gen 1] UU,c|[Gen 1] NU,c|[Gen 1] PU,c|[Gen 1] 1v1,c|[Gen 1] Japanese OU,c|[Gen 1] Stadium OU,c|[Gen 1] Tradebacks OU,c|[Gen 1] Nintendo Cup 1997,c|[Gen 1] Custom Game,c";

    it("Should properly parse a formats string", async () => {
        const parsed = parsePokemonShowdownFormats(formatsString);
        assert.deepEqual(Array.from(parsed.entries()).sort(sortById), expectedFormats.sort(sortById));
    });
});

const expectedFormats = [
    [
        "gen9randombattle",
        {
            "name": "[Gen 9] Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9unratedrandombattle",
        {
            "name": "[Gen 9] Unrated Random Battle",
            "team": false,
            "ladder": true,
            "challenge": false,
            "disableTournaments": false
        }
    ],
    [
        "gen9freeforallrandombattle",
        {
            "name": "[Gen 9] Free-For-All Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": true
        }
    ],
    [
        "gen9randombattleblitz",
        {
            "name": "[Gen 9] Random Battle (Blitz)",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9multirandombattle",
        {
            "name": "[Gen 9] Multi Random Battle",
            "team": false,
            "ladder": false,
            "challenge": true,
            "disableTournaments": true
        }
    ],
    [
        "gen9ou",
        {
            "name": "[Gen 9] OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9ubers",
        {
            "name": "[Gen 9] Ubers",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9uu",
        {
            "name": "[Gen 9] UU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9ru",
        {
            "name": "[Gen 9] RU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9nu",
        {
            "name": "[Gen 9] NU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9pu",
        {
            "name": "[Gen 9] PU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9lc",
        {
            "name": "[Gen 9] LC",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9monotype",
        {
            "name": "[Gen 9] Monotype",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9monothreatwater",
        {
            "name": "[Gen 9] Monothreat Water",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen91v1",
        {
            "name": "[Gen 9] 1v1",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9anythinggoes",
        {
            "name": "[Gen 9] Anything Goes",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9nfe",
        {
            "name": "[Gen 9] NFE",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9zu",
        {
            "name": "[Gen 9] ZU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9lcuu",
        {
            "name": "[Gen 9] LC UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9cap",
        {
            "name": "[Gen 9] CAP",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9freeforall",
        {
            "name": "[Gen 9] Free-For-All",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": true
        }
    ],
    [
        "gen9battlestadiumsinglesregulationc",
        {
            "name": "[Gen 9] Battle Stadium Singles Regulation C",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9battlestadiumsinglesregulationd",
        {
            "name": "[Gen 9] Battle Stadium Singles Regulation D",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9customgame",
        {
            "name": "[Gen 9] Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9randomdoublesbattle",
        {
            "name": "[Gen 9] Random Doubles Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9doublesou",
        {
            "name": "[Gen 9] Doubles OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9doublesubers",
        {
            "name": "[Gen 9] Doubles Ubers",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9doublesuu",
        {
            "name": "[Gen 9] Doubles UU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9doubleslc",
        {
            "name": "[Gen 9] Doubles LC",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen92v2doubles",
        {
            "name": "[Gen 9] 2v2 Doubles",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9vgc2023regulationc",
        {
            "name": "[Gen 9] VGC 2023 Regulation C",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9vgc2023regulationd",
        {
            "name": "[Gen 9] VGC 2023 Regulation D",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9doublescustomgame",
        {
            "name": "[Gen 9] Doubles Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9nationaldex",
        {
            "name": "[Gen 9] National Dex",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9nationaldexubers",
        {
            "name": "[Gen 9] National Dex Ubers",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9nationaldexuu",
        {
            "name": "[Gen 9] National Dex UU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9nationaldexru",
        {
            "name": "[Gen 9] National Dex RU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9nationaldexmonotype",
        {
            "name": "[Gen 9] National Dex Monotype",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9nationaldexdoubles",
        {
            "name": "[Gen 9] National Dex Doubles",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9nationaldexag",
        {
            "name": "[Gen 9] National Dex AG",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9nationaldexbh",
        {
            "name": "[Gen 9] National Dex BH",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8nationaldex",
        {
            "name": "[Gen 8] National Dex",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8nationaldexuu",
        {
            "name": "[Gen 8] National Dex UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8nationaldexmonotype",
        {
            "name": "[Gen 8] National Dex Monotype",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8joltemonsrandombattle",
        {
            "name": "[Gen 8] JolteMons Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6nextou",
        {
            "name": "[Gen 6] NEXT OU",
            "team": true,
            "ladder": false,
            "challenge": false,
            "disableTournaments": false
        }
    ],
    [
        "gen9paldeadexdraft",
        {
            "name": "[Gen 9] Paldea Dex Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9terapreviewpaldeadexdraft",
        {
            "name": "[Gen 9] Tera Preview Paldea Dex Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen96v6doublesdraft",
        {
            "name": "[Gen 9] 6v6 Doubles Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen94v4doublesdraft",
        {
            "name": "[Gen 9] 4v4 Doubles Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9natdexdraft",
        {
            "name": "[Gen 9] NatDex Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9terapreviewnatdexdraft",
        {
            "name": "[Gen 9] Tera Preview NatDex Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9natdex6v6doublesdraft",
        {
            "name": "[Gen 9] NatDex 6v6 Doubles Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9natdex4v4doublesdraft",
        {
            "name": "[Gen 9] NatDex 4v4 Doubles Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9natdexlcdraft",
        {
            "name": "[Gen 9] NatDex LC Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8galardexdraft",
        {
            "name": "[Gen 8] Galar Dex Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8natdexdraft",
        {
            "name": "[Gen 8] NatDex Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8natdex4v4doublesdraft",
        {
            "name": "[Gen 8] NatDex 4v4 Doubles Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7draft",
        {
            "name": "[Gen 7] Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6draft",
        {
            "name": "[Gen 6] Draft",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9350cup",
        {
            "name": "[Gen 9] 350 Cup",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9bonustype",
        {
            "name": "[Gen 9] Bonus Type",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9almostanyability",
        {
            "name": "[Gen 9] Almost Any Ability",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9balancedhackmons",
        {
            "name": "[Gen 9] Balanced Hackmons",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9prefulldexbh",
        {
            "name": "[Gen 9] Pre-Full Dex BH",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9mixandmega",
        {
            "name": "[Gen 9] Mix and Mega",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9godlygift",
        {
            "name": "[Gen 9] Godly Gift",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9stabmons",
        {
            "name": "[Gen 9] STABmons",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9partnersincrime",
        {
            "name": "[Gen 9] Partners in Crime",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9inheritance",
        {
            "name": "[Gen 9] Inheritance",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9camomons",
        {
            "name": "[Gen 9] Camomons",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9convergence",
        {
            "name": "[Gen 9] Convergence",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9crossevolution",
        {
            "name": "[Gen 9] Cross Evolution",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9fortemons",
        {
            "name": "[Gen 9] Fortemons",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9fullpotential",
        {
            "name": "[Gen 9] Full Potential",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9pokebilities",
        {
            "name": "[Gen 9] Pokebilities",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9purehackmons",
        {
            "name": "[Gen 9] Pure Hackmons",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9revelationmons",
        {
            "name": "[Gen 9] Revelationmons",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9sharedpower",
        {
            "name": "[Gen 9] Shared Power",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9teradonation",
        {
            "name": "[Gen 9] Tera Donation",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9thecardgame",
        {
            "name": "[Gen 9] The Card Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9thelosersgame",
        {
            "name": "[Gen 9] The Loser's Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9trademarked",
        {
            "name": "[Gen 9] Trademarked",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6purehackmons",
        {
            "name": "[Gen 6] Pure Hackmons",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9randomroulette",
        {
            "name": "[Gen 9] Random Roulette",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9monotyperandombattle",
        {
            "name": "[Gen 9] Monotype Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9randombattlemayhem",
        {
            "name": "[Gen 9] Random Battle Mayhem",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9computergeneratedteams",
        {
            "name": "[Gen 9] Computer-Generated Teams",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9hackmonscup",
        {
            "name": "[Gen 9] Hackmons Cup",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9doubleshackmonscup",
        {
            "name": "[Gen 9] Doubles Hackmons Cup",
            "team": false,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9brokencup",
        {
            "name": "[Gen 9] Broken Cup",
            "team": false,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9challengecup1v1",
        {
            "name": "[Gen 9] Challenge Cup 1v1",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9challengecup2v2",
        {
            "name": "[Gen 9] Challenge Cup 2v2",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen9challengecup6v6",
        {
            "name": "[Gen 9] Challenge Cup 6v6",
            "team": false,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8randombattle",
        {
            "name": "[Gen 8] Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8randomdoublesbattle",
        {
            "name": "[Gen 8] Random Doubles Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8freeforallrandombattle",
        {
            "name": "[Gen 8] Free-For-All Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": true
        }
    ],
    [
        "gen8multirandombattle",
        {
            "name": "[Gen 8] Multi Random Battle",
            "team": false,
            "ladder": false,
            "challenge": true,
            "disableTournaments": true
        }
    ],
    [
        "gen8battlefactory",
        {
            "name": "[Gen 8] Battle Factory",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8bssfactory",
        {
            "name": "[Gen 8] BSS Factory",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8superstaffbros4",
        {
            "name": "[Gen 8] Super Staff Bros 4",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8hackmonscup",
        {
            "name": "[Gen 8] Hackmons Cup",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8cap1v1",
        {
            "name": "[Gen 8] CAP 1v1",
            "team": false,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8bdsprandombattle",
        {
            "name": "[Gen 8 BDSP] Random Battle",
            "team": false,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7randombattle",
        {
            "name": "[Gen 7] Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7randomdoublesbattle",
        {
            "name": "[Gen 7] Random Doubles Battle",
            "team": false,
            "ladder": false,
            "challenge": false,
            "disableTournaments": false
        }
    ],
    [
        "gen7battlefactory",
        {
            "name": "[Gen 7] Battle Factory",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7bssfactory",
        {
            "name": "[Gen 7] BSS Factory",
            "team": false,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7hackmonscup",
        {
            "name": "[Gen 7] Hackmons Cup",
            "team": false,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7letsgorandombattle",
        {
            "name": "[Gen 7 Let's Go] Random Battle",
            "team": false,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6randombattle",
        {
            "name": "[Gen 6] Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6battlefactory",
        {
            "name": "[Gen 6] Battle Factory",
            "team": false,
            "ladder": false,
            "challenge": false,
            "disableTournaments": false
        }
    ],
    [
        "gen5randombattle",
        {
            "name": "[Gen 5] Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4randombattle",
        {
            "name": "[Gen 4] Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen3randombattle",
        {
            "name": "[Gen 3] Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen2randombattle",
        {
            "name": "[Gen 2] Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1randombattle",
        {
            "name": "[Gen 1] Random Battle",
            "team": false,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1challengecup",
        {
            "name": "[Gen 1] Challenge Cup",
            "team": false,
            "ladder": false,
            "challenge": false,
            "disableTournaments": false
        }
    ],
    [
        "gen1hackmonscup",
        {
            "name": "[Gen 1] Hackmons Cup",
            "team": false,
            "ladder": false,
            "challenge": false,
            "disableTournaments": false
        }
    ],
    [
        "gen9metronomebattle",
        {
            "name": "[Gen 9] Metronome Battle",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8metronomebattle",
        {
            "name": "[Gen 8] Metronome Battle",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen3ubers",
        {
            "name": "[Gen 3] Ubers",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen3lc",
        {
            "name": "[Gen 3] LC",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7letsgoou",
        {
            "name": "[Gen 7 Let's Go] OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8ou",
        {
            "name": "[Gen 8] OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7ou",
        {
            "name": "[Gen 7] OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6ou",
        {
            "name": "[Gen 6] OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5ou",
        {
            "name": "[Gen 5] OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4ou",
        {
            "name": "[Gen 4] OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen3ou",
        {
            "name": "[Gen 3] OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen2ou",
        {
            "name": "[Gen 2] OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1ou",
        {
            "name": "[Gen 1] OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8doublesou",
        {
            "name": "[Gen 8] Doubles OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7doublesou",
        {
            "name": "[Gen 7] Doubles OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6doublesou",
        {
            "name": "[Gen 6] Doubles OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5doublesou",
        {
            "name": "[Gen 5] Doubles OU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4doublesou",
        {
            "name": "[Gen 4] Doubles OU",
            "team": true,
            "ladder": true,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen3doublesou",
        {
            "name": "[Gen 3] Doubles OU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8ubers",
        {
            "name": "[Gen 8] Ubers",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8uu",
        {
            "name": "[Gen 8] UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8ru",
        {
            "name": "[Gen 8] RU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8nu",
        {
            "name": "[Gen 8] NU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8pu",
        {
            "name": "[Gen 8] PU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8lc",
        {
            "name": "[Gen 8] LC",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8monotype",
        {
            "name": "[Gen 8] Monotype",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen81v1",
        {
            "name": "[Gen 8] 1v1",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8anythinggoes",
        {
            "name": "[Gen 8] Anything Goes",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8zu",
        {
            "name": "[Gen 8] ZU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8cap",
        {
            "name": "[Gen 8] CAP",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8battlestadiumsingles",
        {
            "name": "[Gen 8] Battle Stadium Singles",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8bdspou",
        {
            "name": "[Gen 8 BDSP] OU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8customgame",
        {
            "name": "[Gen 8] Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8doublesubers",
        {
            "name": "[Gen 8] Doubles Ubers",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8doublesuu",
        {
            "name": "[Gen 8] Doubles UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8vgc2022",
        {
            "name": "[Gen 8] VGC 2022",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8vgc2021",
        {
            "name": "[Gen 8] VGC 2021",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8vgc2020",
        {
            "name": "[Gen 8] VGC 2020",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8bdspdoublesou",
        {
            "name": "[Gen 8 BDSP] Doubles OU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8bdspbattlefestivaldoubles",
        {
            "name": "[Gen 8 BDSP] Battle Festival Doubles",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen8doublescustomgame",
        {
            "name": "[Gen 8] Doubles Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7ubers",
        {
            "name": "[Gen 7] Ubers",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7uu",
        {
            "name": "[Gen 7] UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7ru",
        {
            "name": "[Gen 7] RU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7nu",
        {
            "name": "[Gen 7] NU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7pu",
        {
            "name": "[Gen 7] PU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7lc",
        {
            "name": "[Gen 7] LC",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7monotype",
        {
            "name": "[Gen 7] Monotype",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen71v1",
        {
            "name": "[Gen 7] 1v1",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7anythinggoes",
        {
            "name": "[Gen 7] Anything Goes",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7zu",
        {
            "name": "[Gen 7] ZU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7cap",
        {
            "name": "[Gen 7] CAP",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7battlespotsingles",
        {
            "name": "[Gen 7] Battle Spot Singles",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7customgame",
        {
            "name": "[Gen 7] Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7doublesuu",
        {
            "name": "[Gen 7] Doubles UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7vgc2019",
        {
            "name": "[Gen 7] VGC 2019",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7vgc2018",
        {
            "name": "[Gen 7] VGC 2018",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7vgc2017",
        {
            "name": "[Gen 7] VGC 2017",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7battlespotdoubles",
        {
            "name": "[Gen 7] Battle Spot Doubles",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7letsgodoublesou",
        {
            "name": "[Gen 7 Let's Go] Doubles OU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen7doublescustomgame",
        {
            "name": "[Gen 7] Doubles Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6ubers",
        {
            "name": "[Gen 6] Ubers",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6uu",
        {
            "name": "[Gen 6] UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6ru",
        {
            "name": "[Gen 6] RU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6nu",
        {
            "name": "[Gen 6] NU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6pu",
        {
            "name": "[Gen 6] PU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6lc",
        {
            "name": "[Gen 6] LC",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6monotype",
        {
            "name": "[Gen 6] Monotype",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen61v1",
        {
            "name": "[Gen 6] 1v1",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6anythinggoes",
        {
            "name": "[Gen 6] Anything Goes",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6zu",
        {
            "name": "[Gen 6] ZU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6cap",
        {
            "name": "[Gen 6] CAP",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6battlespotsingles",
        {
            "name": "[Gen 6] Battle Spot Singles",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6customgame",
        {
            "name": "[Gen 6] Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6vgc2016",
        {
            "name": "[Gen 6] VGC 2016",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6vgc2015",
        {
            "name": "[Gen 6] VGC 2015",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6vgc2014",
        {
            "name": "[Gen 6] VGC 2014",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6battlespotdoubles",
        {
            "name": "[Gen 6] Battle Spot Doubles",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6doublescustomgame",
        {
            "name": "[Gen 6] Doubles Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6battlespottriples",
        {
            "name": "[Gen 6] Battle Spot Triples",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen6triplescustomgame",
        {
            "name": "[Gen 6] Triples Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5ubers",
        {
            "name": "[Gen 5] Ubers",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5uu",
        {
            "name": "[Gen 5] UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5ru",
        {
            "name": "[Gen 5] RU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5nu",
        {
            "name": "[Gen 5] NU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5pu",
        {
            "name": "[Gen 5] PU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5lc",
        {
            "name": "[Gen 5] LC",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5monotype",
        {
            "name": "[Gen 5] Monotype",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen51v1",
        {
            "name": "[Gen 5] 1v1",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5zu",
        {
            "name": "[Gen 5] ZU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5cap",
        {
            "name": "[Gen 5] CAP",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5gbusingles",
        {
            "name": "[Gen 5] GBU Singles",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5customgame",
        {
            "name": "[Gen 5] Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5vgc2013",
        {
            "name": "[Gen 5] VGC 2013",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5vgc2012",
        {
            "name": "[Gen 5] VGC 2012",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5vgc2011",
        {
            "name": "[Gen 5] VGC 2011",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5doublescustomgame",
        {
            "name": "[Gen 5] Doubles Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen5triplescustomgame",
        {
            "name": "[Gen 5] Triples Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4ubers",
        {
            "name": "[Gen 4] Ubers",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4uu",
        {
            "name": "[Gen 4] UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4nu",
        {
            "name": "[Gen 4] NU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4pu",
        {
            "name": "[Gen 4] PU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4lc",
        {
            "name": "[Gen 4] LC",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4anythinggoes",
        {
            "name": "[Gen 4] Anything Goes",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen41v1",
        {
            "name": "[Gen 4] 1v1",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4zu",
        {
            "name": "[Gen 4] ZU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4cap",
        {
            "name": "[Gen 4] CAP",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4customgame",
        {
            "name": "[Gen 4] Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4vgc2010",
        {
            "name": "[Gen 4] VGC 2010",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4vgc2009",
        {
            "name": "[Gen 4] VGC 2009",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen4doublescustomgame",
        {
            "name": "[Gen 4] Doubles Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen3uu",
        {
            "name": "[Gen 3] UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen3nu",
        {
            "name": "[Gen 3] NU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen3pu",
        {
            "name": "[Gen 3] PU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen31v1",
        {
            "name": "[Gen 3] 1v1",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen3customgame",
        {
            "name": "[Gen 3] Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen3doublescustomgame",
        {
            "name": "[Gen 3] Doubles Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen2ubers",
        {
            "name": "[Gen 2] Ubers",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen2uu",
        {
            "name": "[Gen 2] UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen2nu",
        {
            "name": "[Gen 2] NU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen21v1",
        {
            "name": "[Gen 2] 1v1",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen2nintendocup2000",
        {
            "name": "[Gen 2] Nintendo Cup 2000",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen2stadiumou",
        {
            "name": "[Gen 2] Stadium OU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen2customgame",
        {
            "name": "[Gen 2] Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1ubers",
        {
            "name": "[Gen 1] Ubers",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1uu",
        {
            "name": "[Gen 1] UU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1nu",
        {
            "name": "[Gen 1] NU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1pu",
        {
            "name": "[Gen 1] PU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen11v1",
        {
            "name": "[Gen 1] 1v1",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1japaneseou",
        {
            "name": "[Gen 1] Japanese OU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1stadiumou",
        {
            "name": "[Gen 1] Stadium OU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1tradebacksou",
        {
            "name": "[Gen 1] Tradebacks OU",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1nintendocup1997",
        {
            "name": "[Gen 1] Nintendo Cup 1997",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ],
    [
        "gen1customgame",
        {
            "name": "[Gen 1] Custom Game",
            "team": true,
            "ladder": false,
            "challenge": true,
            "disableTournaments": false
        }
    ]
];

