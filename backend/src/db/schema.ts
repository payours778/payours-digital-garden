import getDb from "./index";

/**
 * MySQL 版 schema 初始化。
 * 覆盖原 sql.js 时代在 getDb() 中动态执行的全部建表/建索引逻辑。
 * 使用幂等 CREATE TABLE IF NOT EXISTS，可重复执行。
 *
 * 对比原 SQLite schema 的注意点：
 *  - INTEGER PRIMARY KEY AUTOINCREMENT  -> BIGINT AUTO_INCREMENT
 *  - TEXT 列在 MySQL 使用 TEXT / VARCHAR
 *  - DATETIME DEFAULT CURRENT_TIMESTAMP 语法 MySQL 同样支持
 *  - 布尔用 TINYINT(1)（原 is_public 用 INTEGER）
 */
export async function initSchema(): Promise<void> {
  const db = await getDb();

  // ---- 建表（列名与原 controllers 位置索引一一对应）----
  const statements: string[] = [
    `CREATE TABLE IF NOT EXISTS posts (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT NOT NULL,
      excerpt TEXT,
      slug VARCHAR(255) UNIQUE NOT NULL,
      cover TEXT,
      views INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      tags TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS users (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20) UNIQUE,
      role VARCHAR(20) DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS essays (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT NOT NULL,
      excerpt TEXT,
      cover TEXT,
      date VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS moments (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      content TEXT NOT NULL,
      images TEXT,
      likes INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS albums (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      cover TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS photos (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      album_id BIGINT NOT NULL,
      url TEXT NOT NULL,
      caption TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS projects (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      tech TEXT,
      link TEXT,
      stars INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS music (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255),
      url TEXT NOT NULL,
      cover TEXT,
      duration VARCHAR(20) DEFAULT '00:00',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS fish_rooms (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(64) UNIQUE NOT NULL,
      owner_id BIGINT,
      room_type VARCHAR(20) NOT NULL DEFAULT 'private',
      lifecycle VARCHAR(20) NOT NULL DEFAULT 'permanent',
      is_public TINYINT(1) NOT NULL DEFAULT 0,
      max_participants INT DEFAULT 10,
      destroyed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS fish_room_participants (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      room_id BIGINT,
      token VARCHAR(64),
      nickname VARCHAR(50) NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS fish_messages (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      room_id BIGINT,
      sender_nickname VARCHAR(50),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS game_farm_states (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL UNIQUE,
      coins INT DEFAULT 100,
      level INT DEFAULT 1,
      exp INT DEFAULT 0,
      plots TEXT,
      inventory TEXT,
      seed_inventory TEXT,
      item_inventory TEXT,
      active_buffs TEXT,
      growth_boost_multiplier INT DEFAULT 1,
      refresh_count INT DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];

  for (const s of statements) {
    await db.run(s);
  }

  // ---- 索引（MySQL 不支持 CREATE INDEX IF NOT EXISTS，需先查再建）----
  const indexes: Array<[string, string]> = [
    ["idx_posts_created", "posts(created_at)"],
    ["idx_posts_slug", "posts(slug)"],
    ["idx_essays_date", "essays(date)"],
    ["idx_moments_created", "moments(created_at)"],
    ["idx_albums_created", "albums(created_at)"],
    ["idx_photos_album", "photos(album_id, created_at)"],
    ["idx_projects_created", "projects(created_at)"],
    ["idx_music_created", "music(created_at)"],
    ["idx_fish_rooms_code", "fish_rooms(code)"],
    ["idx_fish_participants_room", "fish_room_participants(room_id, last_active)"],
    ["idx_fish_participants_token", "fish_room_participants(token)"],
    ["idx_fish_messages_room", "fish_messages(room_id, id)"],
    ["idx_users_username", "users(username)"],
    ["idx_game_farm_user", "game_farm_states(user_id)"],
  ];

  const dbName = process.env.DB_NAME || "blog_db";
  for (const [name, on] of indexes) {
    const exists = await db.exec(
      "SELECT 1 FROM information_schema.statistics WHERE table_schema = ? AND index_name = ? LIMIT 1",
      [dbName, name]
    );
    if (exists[0]?.values?.length) {
      continue;
    }
    await db.run(`CREATE INDEX ${name} ON ${on}`);
  }
}