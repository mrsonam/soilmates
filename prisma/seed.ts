/**
 * Demo showcase user + rich collection (areas, plants, care history, reminders, activity).
 * Run: npm run db:seed  (requires DATABASE_URL)
 *
 * Sign in: DEMO_SEED_EMAIL / DEMO_SEED_PASSWORD (see .env.example)
 */

import { randomUUID } from "crypto";
import {
  CareLogActionType,
  CollectionMemberStatus,
  PlantAcquisitionType,
  PlantHealthStatus,
  PlantLifeStage,
  Prisma,
  PrismaClient,
  ReminderPreferredWindow,
  ReminderSource,
  ReminderType,
} from "@prisma/client";
import { ActivityEventTypes } from "../lib/activity/event-types";
import {
  SHOWCASE_AREA_COVER_URLS,
  SHOWCASE_COLLECTION_COVER_URL,
  SHOWCASE_PLANT_PRIMARY_URLS,
} from "../lib/demo/showcase-media-urls";
import { hashPassword } from "../lib/password-hash";

const prisma = new PrismaClient();

const DEMO_EMAIL =
  process.env.DEMO_SEED_EMAIL?.trim().toLowerCase() ??
  "garden-demo@example.soilmates";
const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD ?? "DemoGarden2026!";
const DEMO_NAME = "Jordan Vale";

function daysAgo(n: number, hourUtc = 14, minuteUtc = 0): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(hourUtc, minuteUtc % 60, 0, 0);
  return d;
}

/** For `acquiredAt` (@db.Date) — midday UTC avoids timezone truncation surprises. */
function calendarDaysAgo(days: number): Date {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

async function wipeExistingDemo(email: string) {
  const existing = await prisma.profile.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!existing) return;

  await prisma.collection.deleteMany({
    where: { createdById: existing.id },
  });
  await prisma.profile.delete({
    where: { id: existing.id },
  });
}

type PlantDef = {
  slug: string;
  nickname: string;
  areaSlug: string;
  referenceCommonName: string;
  scientific?: string;
  plantType: string;
  lifeStage: PlantLifeStage;
  health: PlantHealthStatus;
  acquisition: PlantAcquisitionType;
  acquiredDaysAgo: number;
  notes: string;
  growthPct?: number;
  favorite?: boolean;
  referenceSnapshot: Record<string, unknown>;
  /** Relative density of automated care history */
  history: "lush" | "normal" | "sparse" | "herb";
};

const COLLECTION_SLUG = "showcase-demo-jungle";

const PLANTS: PlantDef[] = [
  {
    slug: "monstera-delilah",
    nickname: "Delilah",
    areaSlug: "sunroom",
    referenceCommonName: "Monstera deliciosa",
    scientific: "Monstera deliciosa",
    plantType: "Evergreen vine",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 420,
    notes:
      "Rescued from a studio apartment; gave her a moss pole last spring and she’s been throwing fenestrated leaves ever since. Watch newer leaves for posture — she tilts toward the window by mid-week.",
    growthPct: 82,
    favorite: true,
    referenceSnapshot: {
      commonName: "Monstera deliciosa",
      family: "Araceae",
      light: "Bright indirect",
      waterNote: "Allow top 2–3 cm soil to dry.",
    },
    history: "lush",
  },
  {
    slug: "fiddle-fig-sonny",
    nickname: "Sonny",
    areaSlug: "sunroom",
    referenceCommonName: "Fiddle-leaf fig",
    scientific: "Ficus lyrata",
    plantType: "Broadleaf tropical",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 310,
    notes:
      "Loves the morning strip of direct light then bright indirect the rest of the day. Dropped two lower leaves in January when the heat blasted — humidity tray fixed the edema spots.",
    growthPct: 61,
    favorite: true,
    referenceSnapshot: { commonName: "Ficus lyrata", habit: "Tree-form" },
    history: "lush",
  },
  {
    slug: "pothos-willow",
    nickname: "Willow",
    areaSlug: "living-room",
    referenceCommonName: "Marble Queen pothos",
    scientific: "Epipremnum aureum",
    plantType: "Trailing vine",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.propagated,
    acquiredDaysAgo: 560,
    notes:
      "Mother plant from 2019; endless cuttings gifted to friends. Trail hits the floor on the east side — trim monthly to keep her bushy up top.",
    referenceSnapshot: { cultivar: "Marble Queen", versatility: "Low light tolerant" },
    history: "lush",
  },
  {
    slug: "peace-lily-eva",
    nickname: "Eva",
    areaSlug: "living-room",
    referenceCommonName: "Peace lily",
    scientific: "Spathiphyllum wallisii",
    plantType: "Tropical herbaceous",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.needs_attention,
    acquisition: PlantAcquisitionType.gift,
    acquiredDaysAgo: 240,
    notes:
      "Dramatic wilts when thirsty — but rebounds in hours. Recently noticed fine webbing under leaves; wiped down + boosted humidity; watching closely.",
    referenceSnapshot: { flowerColor: "White spathes", petSafe: false },
    history: "normal",
  },
  {
    slug: "snake-steve",
    nickname: "Steve",
    areaSlug: "bedroom",
    referenceCommonName: "Snake plant",
    scientific: "Dracaena trifasciata",
    plantType: "Succulent-adapted foliage",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 900,
    notes:
      "Bedroom air-lock buddy. Water sparingly — maybe every 18–24 days in winter. New pup emerging from the rhizome this month.",
    referenceSnapshot: { cultivar: "Laurentii", droughtScore: "High" },
    history: "sparse",
  },
  {
    slug: "zz-zara",
    nickname: "Zara",
    areaSlug: "bedroom",
    referenceCommonName: "ZZ plant",
    scientific: "Zamioculcas zamiifolia",
    plantType: "Rhizomatous evergreen",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 190,
    notes:
      "Low-light champion near the wardrobe. Glossy new growth after repot in chunky bark mix.",
    referenceSnapshot: { storage: "Water in rhizomes" },
    history: "sparse",
  },
  {
    slug: "calathea-luna",
    nickname: "Luna",
    areaSlug: "bedroom",
    referenceCommonName: "Calathea orbifolia",
    scientific: "Goeppertia orbifolia",
    plantType: "Prayer plant",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 150,
    notes:
      "Humidity diva — grouping with the fern helps. Small brown tips if I skip misting two days in a row.",
    favorite: true,
    referenceSnapshot: { leafPattern: "Silver bands" },
    history: "lush",
  },
  {
    slug: "basil-buddy",
    nickname: "Buddy",
    areaSlug: "kitchen",
    referenceCommonName: "Sweet basil",
    scientific: "Ocimum basilicum",
    plantType: "Annual herb",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.seed,
    acquiredDaysAgo: 75,
    notes:
      "Pinched weekly for pesto; flowering tips removed religiously. Smell when you brush past is ridiculous (in a good way).",
    referenceSnapshot: { culinary: true, harvestWindow: "Before flowering" },
    history: "herb",
  },
  {
    slug: "mint-mia",
    nickname: "Mia",
    areaSlug: "kitchen",
    referenceCommonName: "Spearmint",
    scientific: "Mentha spicata",
    plantType: "Herbaceous perennial",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.propagated,
    acquiredDaysAgo: 200,
    notes:
      "In its own pot — never again share substrate with basil. Tea and mojito duty.",
    referenceSnapshot: { invasiveWarning: true },
    history: "herb",
  },
  {
    slug: "rosemary-rue",
    nickname: "Rue",
    areaSlug: "kitchen",
    referenceCommonName: "Rosemary",
    scientific: "Salvia rosmarinus",
    plantType: "Woody herb",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 400,
    notes: "Drier side of the shelf — terracotta + perlite. Roast potato co-star.",
    referenceSnapshot: { aroma: "Resinous" },
    history: "herb",
  },
  {
    slug: "fern-felix",
    nickname: "Felix",
    areaSlug: "bathroom",
    referenceCommonName: "Boston fern",
    scientific: "Nephrolepis exaltata",
    plantType: "Fern",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 120,
    notes:
      "Shower steam is his fertilizer. Daily mist when the radiator runs dry in February.",
    referenceSnapshot: { humidity: "High" },
    history: "lush",
  },
  {
    slug: "pilea-pepper",
    nickname: "Pepper",
    areaSlug: "bathroom",
    referenceCommonName: "Chinese money plant",
    scientific: "Pilea peperomioides",
    plantType: "Succulent-stemmed perennial",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.propagated,
    acquiredDaysAgo: 300,
    notes:
      "Rotates for even pancake stacks; gifts babies to visitors. East diffuse window.",
    referenceSnapshot: { propagation: "Pups on soil surface" },
    history: "normal",
  },
  {
    slug: "alocasia-aria",
    nickname: "Aria",
    areaSlug: "bathroom",
    referenceCommonName: "Alocasia Polly",
    scientific: "Alocasia × amazonica",
    plantType: "Tropical broadleaf",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.needs_attention,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 95,
    notes:
      "Spider mites last summer — neem + shower rinses. New leaf is smaller; easing back on fertilizer until she stabilizes.",
    referenceSnapshot: { toxicity: "Calcium oxalate" },
    history: "normal",
  },
  {
    slug: "philodendron-brazil",
    nickname: "Brisa",
    areaSlug: "living-room",
    referenceCommonName: "Philodendron Brasil",
    scientific: "Philodendron hederaceum",
    plantType: "Climbing vine",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.propagated,
    acquiredDaysAgo: 410,
    notes: "Cabinet-top wanderer — aerial roots grab the trellis after rain-on-foliage season.",
    referenceSnapshot: { sport: "Yellow variegation strip" },
    history: "lush",
  },
  {
    slug: "rubber-otto",
    nickname: "Otto",
    areaSlug: "living-room",
    referenceCommonName: "Rubber plant",
    scientific: "Ficus elastica",
    plantType: "Broadleaf evergreen",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 260,
    notes: "Dust monthly — glossy leaves photosynthesize better. New sheath reddens before unfurl.",
    referenceSnapshot: { cultivar: "Burgundy" },
    history: "normal",
  },
  {
    slug: "bird-of-paradise-kai",
    nickname: "Kai",
    areaSlug: "sunroom",
    referenceCommonName: "Bird of paradise",
    scientific: "Strelitzia nicolai",
    plantType: "Tropical shrub",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 500,
    notes:
      "Big drinker in growth season. Leaf splits are natural wind-tear adaptations — stopped worrying.",
    growthPct: 44,
    referenceSnapshot: { eventualHeight: "Indoor tree potential" },
    history: "normal",
  },
  {
    slug: "spider-spencer",
    nickname: "Spencer",
    areaSlug: "living-room",
    referenceCommonName: "Spider plant",
    scientific: "Chlorophytum comosum",
    plantType: "Clumping perennial",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.propagated,
    acquiredDaysAgo: 700,
    notes: "Pups dangling to the floor — propagate jars everywhere.",
    referenceSnapshot: { petSafe: true },
    history: "normal",
  },
  {
    slug: "maranta-milo",
    nickname: "Milo",
    areaSlug: "bedroom",
    referenceCommonName: "Prayer plant",
    scientific: "Maranta leuconeura",
    plantType: "Herbaceous perennial",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 180,
    notes: "Leaves lift at dusk like clockwork — stopped caffeine, still not that rhythmic myself.",
    referenceSnapshot: { nyctinasty: true },
    history: "lush",
  },
  {
    slug: "begonia-blu",
    nickname: "Blu",
    areaSlug: "living-room",
    referenceCommonName: "Rex begonia",
    scientific: "Begonia rex",
    plantType: "Rhizomatous perennial",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 110,
    notes: "Velvet leaves — never mist from above; water from saucer to avoid crown rot.",
    referenceSnapshot: { foliage: "Iridescent" },
    history: "normal",
  },
  {
    slug: "croton-cedar",
    nickname: "Cedar",
    areaSlug: "sunroom",
    referenceCommonName: "Croton",
    scientific: "Codiaeum variegatum",
    plantType: "Broadleaf evergreen",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 140,
    notes:
      "Color cranks up with more light — pulled closer to the glass in October.",
    referenceSnapshot: { stressColor: true },
    history: "normal",
  },
  {
    slug: "orchid-olive",
    nickname: "Olive",
    areaSlug: "sunroom",
    referenceCommonName: "Phalaenopsis orchid",
    scientific: "Phalaenopsis",
    plantType: "Epiphytic orchid",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.gift,
    acquiredDaysAgo: 88,
    notes:
      "Ice cube method abandoned — soak bark weekly, air roots silvery when thirsty.",
    referenceSnapshot: { bloomSpike: "Seasonal" },
    history: "sparse",
  },
  {
    slug: "succulent-tray-sunny",
    nickname: "Sunny Patch",
    areaSlug: "sunroom",
    referenceCommonName: "Mixed echeveria bowl",
    plantType: "Succulent assortment",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.other,
    acquiredDaysAgo: 60,
    notes:
      "Shared tray — fast drainage, brutal honesty if overwatered (they get translucent).",
    referenceSnapshot: { container: "Terracotta bowl" },
    history: "sparse",
  },
  {
    slug: "tradescantia-tara",
    nickname: "Tara",
    areaSlug: "living-room",
    referenceCommonName: "Inch plant",
    scientific: "Tradescantia zebrina",
    plantType: "Herbaceous vine",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.propagated,
    acquiredDaysAgo: 330,
    notes:
      "Purple shimmer on the shelf edge; pinching keeps her from getting scraggly.",
    referenceSnapshot: { stem: "Succulent" },
    history: "lush",
  },
  {
    slug: "english-ivy-ingrid",
    nickname: "Ingrid",
    areaSlug: "living-room",
    referenceCommonName: "English ivy",
    scientific: "Hedera helix",
    plantType: "Evergreen vine",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 210,
    notes:
      "Trailing from a high shelf — sap can irritate skin; wash hands after pruning.",
    referenceSnapshot: { toxicity: "Mild irritant" },
    history: "normal",
  },
  {
    slug: "dracaena-dex",
    nickname: "Dex",
    areaSlug: "living-room",
    referenceCommonName: "Dragon tree",
    scientific: "Dracaena marginata",
    plantType: "Woody evergreen",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 640,
    notes: "Vertical accent; canes braided when younger — straightened out over time.",
    referenceSnapshot: { light: "Tolerates moderate" },
    history: "sparse",
  },
  {
    slug: "haworthia-honey",
    nickname: "Honey",
    areaSlug: "sunroom",
    referenceCommonName: "Haworthia",
    scientific: "Haworthia cooperi",
    plantType: "Succulent rosette",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 44,
    notes:
      "Window-sill gem — almost translucent leaf windows; barely sips water in winter.",
    referenceSnapshot: { window: "Leaf fenestration" },
    history: "sparse",
  },
  {
    slug: "tillandsia-sky",
    nickname: "Sky",
    areaSlug: "bathroom",
    referenceCommonName: "Air plant cluster",
    scientific: "Tillandsia ionantha",
    plantType: "Epiphyte",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.gift,
    acquiredDaysAgo: 130,
    notes:
      "Soak weekly in rain water; shake dry upside-down — no soil, all attitude.",
    referenceSnapshot: { substrate: "None" },
    history: "normal",
  },
  {
    slug: "cherry-tomato-tempo",
    nickname: "Tempo",
    areaSlug: "kitchen",
    referenceCommonName: "Cherry tomato (patio)",
    scientific: "Solanum lycopersicum",
    plantType: "Annual edible",
    lifeStage: PlantLifeStage.mature,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.seed,
    acquiredDaysAgo: 62,
    notes:
      "Determinate-ish determinate chaos — stakes, twine, and hope. Molasses in water for potassium boost.",
    referenceSnapshot: { light: "Full sun preferred" },
    history: "herb",
  },
  {
    slug: "aralia-arlo",
    nickname: "Arlo",
    areaSlug: "living-room",
    referenceCommonName: "Japanese aralia",
    scientific: "Fatsia japonica",
    plantType: "Broadleaf evergreen",
    lifeStage: PlantLifeStage.juvenile,
    health: PlantHealthStatus.thriving,
    acquisition: PlantAcquisitionType.purchased,
    acquiredDaysAgo: 220,
    notes:
      "Big palmate leaves — watch for scale on petioles; wiped monthly during dry heating season.",
    referenceSnapshot: { shadeTolerance: "High" },
    history: "normal",
  },
];

const AREAS = [
  {
    slug: "sunroom",
    name: "South Sunroom",
    sortOrder: 0,
    description:
      "Highest light in the home: south + west glass, sheer curtains for peak summer. Monstera, fiddle, and drama live here.",
  },
  {
    slug: "living-room",
    name: "Living Room Jungle",
    sortOrder: 1,
    description:
      "Trailing vines, statement specimens, and the reading-chair canopy. Morning east + reflected afternoon light.",
  },
  {
    slug: "bedroom",
    name: "Bedroom Calm",
    sortOrder: 2,
    description:
      "Lower rotation, quieter palette — ZZs, snakes, and prayer plants. Cooler temps overnight.",
  },
  {
    slug: "kitchen",
    name: "Kitchen Herb Ledge",
    sortOrder: 3,
    description:
      "South-east sill for culinary crew — basil, mint, rosemary. Harvest schedule tied to meal prep.",
  },
  {
    slug: "bathroom",
    name: "Spa Bathroom",
    sortOrder: 4,
    description:
      "Shower-adjacent humidity; lower direct light, perfect for ferns and aroids that love mist.",
  },
];

function pickActions(
  history: PlantDef["history"],
  i: number,
): CareLogActionType {
  if (history === "herb") {
    const cycle: CareLogActionType[] = [
      CareLogActionType.watered,
      CareLogActionType.watered,
      CareLogActionType.observation,
      CareLogActionType.harvested,
    ];
    return cycle[i % cycle.length]!;
  }
  if (history === "sparse") {
    const cycle: CareLogActionType[] = [
      CareLogActionType.watered,
      CareLogActionType.observation,
      CareLogActionType.watered,
      CareLogActionType.rotated,
    ];
    return cycle[i % cycle.length]!;
  }
  if (history === "lush") {
    const cycle: CareLogActionType[] = [
      CareLogActionType.watered,
      CareLogActionType.misted,
      CareLogActionType.watered,
      CareLogActionType.fertilized,
      CareLogActionType.observation,
      CareLogActionType.pruned,
      CareLogActionType.rotated,
      CareLogActionType.misted,
    ];
    return cycle[i % cycle.length]!;
  }
  const cycle: CareLogActionType[] = [
    CareLogActionType.watered,
    CareLogActionType.observation,
    CareLogActionType.watered,
    CareLogActionType.fertilized,
    CareLogActionType.misted,
    CareLogActionType.watered,
  ];
  return cycle[i % cycle.length]!;
}

function metadataFor(
  action: CareLogActionType,
  i: number,
): Record<string, unknown> {
  if (action === CareLogActionType.watered) {
    return {
      waterAmountMl: 180 + (i % 7) * 35,
      drainTray: true,
    };
  }
  if (action === CareLogActionType.misted) {
    return { waterAmountMl: 40 + (i % 3) * 10, target: "foliage" };
  }
  if (action === CareLogActionType.fertilized) {
    return {
      fertilizerType:
        i % 2 === 0 ? "Balanced 10-10-10 liquid (¼ strength)" : "Organic seaweed",
    };
  }
  if (action === CareLogActionType.repotted) {
    return {
      soilMix: "Coco coir, pine bark, perlite, worm castings top dress",
    };
  }
  if (action === CareLogActionType.soil_changed) {
    return { soilMix: "Top 3cm refresh — chunkier mix for aroids" };
  }
  if (action === CareLogActionType.harvested) {
    return { harvestAmount: `${20 + (i % 15)}g fresh leaves` };
  }
  if (action === CareLogActionType.rotated) {
    return { movedReason: "Quarter turn for even light" };
  }
  if (action === CareLogActionType.pruned) {
    return { removed: "Yellow lower leaf + leggy stem tip" };
  }
  if (action === CareLogActionType.pest_treatment) {
    return { product: "Neem + castile spray", coverage: "Undersides" };
  }
  return {};
}

function notesFor(
  action: CareLogActionType,
  nickname: string,
  i: number,
): string | undefined {
  const templates: Partial<Record<CareLogActionType, string[]>> = {
    [CareLogActionType.watered]: [
      `Thorough soak until saucer traced; ${nickname} perked within an hour.`,
      `Checked dryness with a bamboo skewer — watered deep and tipped excess after 20m.`,
    ],
    [CareLogActionType.misted]: [
      `Fine mist + fan afterward to mimic breeze (reduces spotting).`,
      `Grouped neighbors together after misting to hold humidity longer.`,
    ],
    [CareLogActionType.fertilized]: [
      `Fed at half label rate — slowed down because growth is still winter-slow.`,
    ],
    [CareLogActionType.observation]: [
      `New growth point forming; older leaf senescing — normal trade-off.`,
      `Checked for pests while watering; clean pass today.`,
    ],
    [CareLogActionType.repotted]: [
      `Lifted root ball — circling at bottom; new terracotta one size up.`,
    ],
    [CareLogActionType.pruned]: [
      `Removed damaged tissue; sterilized snips between cuts.`,
    ],
    [CareLogActionType.harvested]: [
      `Morning harvest before oils peak; washed gently before pesto prep.`,
    ],
    [CareLogActionType.pest_treatment]: [
      `Spot treatment after shower rinse — isolate if spread (did not need).`,
    ],
  };
  const list = templates[action];
  if (!list?.length) return undefined;
  return list[i % list.length];
}

function logCountFor(history: PlantDef["history"]): number {
  switch (history) {
    case "lush":
      return 26;
    case "normal":
      return 16;
    case "sparse":
      return 9;
    case "herb":
      return 18;
    default:
      return 12;
  }
}

function spacingDaysFor(history: PlantDef["history"], i: number): number {
  const base =
    history === "sparse"
      ? 18
      : history === "herb"
        ? 4
        : history === "lush"
          ? 5
          : 7;
  return base + (i % 3);
}

async function seedCareLogs(
  plant: { id: string; nickname: string; slug: string },
  def: PlantDef,
  userId: string,
) {
  const n = logCountFor(def.history);
  const entries: {
    actionType: CareLogActionType;
    actionAt: Date;
    notes?: string;
    metadata: Record<string, unknown>;
    tags: string[];
  }[] = [];

  let dayCursor = 8;
  for (let i = 0; i < n; i++) {
    let action = pickActions(def.history, i);
    if (def.slug === "peace-lily-eva" && i === 9) {
      action = CareLogActionType.pest_treatment;
    }
    if (def.slug === "monstera-delilah" && i === 22) {
      action = CareLogActionType.repotted;
    }
    if (def.slug === "alocasia-aria" && i === 7) {
      action = CareLogActionType.pest_treatment;
    }
    const step = spacingDaysFor(def.history, i);
    dayCursor += step;
    if (dayCursor > 195) break;

    const actionAt = daysAgo(
      dayCursor,
      9 + (i % 8),
      (i * 7 + plant.slug.length * 3) % 56,
    );
    entries.push({
      actionType: action,
      actionAt,
      notes: notesFor(action, plant.nickname, i),
      metadata: metadataFor(action, i),
      tags:
        action === CareLogActionType.watered
          ? ["deep-drink", "recorded"]
          : action === CareLogActionType.observation
            ? ["check-in"]
            : [],
    });
  }

  const BATCH = 80;
  for (let b = 0; b < entries.length; b += BATCH) {
    const slice = entries.slice(b, b + BATCH);
    await prisma.careLog.createMany({
      data: slice.map((e) => ({
        id: randomUUID(),
        plantId: plant.id,
        createdById: userId,
        actionType: e.actionType,
        actionAt: e.actionAt,
        notes: e.notes ?? null,
        metadata: e.metadata as Prisma.InputJsonValue,
        tags: e.tags,
      })),
    });
  }
}

async function main() {
  console.info(`[seed] Removing prior demo profile: ${DEMO_EMAIL}`);
  await wipeExistingDemo(DEMO_EMAIL);

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const userId = randomUUID();
  const collectionId = randomUUID();

  await prisma.profile.create({
    data: {
      id: userId,
      email: DEMO_EMAIL,
      fullName: DEMO_NAME,
      passwordHash,
      defaultCollectionId: null,
    },
  });

  await prisma.collection.create({
    data: {
      id: collectionId,
      slug: COLLECTION_SLUG,
      name: "Showcase · Urban Jungle (Demo)",
      description:
        "A full demo workspace: five rooms, many plants, months of care logs, reminders, and activity — explore to imagine your own digital garden.",
      coverImagePublicUrl: SHOWCASE_COLLECTION_COVER_URL,
      createdById: userId,
    },
  });

  await prisma.collectionMember.create({
    data: {
      id: randomUUID(),
      collectionId,
      userId,
      status: CollectionMemberStatus.active,
    },
  });

  await prisma.profile.update({
    where: { id: userId },
    data: { defaultCollectionId: collectionId },
  });

  const areaIdBySlug = new Map<string, string>();
  for (const a of AREAS) {
    const id = randomUUID();
    areaIdBySlug.set(a.slug, id);
    await prisma.area.create({
      data: {
        id,
        collectionId,
        slug: a.slug,
        name: a.name,
        description: a.description,
        sortOrder: a.sortOrder,
        coverImagePublicUrl: SHOWCASE_AREA_COVER_URLS[a.slug] ?? null,
      },
    });
  }

  const plantRows: { id: string; slug: string; nickname: string }[] = [];

  for (const p of PLANTS) {
    const areaId = areaIdBySlug.get(p.areaSlug);
    if (!areaId) throw new Error(`Missing area ${p.areaSlug}`);

    const plantId = randomUUID();
    await prisma.plant.create({
      data: {
        id: plantId,
        collectionId,
        areaId,
        slug: p.slug,
        nickname: p.nickname,
        referenceCommonName: p.referenceCommonName,
        referenceSnapshot: p.referenceSnapshot as Prisma.InputJsonValue,
        plantType: p.plantType,
        lifeStage: p.lifeStage,
        healthStatus: p.health,
        acquisitionType: p.acquisition,
        acquiredAt: calendarDaysAgo(p.acquiredDaysAgo),
        notes: p.notes,
        primaryImageUrl: SHOWCASE_PLANT_PRIMARY_URLS[p.slug] ?? null,
        growthProgressPercent: p.growthPct ?? null,
        isFavorite: p.favorite ?? false,
      },
    });
    plantRows.push({ id: plantId, slug: p.slug, nickname: p.nickname });
  }

  const plantDefBySlug = new Map(PLANTS.map((x) => [x.slug, x]));

  for (const row of plantRows) {
    const def = plantDefBySlug.get(row.slug);
    if (!def) continue;
    await seedCareLogs(row, def, userId);
  }

  type SeedActivity = {
    id: string;
    collectionId: string;
    plantId: string | null;
    actorUserId: string | null;
    eventType: string;
    summary: string;
    payload?: object;
    createdAt: Date;
  };

  const events: SeedActivity[] = [];
  const now = new Date();

  const pushEvent = (e: {
    daysAgo: number;
    plantSlug?: string;
    eventType: string;
    summary: string;
    payload?: object;
  }) => {
    const plantId = e.plantSlug
      ? plantRows.find((p) => p.slug === e.plantSlug)?.id
      : undefined;
    events.push({
      id: randomUUID(),
      collectionId,
      plantId: plantId ?? null,
      actorUserId: userId,
      eventType: e.eventType,
      summary: e.summary,
      payload: e.payload,
      createdAt: new Date(now.getTime() - e.daysAgo * 24 * 60 * 60 * 1000),
    });
  };

  pushEvent({
    daysAgo: 420,
    eventType: ActivityEventTypes.collectionCreated,
    summary: `${DEMO_NAME} started Showcase · Urban Jungle (Demo)`,
    payload: { name: "Showcase · Urban Jungle (Demo)" },
  });

  for (const a of AREAS) {
    pushEvent({
      daysAgo: 415 - a.sortOrder,
      eventType: ActivityEventTypes.areaCreated,
      summary: `${DEMO_NAME} added area “${a.name}”`,
    });
  }

  const plantOrder = [...PLANTS].sort((a, b) => b.acquiredDaysAgo - a.acquiredDaysAgo);
  for (let i = 0; i < plantOrder.length; i++) {
    const p = plantOrder[i];
    if (!p) continue;
    pushEvent({
      daysAgo: Math.max(3, p.acquiredDaysAgo - 2 + i),
      plantSlug: p.slug,
      eventType: ActivityEventTypes.plantAdded,
      summary: `Added “${p.nickname}” (${p.referenceCommonName})`,
    });
  }

  pushEvent({
    daysAgo: 14,
    plantSlug: "monstera-delilah",
    eventType: ActivityEventTypes.careLogAdded,
    summary: "Logged deep watering for Delilah after travel",
  });

  pushEvent({
    daysAgo: 9,
    plantSlug: "peace-lily-eva",
    eventType: ActivityEventTypes.careLogAdded,
    summary: "Eva flagged — inspection for spider mites under leaves",
  });

  pushEvent({
    daysAgo: 5,
    plantSlug: "basil-buddy",
    eventType: ActivityEventTypes.careLogAdded,
    summary: "Pesto night — harvested Buddy lightly and tipped pots for even growth",
  });

  await prisma.$transaction(
    events.map((ev) =>
      prisma.activityEvent.create({
        data: {
          id: ev.id,
          collectionId: ev.collectionId,
          plantId: ev.plantId,
          actorUserId: ev.actorUserId,
          eventType: ev.eventType,
          summary: ev.summary,
          ...(ev.payload !== undefined ? { payload: ev.payload } : {}),
          createdAt: ev.createdAt,
        },
      }),
    ),
  );

  const reminderSpecs: {
    plantSlug: string;
    type: ReminderType;
    title: string;
    description: string;
    intervalValue: number;
    intervalUnit: "days" | "weeks" | "months";
    preferredWindow: ReminderPreferredWindow | null;
    lastCompletedDaysAgo: number;
    nextDueDaysFromNow: number;
  }[] = [
    {
      plantSlug: "monstera-delilah",
      type: ReminderType.watering,
      title: "Deep water Delilah",
      description: "Saucer check after 20m; wipe leaves if dusty.",
      intervalValue: 8,
      intervalUnit: "days",
      preferredWindow: ReminderPreferredWindow.afternoon,
      lastCompletedDaysAgo: 6,
      nextDueDaysFromNow: 2,
    },
    {
      plantSlug: "fern-felix",
      type: ReminderType.misting,
      title: "Mist Felix + friends",
      description: "Bathroom humidity boost; shower steam days optional.",
      intervalValue: 2,
      intervalUnit: "days",
      preferredWindow: ReminderPreferredWindow.morning,
      lastCompletedDaysAgo: 1,
      nextDueDaysFromNow: 1,
    },
    {
      plantSlug: "basil-buddy",
      type: ReminderType.observation,
      title: "Harvest / pinch Basil",
      description: "Remove flowering tips; freeze pesto batches.",
      intervalValue: 5,
      intervalUnit: "days",
      preferredWindow: ReminderPreferredWindow.evening,
      lastCompletedDaysAgo: 4,
      nextDueDaysFromNow: 1,
    },
    {
      plantSlug: "calathea-luna",
      type: ReminderType.watering,
      title: "Calathea soak (Luna)",
      description: "Use room-temp water; let drip fully.",
      intervalValue: 6,
      intervalUnit: "days",
      preferredWindow: ReminderPreferredWindow.morning,
      lastCompletedDaysAgo: 5,
      nextDueDaysFromNow: 1,
    },
    {
      plantSlug: "pothos-willow",
      type: ReminderType.fertilizing,
      title: "Light fertilize trailing plants",
      description: "¼ strength complete fertilizer — Willow + Brisa rotation.",
      intervalValue: 3,
      intervalUnit: "weeks",
      preferredWindow: ReminderPreferredWindow.flexible,
      lastCompletedDaysAgo: 20,
      nextDueDaysFromNow: 1,
    },
    {
      plantSlug: "alocasia-aria",
      type: ReminderType.pest_check,
      title: "Aria leaf check",
      description: "Undersides + stem axils — early mites show up here.",
      intervalValue: 4,
      intervalUnit: "days",
      preferredWindow: ReminderPreferredWindow.afternoon,
      lastCompletedDaysAgo: 3,
      nextDueDaysFromNow: 1,
    },
    {
      plantSlug: "orchid-olive",
      type: ReminderType.watering,
      title: "Orchid soak (Olive)",
      description: "Soak bark until air roots silver-green again.",
      intervalValue: 9,
      intervalUnit: "days",
      preferredWindow: ReminderPreferredWindow.morning,
      lastCompletedDaysAgo: 7,
      nextDueDaysFromNow: 2,
    },
    {
      plantSlug: "snake-steve",
      type: ReminderType.watering,
      title: "Snake plant sip",
      description: "Steve’s drought window — light pour at soil edge.",
      intervalValue: 21,
      intervalUnit: "days",
      preferredWindow: ReminderPreferredWindow.flexible,
      lastCompletedDaysAgo: 18,
      nextDueDaysFromNow: 3,
    },
  ];

  const reminderCreates = reminderSpecs.map((r) => {
    const plantId = plantRows.find((p) => p.slug === r.plantSlug)!.id;
    const nextDueAt = new Date();
    nextDueAt.setDate(nextDueAt.getDate() + r.nextDueDaysFromNow);
    nextDueAt.setHours(15, 0, 0, 0);

    const lastCompletedAt = new Date();
    lastCompletedAt.setDate(lastCompletedAt.getDate() - r.lastCompletedDaysAgo);
    lastCompletedAt.setHours(11, 0, 0, 0);

    return prisma.reminder.create({
      data: {
        id: randomUUID(),
        collectionId,
        plantId,
        reminderType: r.type,
        title: r.title,
        description: r.description,
        source: ReminderSource.user,
        recurrenceRule: {
          intervalValue: r.intervalValue,
          intervalUnit: r.intervalUnit,
        },
        preferredWindow: r.preferredWindow,
        gracePeriodHours: 12,
        overdueAfterHours: 36,
        lastCompletedAt,
        nextDueAt,
        isPaused: false,
        isActive: true,
        createdById: userId,
      },
    });
  });

  await prisma.$transaction(reminderCreates);

  const totalLogs = await prisma.careLog.count({
    where: { plant: { collectionId } },
  });

  console.info(
    `[seed] Demo ready → ${DEMO_EMAIL} / ${DEMO_PASSWORD} (change via env) — collection ${COLLECTION_SLUG}, plants ${PLANTS.length}, care logs ${totalLogs}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
