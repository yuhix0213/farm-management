-- ============================================================
--  牧場管理システム  DB初期化 SQL
--  ファイル 01: マスタテーブル（barns / staff / bulls）
--  対象DB  : farm_management
--  文字コード: utf8mb4
--  実行方法 : phpMyAdmin → farm_management を選択 → SQLタブ
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+09:00';

-- ── 牛舎マスタ ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS barns (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(50)  NOT NULL COMMENT '牛舎名',
  type       VARCHAR(30)  NULL     COMMENT '種別（肥育/繁殖/育成/分娩）',
  capacity   SMALLINT     NULL     COMMENT '収容頭数',
  note       TEXT         NULL     COMMENT '備考',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_barn_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='牛舎マスタ';

-- ── スタッフマスタ ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id    INT          NOT NULL AUTO_INCREMENT,
  name  VARCHAR(50)  NOT NULL COMMENT '氏名',
  role  VARCHAR(30)  NULL     COMMENT '役職',
  phone VARCHAR(20)  NULL     COMMENT '電話番号',
  email VARCHAR(100) NULL     COMMENT 'メールアドレス',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='スタッフマスタ';

-- ── 種牛台帳 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bulls (
  id     INT          NOT NULL AUTO_INCREMENT,
  name   VARCHAR(50)  NOT NULL COMMENT '名号',
  reg_no VARCHAR(30)  NULL     COMMENT '登録番号',
  breed  VARCHAR(50)  NULL     COMMENT '品種',
  type   VARCHAR(20)  NOT NULL DEFAULT '精液' COMMENT '種別（精液/自家保有）',
  owner  VARCHAR(100) NULL     COMMENT '所有者・供給元',
  bms    VARCHAR(30)  NULL     COMMENT 'BMS傾向',
  note   TEXT         NULL     COMMENT '備考',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='種牛台帳';

-- ============================================================
--  初期データ投入
-- ============================================================

INSERT INTO barns (name, type, capacity, note) VALUES
  ('A棟', '肥育', 60, '肥育牛専用'),
  ('B棟', '繁殖', 30, '母牛・繁殖牛専用'),
  ('C棟', '育成', 40, '育成牛専用'),
  ('D棟', '分娩', 10, '分娩前後の管理');

INSERT INTO staff (name, role, phone) VALUES
  ('田中', '主任',   '090-XXXX-XXXX'),
  ('鈴木', '担当者', '090-XXXX-XXXX'),
  ('佐藤', '担当者', '090-XXXX-XXXX');

INSERT INTO bulls (name, reg_no, breed, type, owner, bms, note) VALUES
  ('安福久', 'K-00124', '黒毛和種', '精液',   '○○種苗センター',    '8.2平均', '優秀な産肉能力'),
  ('糸福',   'K-00287', '黒毛和種', '精液',   '北海道酪農センター', '7.8平均', '難産少ない'),
  ('勝忠平', 'K-00412', '黒毛和種', '自家保有', '自場',             '9.1平均', '高BMS精液');

SELECT 'マスタテーブル作成・初期データ投入 完了' AS result;
