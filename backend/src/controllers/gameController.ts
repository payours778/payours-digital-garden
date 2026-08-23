import { Request, Response } from 'express';
import { getDb } from '../db';

// ---- 农场状态 CRUD ----

// GET /api/games/farm/state
export async function getFarmState(req: Request, res: Response) {
  try {
    const db = await getDb();
    const userId = (req as any).user.id;

    const result = await db.exec('SELECT * FROM game_farm_states WHERE user_id = ?', [userId]);
    if (!result[0]?.values?.length) {
      // 首次进入，用默认值插入一行
      const DEFAULT_SEED_INVENTORY =
        '[{"cropId":"wheat","count":8},{"cropId":"carrot","count":5},{"cropId":"tomato","count":3}]';
      await db.run(
        'INSERT INTO game_farm_states (user_id, plots, inventory, seed_inventory, item_inventory, active_buffs) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, '[]', '[]', DEFAULT_SEED_INVENTORY, '[]', '[]']
      );
      return res.json({
        coins: 100,
        level: 1,
        exp: 0,
        plots: [],
        inventory: [],
        seedInventory: [
          { cropId: 'wheat', count: 8 },
          { cropId: 'carrot', count: 5 },
          { cropId: 'tomato', count: 3 },
        ],
        itemInventory: [],
        activeBuffs: [],
        growthBoostMultiplier: 1,
        refreshCount: 0,
      });
    }

    const row = result[0].values[0];
    const cols = result[0].columns;
    const get = (name: string): string => String(row[cols.indexOf(name)] ?? '');

    res.json({
      coins: Number(get('coins')) || 0,
      level: Number(get('level')) || 1,
      exp: Number(get('exp')) || 0,
      plots: JSON.parse(get('plots') || '[]'),
      inventory: JSON.parse(get('inventory') || '[]'),
      seedInventory: JSON.parse(get('seed_inventory') || '[]'),
      itemInventory: JSON.parse(get('item_inventory') || '[]'),
      activeBuffs: JSON.parse(get('active_buffs') || '[]'),
      growthBoostMultiplier: Number(get('growth_boost_multiplier')) || 1,
      refreshCount: Number(get('refresh_count')) || 0,
    });
  } catch (err) {
    console.error('[gameController] getFarmState error:', err);
    res.status(500).json({ error: 'Failed to get farm state' });
  }
}

// PUT /api/games/farm/state
export async function updateFarmState(req: Request, res: Response) {
  try {
    const db = await getDb();
    const userId = (req as any).user.id;
    const {
      coins, level, exp, plots, inventory,
      seedInventory, itemInventory, activeBuffs,
      growthBoostMultiplier, refreshCount,
    } = req.body;

    // UPSERT：不存在就插入，存在就更新
    const existing = await db.exec('SELECT id FROM game_farm_states WHERE user_id = ?', [userId]);
    if (!existing[0]?.values?.length) {
      await db.run(
        `INSERT INTO game_farm_states
         (user_id, coins, level, exp, plots, inventory, seed_inventory, item_inventory, active_buffs, growth_boost_multiplier, refresh_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, coins, level, exp,
         JSON.stringify(plots || []),
         JSON.stringify(inventory || []),
         JSON.stringify(seedInventory || []),
         JSON.stringify(itemInventory || []),
         JSON.stringify(activeBuffs || []),
         growthBoostMultiplier || 1,
         refreshCount || 0]
      );
    } else {
      await db.run(
        `UPDATE game_farm_states SET
         coins = ?, level = ?, exp = ?, plots = ?, inventory = ?,
         seed_inventory = ?, item_inventory = ?, active_buffs = ?,
         growth_boost_multiplier = ?, refresh_count = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [coins, level, exp,
         JSON.stringify(plots || []),
         JSON.stringify(inventory || []),
         JSON.stringify(seedInventory || []),
         JSON.stringify(itemInventory || []),
         JSON.stringify(activeBuffs || []),
         growthBoostMultiplier || 1,
         refreshCount || 0,
         userId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[gameController] updateFarmState error:', err);
    res.status(500).json({ error: 'Failed to update farm state' });
  }
}
