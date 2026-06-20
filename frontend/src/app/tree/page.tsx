"use client";

import { useState, useEffect } from "react";

interface Crop {
  id: string;
  name: string;
  emoji: string;
  growthTime: number;
  value: number;
  color: string;
  seedColor: string;
  rarity: "basic" | "rare";
}

interface Plot {
  id: number;
  cropId: string | null;
  plantedAt: number | null;
  stage: "empty" | "seed" | "sprout" | "growing" | "ready";
}

interface InventoryItem {
  cropId: string;
  count: number;
}

interface Item {
  id: string;
  name: string;
  emoji: string;
  description: string;
  type: "buff" | "instant" | "consumable";
  effect: "harvest_double" | "instant_harvest" | "growth_boost" | "random_seed" | "gold_bonus";
  duration?: number;
}

interface ShopOffer {
  id: string;
  item: Item;
  price: number;
  costCrops: { cropId: string; count: number }[];
}

interface SynthesisRecipe {
  [cropId: string]: number;
}

interface ActiveBuff {
  effect: string;
  endsAt: number;
}

const CROPS: Crop[] = [
  { id: "wheat", name: "小麦", emoji: "🌾", growthTime: 5000, value: 8, color: "from-yellow-300 to-yellow-400", seedColor: "bg-yellow-100", rarity: "basic" },
  { id: "carrot", name: "胡萝卜", emoji: "🥕", growthTime: 8000, value: 10, color: "from-orange-400 to-orange-500", seedColor: "bg-orange-200", rarity: "basic" },
  { id: "radish", name: "白萝卜", emoji: "🥬", growthTime: 10000, value: 15, color: "from-lime-300 to-lime-400", seedColor: "bg-lime-200", rarity: "basic" },
  { id: "tomato", name: "番茄", emoji: "🍅", growthTime: 12000, value: 20, color: "from-red-400 to-red-500", seedColor: "bg-red-200", rarity: "basic" },
  { id: "potato", name: "土豆", emoji: "🥔", growthTime: 14000, value: 25, color: "from-amber-300 to-amber-400", seedColor: "bg-amber-200", rarity: "basic" },
  { id: "corn", name: "玉米", emoji: "🌽", growthTime: 16000, value: 30, color: "from-yellow-400 to-yellow-500", seedColor: "bg-yellow-200", rarity: "basic" },
  { id: "eggplant", name: "茄子", emoji: "🍆", growthTime: 18000, value: 35, color: "from-purple-400 to-purple-500", seedColor: "bg-purple-200", rarity: "rare" },
  { id: "pepper", name: "辣椒", emoji: "🌶️", growthTime: 20000, value: 40, color: "from-red-500 to-red-600", seedColor: "bg-red-300", rarity: "rare" },
  { id: "grape", name: "葡萄", emoji: "🍇", growthTime: 25000, value: 50, color: "from-violet-400 to-violet-500", seedColor: "bg-violet-200", rarity: "rare" },
  { id: "watermelon", name: "西瓜", emoji: "🍉", growthTime: 28000, value: 60, color: "from-green-400 to-green-500", seedColor: "bg-green-200", rarity: "rare" },
  { id: "strawberry", name: "草莓", emoji: "🍓", growthTime: 30000, value: 70, color: "from-rose-400 to-rose-500", seedColor: "bg-rose-200", rarity: "rare" },
  { id: "pumpkin", name: "南瓜", emoji: "🎃", growthTime: 35000, value: 80, color: "from-amber-400 to-amber-500", seedColor: "bg-amber-200", rarity: "rare" },
  { id: "cherry", name: "樱桃", emoji: "🍒", growthTime: 40000, value: 100, color: "from-red-600 to-red-700", seedColor: "bg-red-400", rarity: "rare" },
  { id: "peach", name: "桃子", emoji: "🍑", growthTime: 45000, value: 120, color: "from-pink-400 to-pink-500", seedColor: "bg-pink-200", rarity: "rare" },
  { id: "mango", name: "芒果", emoji: "🥭", growthTime: 50000, value: 150, color: "from-yellow-500 to-orange-400", seedColor: "bg-yellow-300", rarity: "rare" },
];

const RARE_CROPS = CROPS.filter(c => c.rarity === "rare");

const ITEMS: Item[] = [
  { id: "lucky_glove", name: "幸运手套", emoji: "🧤", description: "下次收获时金币翻倍", type: "buff", effect: "harvest_double", duration: 1 },
  { id: "super_fertilizer", name: "超级化肥", emoji: "💫", description: "瞬间收获当前地块所有成熟作物", type: "instant", effect: "instant_harvest" },
  { id: "growth_boost", name: "成长加速卡", emoji: "⚡", description: "接下来5分钟内作物生长速度翻倍", type: "buff", effect: "growth_boost", duration: 300000 },
  { id: "mystery_seed", name: "神秘种子", emoji: "🎁", description: "随机获得一个稀有种子", type: "consumable", effect: "random_seed" },
  { id: "golden_shovel", name: "黄金锄头", emoji: "🔨", description: "收获时有50%概率额外获得5金币", type: "buff", effect: "gold_bonus", duration: 1 },
];

const INITIAL_PLOTS: Plot[] = Array.from({ length: 21 }, (_, i) => ({
  id: i,
  cropId: null,
  plantedAt: null,
  stage: "empty",
}));

const SEED_PRICES = [0, 3, 5, 8, 10, 12, 15, 18, 22, 28, 35, 42, 55, 70, 90];

const generateRandomRecipe = (): SynthesisRecipe => {
  const basicCropIds = CROPS.filter(c => c.rarity === "basic").map(c => c.id);
  const recipe: SynthesisRecipe = {};
  const numIngredients = Math.floor(Math.random() * 2) + 2;
  const shuffled = [...basicCropIds].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < numIngredients; i++) {
    recipe[shuffled[i]] = Math.floor(Math.random() * 3) + 1;
  }
  
  return recipe;
};

const generateShopOffers = (): ShopOffer[] => {
  const shuffledItems = [...ITEMS].sort(() => Math.random() - 0.5);
  return shuffledItems.slice(0, 2).map((item, index) => ({
    id: `offer-${Date.now()}-${index}`,
    item,
    price: Math.floor(Math.random() * 3) + 1,
    costCrops: generateCostCrops(item.type === "buff" ? "rare" : "basic"),
  }));
};

const generateCostCrops = (rarity: "basic" | "rare"): { cropId: string; count: number }[] => {
  const sourceCrops = rarity === "rare" 
    ? CROPS.filter(c => c.rarity === "rare")
    : CROPS.filter(c => c.rarity === "basic");
  
  const numCrops = Math.floor(Math.random() * 2) + 1;
  const shuffled = [...sourceCrops].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, numCrops).map(crop => ({
    cropId: crop.id,
    count: Math.floor(Math.random() * 2) + 1,
  }));
};

const REFRESH_PRICES = [10, 20, 50, 100];

export default function FarmGamePage() {
  const [coins, setCoins] = useState(100);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [seedInventory, setSeedInventory] = useState<InventoryItem[]>([
    { cropId: "wheat", count: 8 },
    { cropId: "carrot", count: 5 },
    { cropId: "tomato", count: 3 },
  ]);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"farm" | "shop" | "bag" | "synthesis" | "merchant">("farm");
  const [notification, setNotification] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<SynthesisRecipe>(() => generateRandomRecipe());
  const [shopOffers, setShopOffers] = useState<ShopOffer[]>(generateShopOffers());
  const [refreshCount, setRefreshCount] = useState(0);
  const [itemInventory, setItemInventory] = useState<Item[]>([]);
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [growthBoostMultiplier, setGrowthBoostMultiplier] = useState(1);

  const expForLevel = (lvl: number) => lvl * 100;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const addExp = (amount: number) => {
    const newExp = exp + amount;
    const needed = expForLevel(level);
    if (newExp >= needed) {
      setLevel(level + 1);
      setExp(newExp - needed);
      showNotification(`🎉 升级了！现在是 ${level + 1} 级！`);
    } else {
      setExp(newExp);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPlots((prevPlots) =>
        prevPlots.map((plot) => {
          if (!plot.cropId || !plot.plantedAt) return plot;

          const elapsed = Date.now() - plot.plantedAt;
          const crop = CROPS.find((c) => c.id === plot.cropId);
          if (!crop) return plot;

          const growthProgress = Math.min((elapsed * growthBoostMultiplier) / crop.growthTime, 1);

          let newStage: Plot["stage"] = "seed";
          if (growthProgress >= 1) newStage = "ready";
          else if (growthProgress >= 0.66) newStage = "growing";
          else if (growthProgress >= 0.33) newStage = "sprout";
          else newStage = "seed";

          return { ...plot, stage: newStage };
        })
      );

      setActiveBuffs(prev => {
        const now = Date.now();
        const stillActive = prev.filter(buff => buff.endsAt > now);
        if (stillActive.length !== prev.length) {
          setGrowthBoostMultiplier(stillActive.some(b => b.effect === "growth_boost") ? 2 : 1);
        }
        return stillActive;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [growthBoostMultiplier]);

  const plantCrop = (plotId: number) => {
    if (!selectedCropId) {
      showNotification("⚠️ 请先从种子仓库选择种子！");
      return;
    }

    const plot = plots.find((p) => p.id === plotId);
    if (plot?.cropId) {
      showNotification("⚠️ 这里已经种了东西！");
      return;
    }

    const seedItem = seedInventory.find((item) => item.cropId === selectedCropId);
    if (!seedItem || seedItem.count <= 0) {
      showNotification("⚠️ 种子仓库中没有这种种子！");
      return;
    }

    setSeedInventory((prev) =>
      prev.map((item) =>
        item.cropId === selectedCropId ? { ...item, count: item.count - 1 } : item
      ).filter((item) => item.count > 0)
    );

    setPlots(
      plots.map((p) =>
        p.id === plotId
          ? { ...p, cropId: selectedCropId, plantedAt: Date.now(), stage: "seed" }
          : p
      )
    );

    const crop = CROPS.find((c) => c.id === selectedCropId);
    showNotification(`🌱 种下了 ${crop?.emoji} ${crop?.name}！`);
  };

  const buySeed = (cropId: string) => {
    const crop = CROPS.find(c => c.id === cropId);
    if (!crop || crop.rarity === "rare") {
      showNotification("⚠️ 稀有种子无法直接购买，需要在合成台合成！");
      return;
    }

    const cropIndex = CROPS.findIndex((c) => c.id === cropId);
    const price = SEED_PRICES[cropIndex];
    if (coins < price) {
      showNotification("⚠️ 金币不够！");
      return;
    }

    setCoins(coins - price);
    setSeedInventory((prev) => {
      const existing = prev.find((item) => item.cropId === cropId);
      if (existing) {
        return prev.map((item) =>
          item.cropId === cropId ? { ...item, count: item.count + 1 } : item
        );
      }
      return [...prev, { cropId, count: 1 }];
    });

    showNotification(`🛒 购买了 ${crop.emoji} ${crop.name} 种子！`);
  };

  const harvestCrop = (plotId: number) => {
    const plot = plots.find((p) => p.id === plotId);
    if (!plot?.cropId || plot.stage !== "ready") return;

    const crop = CROPS.find((c) => c.id === plot.cropId);
    if (!crop) return;

    setPlots(
      plots.map((p) =>
        p.id === plotId ? { ...p, cropId: null, plantedAt: null, stage: "empty" } : p
      )
    );

    setInventory((prev) => {
      const existing = prev.find((item) => item.cropId === crop.id);
      if (existing) {
        return prev.map((item) =>
          item.cropId === crop.id ? { ...item, count: item.count + 1 } : item
        );
      }
      return [...prev, { cropId: crop.id, count: 1 }];
    });

    let reward = crop.value + Math.floor(Math.random() * 10);
    
    const hasHarvestDouble = activeBuffs.some(b => b.effect === "harvest_double");
    if (hasHarvestDouble) {
      reward *= 2;
      setActiveBuffs(prev => prev.filter(b => b.effect !== "harvest_double"));
      showNotification(`✨ 幸运手套触发！收获 ${crop.emoji} x2！+${reward} 金币`);
    } else {
      showNotification(`✨ 收获了 ${crop.emoji} ${crop.name}！+${reward} 金币`);
    }

    const hasGoldBonus = activeBuffs.some(b => b.effect === "gold_bonus");
    if (hasGoldBonus && Math.random() > 0.5) {
      reward += 5;
      showNotification(`💰 黄金锄头触发！额外+5金币`);
      setActiveBuffs(prev => prev.filter(b => b.effect !== "gold_bonus"));
    }

    setCoins(coins + reward);
    addExp(20);
  };

  const sellCrop = (cropId: string) => {
    const item = inventory.find((i) => i.cropId === cropId);
    const crop = CROPS.find((c) => c.id === cropId);
    if (!item || !crop || item.count < 1) return;

    const totalValue = crop.value * item.count;
    setCoins(coins + totalValue);
    setInventory(inventory.filter((i) => i.cropId !== cropId));
    addExp(item.count * 15);
    showNotification(`💰 出售了 ${crop.emoji} x${item.count}，+${totalValue} 金币`);
  };

  const getCropStageEmoji = (plot: Plot) => {
    if (!plot.cropId) return "🌱";
    switch (plot.stage) {
      case "seed": return "🌱";
      case "sprout": return "🌿";
      case "growing": return "🪴";
      case "ready": return "✨";
      default: return "🌱";
    }
  };

  const canSynthesize = () => {
    for (const [cropId, amount] of Object.entries(currentRecipe)) {
      const item = inventory.find(i => i.cropId === cropId);
      if (!item || item.count < amount) return false;
    }
    return true;
  };

  const getRecipeDescription = () => {
    return Object.entries(currentRecipe)
      .map(([cropId, amount]) => {
        const crop = CROPS.find(c => c.id === cropId);
        return `${crop?.emoji}${crop?.name}x${amount}`;
      })
      .join(" + ");
  };

  const synthesize = () => {
    if (!canSynthesize()) {
      showNotification(`⚠️ 材料不足！需要 ${getRecipeDescription()}`);
      return;
    }

    setIsSynthesizing(true);

    setInventory(prev => {
      let newInventory = [...prev];
      for (const [cropId, amount] of Object.entries(currentRecipe)) {
        newInventory = newInventory.map(item =>
          item.cropId === cropId ? { ...item, count: item.count - amount } : item
        ).filter(item => item.count > 0);
      }
      return newInventory;
    });

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * RARE_CROPS.length);
      const result = RARE_CROPS[randomIndex];
      
      setSeedInventory(prev => {
        const existing = prev.find(item => item.cropId === result.id);
        if (existing) {
          return prev.map(item =>
            item.cropId === result.id ? { ...item, count: item.count + 1 } : item
          );
        }
        return [...prev, { cropId: result.id, count: 1 }];
      });

      setIsSynthesizing(false);
      showNotification(`🎉 合成成功！获得 ${result.emoji} ${result.name} 种子！`);
      setCurrentRecipe(generateRandomRecipe());
    }, 1500);
  };

  const refreshShop = () => {
    const price = REFRESH_PRICES[Math.min(refreshCount, REFRESH_PRICES.length - 1)];
    if (coins < price) {
      showNotification(`⚠️ 金币不够！刷新需要 ${price} 金币`);
      return;
    }
    setCoins(coins - price);
    setShopOffers(generateShopOffers());
    setRefreshCount(prev => prev + 1);
    showNotification(`🔄 刷新了商店！`);
  };

  const buyShopItem = (offer: ShopOffer) => {
    for (const cost of offer.costCrops) {
      const invItem = inventory.find(i => i.cropId === cost.cropId);
      if (!invItem || invItem.count < cost.count) {
        showNotification("⚠️ 材料不足！");
        return;
      }
    }

    for (const cost of offer.costCrops) {
      setInventory(prev => {
        return prev.map(item =>
          item.cropId === cost.cropId ? { ...item, count: item.count - cost.count } : item
        ).filter(item => item.count > 0);
      });
    }

    setItemInventory(prev => [...prev, offer.item]);
    setShopOffers(prev => prev.filter(o => o.id !== offer.id));
    showNotification(`🎁 购买了 ${offer.item.emoji} ${offer.item.name}！`);
  };

  const useItem = (item: Item) => {
    switch (item.effect) {
      case "instant_harvest":
        const readyPlots = plots.filter(p => p.cropId && p.stage === "ready");
        if (readyPlots.length === 0) {
          showNotification("⚠️ 没有可收获的成熟作物！");
          return;
        }
        readyPlots.forEach(plot => harvestCrop(plot.id));
        setItemInventory(prev => prev.filter(i => i !== item));
        break;
      case "random_seed":
        const randomCrop = RARE_CROPS[Math.floor(Math.random() * RARE_CROPS.length)];
        setSeedInventory(prev => {
          const existing = prev.find(i => i.cropId === randomCrop.id);
          if (existing) {
            return prev.map(i => i.cropId === randomCrop.id ? { ...i, count: i.count + 1 } : i);
          }
          return [...prev, { cropId: randomCrop.id, count: 1 }];
        });
        setItemInventory(prev => prev.filter(i => i !== item));
        showNotification(`🎁 获得 ${randomCrop.emoji} ${randomCrop.name} 种子！`);
        break;
      case "harvest_double":
      case "growth_boost":
      case "gold_bonus":
        const endsAt = Date.now() + (item.duration || 300000);
        setActiveBuffs(prev => [...prev, { effect: item.effect, endsAt }]);
        setItemInventory(prev => prev.filter(i => i !== item));
        if (item.effect === "growth_boost") {
          setGrowthBoostMultiplier(2);
          showNotification(`⚡ 成长加速卡生效！5分钟内生长翻倍！`);
        } else {
          showNotification(`✨ ${item.emoji} ${item.name} 已装备！`);
        }
        break;
    }
  };

  const selectedCrop = selectedCropId ? CROPS.find((c) => c.id === selectedCropId) : null;
  const getRefreshPrice = () => REFRESH_PRICES[Math.min(refreshCount, REFRESH_PRICES.length - 1)];

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-8">
        <header className="text-center mb-12">
          <div className="inline-block px-8 py-6 rounded-3xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-green-200/50 dark:border-green-700/50 shadow-xl">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent mb-3">
              🌾 灵境农场
            </h1>
            <p className="text-slate-500 dark:text-slate-400">享受种植的乐趣，收获满满的幸福</p>
          </div>
        </header>

        <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/40 border border-amber-200/50 dark:border-amber-700/50 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center shadow-md">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">金币</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{coins}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-200/50 dark:border-indigo-700/50 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center shadow-md">
              <span className="text-lg">⭐</span>
            </div>
            <div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">等级</p>
              <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">Lv.{level}</p>
            </div>
            <div className="w-24 h-2 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(exp / expForLevel(level)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {notification && (
          <div className="fixed top-32 left-1/2 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl z-50 font-semibold text-center max-w-xs animate-notification">
            {notification}
          </div>
        )}

        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {([
            { key: "farm", label: "🏠 农场", gradient: "from-green-500 to-emerald-500" },
            { key: "shop", label: "🛒 商店", gradient: "from-orange-500 to-amber-500" },
            { key: "bag", label: "🎒 背包", gradient: "from-violet-500 to-purple-500" },
            { key: "synthesis", label: "⚗️ 合成台", gradient: "from-cyan-500 to-blue-500" },
            { key: "merchant", label: "🎭 流浪商人", gradient: "from-rose-500 to-pink-500" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                activeTab === tab.key
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg shadow-opacity-30`
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:shadow-md"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "farm" && (
          <div className="space-y-6">
            <div className="flex gap-6 flex-col lg:flex-row">
              <div className="w-full lg:w-44 flex-shrink-0">
                <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-4">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <span>🗄️</span> 种子仓库
                  </h3>
                  {seedInventory.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-400 dark:text-slate-500">仓库空空如也</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">去商店购买种子吧</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {seedInventory.map((item) => {
                        const crop = CROPS.find((c) => c.id === item.cropId);
                        if (!crop) return null;
                        return (
                          <button
                            key={item.cropId}
                            onClick={() => setSelectedCropId(item.cropId)}
                            className={`w-full flex items-center gap-2 p-2 rounded-xl transition-all ${
                              selectedCropId === item.cropId
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                                : "bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/50 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span className="text-xl">{crop.emoji}</span>
                            <div className="flex-1 text-left">
                              <p className="text-xs font-medium truncate">{crop.name}</p>
                              <p className={`text-xs ${selectedCropId === item.cropId ? "text-green-200" : "text-green-500"}`}>x{item.count}</p>
                            </div>
                            {crop.rarity === "rare" && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-500">稀有</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-green-200/60 to-green-300/60 dark:from-green-900/40 dark:to-green-800/40 border border-green-300/40 dark:border-green-700/40 shadow-xl">
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                          <span className="text-2xl">🌾</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-green-800 dark:text-green-200">我的农场</h2>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {plots.filter(p => p.cropId).length}/21 块耕地已种植
                          </p>
                        </div>
                      </div>

                      {selectedCrop && (
                        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-800/90 shadow-md border border-green-200/50 dark:border-green-700/50">
                          <span>已选择：</span>
                          <span className="text-2xl">{selectedCrop.emoji}</span>
                          <span className="font-bold text-green-700 dark:text-green-300">{selectedCrop.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-7 gap-2 justify-items-center">
                      {plots.map((plot) => {
                        const crop = plot.cropId ? CROPS.find((c) => c.id === plot.cropId) : null;
                        return (
                          <div
                            key={plot.id}
                            onClick={() => {
                              if (plot.stage === "empty") plantCrop(plot.id);
                              else if (plot.stage === "ready") harvestCrop(plot.id);
                            }}
                            className={`w-16 h-16 sm:w-20 sm:h-20 relative rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                              plot.stage !== "empty" && crop ? "shadow-md" : "hover:shadow-lg"
                            }`}
                          >
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/土地.png')` }} />
                            {crop ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                                <span className={`text-xl sm:text-2xl drop-shadow-lg ${plot.stage === "ready" ? "animate-bounce-subtle" : ""}`}>
                                  {plot.stage === "ready" ? crop.emoji : getCropStageEmoji(plot)}
                                </span>
                                {plot.stage === "ready" && (
                                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-yellow-400 flex items-center justify-center shadow-lg animate-ping-once">
                                    <span className="text-xs">✨</span>
                                  </div>
                                )}
                                <div className="absolute bottom-1 left-1 right-1 h-1 bg-white/40 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-white/90 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${
                                        plot.stage === "ready" ? 100 :
                                        plot.stage === "growing" ? 66 :
                                        plot.stage === "sprout" ? 33 : 10
                                      }%`
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <span className="text-xl text-amber-600/60 font-light">+</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {itemInventory.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 border border-violet-200/50 dark:border-violet-800/50 p-4">
                <h3 className="text-sm font-bold text-violet-800 dark:text-violet-200 mb-3 flex items-center gap-2">
                  <span>🎒</span> 道具栏
                  {activeBuffs.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                      {activeBuffs.length} 个buff生效中
                    </span>
                  )}
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {itemInventory.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      onClick={() => {
                        if (activeTab === "farm") {
                          useItem(item);
                        } else {
                          showNotification("请在农场界面使用道具");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm cursor-pointer hover:shadow-md hover:scale-105 transition-all"
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-6 px-6 py-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">🌱</span>
                <span>点击种植</span>
              </div>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 hidden sm:block" />
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">✨</span>
                <span>点击收获</span>
              </div>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 hidden sm:block" />
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">🎭</span>
                <span>使用道具</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "shop" && (
          <div className="rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border-b border-orange-200/50 dark:border-orange-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-orange-800 dark:text-orange-200">种子商店</h2>
                    <p className="text-sm text-orange-600 dark:text-orange-400">基础种子可直接购买，稀有种子需合成</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow">
                  <span className="text-lg">💰</span>
                  <span className="text-xl font-bold text-amber-600">{coins}</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {CROPS.map((crop) => {
                  const price = SEED_PRICES[CROPS.indexOf(crop)];
                  const canAfford = coins >= price;
                  const isRare = crop.rarity === "rare";
                  
                  return (
                    <div
                      key={crop.id}
                      className="relative p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${crop.color} opacity-5 rounded-xl`} />
                      <div className="relative text-center">
                        <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${crop.color} flex items-center justify-center shadow-sm mb-2`}>
                          <span className="text-2xl">{crop.emoji}</span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{crop.name}</h3>
                        {isRare && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 mb-2 inline-block">稀有</span>
                        )}
                        <button
                          onClick={() => buySeed(crop.id)}
                          disabled={isRare || !canAfford}
                          className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isRare
                              ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                              : canAfford
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {isRare ? "合成获得" : canAfford ? `购买 ${price} 💰` : "金币不足"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💎</span>
                  <div>
                    <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-1">稀有种子说明</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      稀有种子无法直接购买，需要在合成台使用基础作物进行合成抽奖获得。
                      每次合成需要的材料会随机变化！
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bag" && (
          <div className="rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 border-b border-violet-200/50 dark:border-violet-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎒</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-violet-800 dark:text-violet-200">背包</h2>
                  <p className="text-sm text-violet-600 dark:text-violet-400">
                    {inventory.length > 0 ? `作物 ${inventory.reduce((a, i) => a + i.count, 0)} 件` : "暂无作物"}
                    {itemInventory.length > 0 && ` | 道具 ${itemInventory.length} 件`}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {inventory.length === 0 && itemInventory.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-4 shadow-inner">
                    <span className="text-5xl opacity-50">📦</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mb-2">背包空空如也</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">去农场收获一些作物吧！</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {inventory.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">🌾 作物</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {inventory.map((item) => {
                          const crop = CROPS.find((c) => c.id === item.cropId);
                          if (!crop) return null;
                          return (
                            <div
                              key={item.cropId}
                              className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
                            >
                              <div className="text-center mb-4">
                                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${crop.color} flex items-center justify-center shadow-lg mb-2`}>
                                  <span className="text-3xl">{crop.emoji}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{crop.name}</h3>
                                <p className="text-sm text-slate-500">x {item.count}</p>
                              </div>
                              <button
                                onClick={() => sellCrop(item.cropId)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                              >
                                出售 {crop.value * item.count} 💰
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {itemInventory.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">🎁 道具</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {itemInventory.map((item, index) => (
                          <div
                            key={`${item.id}-${index}`}
                            className="p-4 rounded-2xl bg-gradient-to-b from-violet-50 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/30 border border-violet-200/50 dark:border-violet-800/50"
                          >
                            <div className="text-center mb-4">
                              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg mb-2">
                                <span className="text-3xl">{item.emoji}</span>
                              </div>
                              <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                              <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                            </div>
                            <button
                              onClick={() => useItem(item)}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                              使用道具
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "synthesis" && (
          <div className="rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-cyan-200/50 dark:border-cyan-700/50 shadow-xl overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border-b border-cyan-200/50 dark:border-cyan-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">⚗️</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-cyan-800 dark:text-cyan-200">合成台</h2>
                  <p className="text-sm text-cyan-600 dark:text-cyan-400">使用基础作物合成稀有种子</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-3xl p-6 mb-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-cyan-600 dark:text-cyan-400 mb-2">当前配方</p>
                    <p className="text-lg font-bold text-cyan-800 dark:text-cyan-200">{getRecipeDescription()}</p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
                    {Object.entries(currentRecipe).map(([cropId, amount]) => {
                      const crop = CROPS.find(c => c.id === cropId);
                      const item = inventory.find(i => i.cropId === cropId);
                      const hasEnough = item && item.count >= amount;
                      
                      return (
                        <div key={cropId} className="text-center">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 transition-all ${
                            hasEnough ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg" : "bg-slate-700/50 grayscale"
                          }`}>
                            <span className="text-3xl">{crop?.emoji}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{crop?.name}</p>
                          <p className={`text-xs font-bold ${hasEnough ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                            {item?.count || 0} / {amount}
                          </p>
                        </div>
                      );
                    })}
                    <div className="flex items-center">
                      <span className="text-3xl text-cyan-400">→</span>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center mx-auto mb-2 animate-pulse-subtle">
                        <span className="text-3xl">?</span>
                      </div>
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">随机稀有种子</p>
                    </div>
                  </div>

                  <button
                    onClick={synthesize}
                    disabled={!canSynthesize() || isSynthesizing}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                      canSynthesize() && !isSynthesizing
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {isSynthesizing ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">🔄</span>
                        合成中...
                      </span>
                    ) : (
                      "🎲 开始合成抽奖"
                    )}
                  </button>
                </div>

                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 rounded-2xl p-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <span>🎁</span> 可合成的稀有种子
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {RARE_CROPS.map(crop => (
                      <div key={crop.id} className="text-center p-2 rounded-xl bg-white/80 dark:bg-slate-700/50">
                        <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${crop.color} flex items-center justify-center mb-1`}>
                          <span className="text-xl">{crop.emoji}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{crop.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "merchant" && (
          <div className="rounded-3xl bg-gradient-to-b from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 border border-rose-200/50 dark:border-rose-800/50 shadow-xl overflow-hidden">
            <div className="relative px-8 py-6 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 border-b border-rose-200/50 dark:border-rose-800/50">
              <div className="absolute top-4 right-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg animate-float">
                  <span className="text-3xl">🎭</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🧙</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-rose-800 dark:text-rose-200">流浪商人</h2>
                  <p className="text-sm text-rose-600 dark:text-rose-400">神秘商人带来了稀有的道具！</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl p-6 mb-6 shadow-lg">
                  <div className="text-center mb-4">
                    <p className="text-2xl mb-2">🎭</p>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">神秘商品</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">用稀有作物换取强力道具！</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {shopOffers.map((offer) => {
                      const canAfford = offer.costCrops.every(cost => {
                        const item = inventory.find(i => i.cropId === cost.cropId);
                        return item && item.count >= cost.count;
                      });

                      return (
                        <div
                          key={offer.id}
                          className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 border border-violet-200/50 dark:border-violet-800/50"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
                              <span className="text-3xl">{offer.item.emoji}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900 dark:text-white">{offer.item.name}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{offer.item.description}</p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">需要材料：</p>
                            <div className="flex gap-2 flex-wrap">
                              {offer.costCrops.map((cost, idx) => {
                                const crop = CROPS.find(c => c.id === cost.cropId);
                                const have = inventory.find(i => i.cropId === cost.cropId)?.count || 0;
                                const enough = have >= cost.count;
                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                                      enough ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                                    }`}
                                  >
                                    <span className="text-lg">{crop?.emoji}</span>
                                    <span className={`text-xs font-bold ${enough ? "text-green-600" : "text-red-500"}`}>
                                      {have}/{cost.count}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <button
                            onClick={() => buyShopItem(offer)}
                            disabled={!canAfford}
                            className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
                              canAfford
                                ? "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            {canAfford ? "🛒 兑换" : "材料不足"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={refreshShop}
                    disabled={coins < getRefreshPrice()}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      coins >= getRefreshPrice()
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    🔄 刷新商店 ({getRefreshPrice()} 💰)
                  </button>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl p-6 shadow-lg">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <span>📦</span> 可购买的道具
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className="text-center p-3 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border border-slate-200/50 dark:border-slate-600/50"
                      >
                        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mb-2 shadow">
                          <span className="text-2xl">{item.emoji}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            灵境农场 v1.0 · 享受种植的乐趣
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes notification {
          0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          10% { opacity: 1; transform: translateX(-50%) translateY(0); }
          90% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
        .animate-notification {
          animation: notification 2.5s ease-out forwards;
        }
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-ping-once {
          animation: ping-once 1.5s ease-out;
        }
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(139, 92, 246, 0); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}