-- ============================================================
--  牧場管理システム  DB初期化 SQL
--  ファイル 02: 個体・母牛・分娩テーブル
--  ※ 01_masters.sql を先に実行すること
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+09:00';

-- ── 個体マスタ ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cattle (
  id              INT          NOT NULL AUTO_INCREMENT,
  ear_tag_no      VARCHAR(20)  NOT NULL                        COMMENT '耳標番号',
  farm_id         VARCHAR(20)  NULL                            COMMENT '農場内管理番号',
  breed           VARCHAR(50)  NOT NULL                        COMMENT '品種',
  sex             ENUM('雌','去勢','雄') NOT NULL              COMMENT '性別',
  cattle_type     ENUM('肉牛_繁殖','肉牛_肥育','乳牛','兼用')
                  NOT NULL                                     COMMENT '用途区分',
  date_of_birth   DATE         NOT NULL                        COMMENT '生年月日',
  intro_date      DATE         NULL                            COMMENT '導入日',
  intro_weight_kg DECIMAL(6,1) NULL                            COMMENT '導入時体重(kg)',
  intro_price     INT          NULL                            COMMENT '導入価格(円)',
  origin          ENUM('自家産','購入','預託') NULL             COMMENT '導入区分',
  barn_id         INT          NULL                            COMMENT '牛舎ID',
  stall_no        VARCHAR(10)  NULL                            COMMENT '房番号',
  status          ENUM('育成中','肥育中','繁殖中','泌乳中','出荷予定','出荷済','死廃')
                  NOT NULL DEFAULT '育成中'                    COMMENT '飼養状態',
  staff_id        INT          NULL                            COMMENT '担当スタッフID',
  note            TEXT         NULL                            COMMENT '備考',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ear_tag (ear_tag_no),
  INDEX idx_status  (status),
  INDEX idx_barn    (barn_id),
  INDEX idx_staff   (staff_id),
  CONSTRAINT fk_cattle_barn  FOREIGN KEY (barn_id)  REFERENCES barns(id)  ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_cattle_staff FOREIGN KEY (staff_id) REFERENCES staff(id)  ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='個体マスタ';

-- ── 母牛台帳 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cows (
  id              INT          NOT NULL AUTO_INCREMENT,
  ear_tag_no      VARCHAR(20)  NOT NULL                        COMMENT '耳標番号',
  farm_id         VARCHAR(20)  NULL                            COMMENT '農場内管理番号',
  breed           VARCHAR(50)  NULL                            COMMENT '品種',
  date_of_birth   DATE         NULL                            COMMENT '生年月日',
  status          ENUM('妊娠中','授精待ち','空胎中','分娩後')
                  NOT NULL DEFAULT '空胎中'                    COMMENT '繁殖ステータス',
  parity          SMALLINT     NOT NULL DEFAULT 0              COMMENT '産次',
  bull_id         INT          NULL                            COMMENT '使用種牛ID',
  last_insem_date DATE         NULL                            COMMENT '最終授精日',
  expected_birth  DATE         NULL                            COMMENT '分娩予定日',
  barn_id         INT          NULL                            COMMENT '牛舎ID',
  stall_no        VARCHAR(10)  NULL                            COMMENT '房番号',
  note            TEXT         NULL                            COMMENT '備考',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cow_ear_tag (ear_tag_no),
  INDEX idx_cow_status (status),
  INDEX idx_cow_birth  (expected_birth),
  CONSTRAINT fk_cow_bull FOREIGN KEY (bull_id)  REFERENCES bulls(id)  ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_cow_barn FOREIGN KEY (barn_id)  REFERENCES barns(id)  ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='母牛台帳';

-- ── 分娩記録 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS birth_records (
  id              INT          NOT NULL AUTO_INCREMENT,
  cow_id          INT          NOT NULL                        COMMENT '母牛ID',
  bull_id         INT          NULL                            COMMENT '種牛ID',
  insem_date      DATE         NULL                            COMMENT '授精日',
  birth_date      DATE         NOT NULL                        COMMENT '分娩日',
  calf_ear_tag    VARCHAR(20)  NOT NULL                        COMMENT '子牛耳標番号',
  calf_sex        ENUM('雌','去勢','雄') NULL                  COMMENT '子牛性別',
  calf_weight_kg  DECIMAL(4,1) NULL                            COMMENT '生時体重(kg)',
  dystocia        TINYINT(1)   NOT NULL DEFAULT 0              COMMENT '難産フラグ(0:なし/1:あり)',
  staff_id        INT          NULL                            COMMENT '担当スタッフID',
  note            TEXT         NULL                            COMMENT '備考',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_birth_cow  (cow_id),
  INDEX idx_birth_date (birth_date),
  CONSTRAINT fk_birth_cow   FOREIGN KEY (cow_id)   REFERENCES cows(id)   ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_birth_bull  FOREIGN KEY (bull_id)  REFERENCES bulls(id)  ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_birth_staff FOREIGN KEY (staff_id) REFERENCES staff(id)  ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='分娩記録';

-- ============================================================
--  サンプルデータ（プレテスト用・必要に応じて削除）
-- ============================================================

INSERT INTO cows (ear_tag_no, farm_id, breed, date_of_birth, status, parity, bull_id, last_insem_date, expected_birth, barn_id, note) VALUES
  ('3012-0118', 'B-0118', 'ホルスタイン',      '2021-09-22', '妊娠中',   3, 1, '2025-08-19', '2026-05-20', 2, '分娩まで3日'),
  ('3012-0092', 'B-0092', 'ホルスタイン',      '2020-11-15', '授精待ち', 4, NULL, NULL, NULL, 2, '泌乳量良好'),
  ('3012-0155', 'B-0155', '黒毛和種',          '2019-06-03', '妊娠中',   5, 2, '2025-09-01', '2026-06-02', 2, ''),
  ('3012-0171', 'B-0171', 'ホルスタイン×黒毛', '2022-03-18', '空胎中',   2, NULL, '2025-07-10', NULL, 2, '受胎確認済み');

INSERT INTO cattle (ear_tag_no, farm_id, breed, sex, cattle_type, date_of_birth, intro_date, intro_weight_kg, barn_id, stall_no, status, staff_id, note) VALUES
  ('3012-0234', 'A-0234', '黒毛和種', '去勢', '肉牛_肥育', '2024-01-08', '2024-01-10', 85, 1, 'A-05', '肥育中', 1, '体温高め、増体鈍化'),
  ('3012-0241', 'A-0241', '黒毛和種', '去勢', '肉牛_肥育', '2024-03-12', '2024-03-14', 92, 1, 'A-12', '肥育中', 1, ''),
  ('3012-0228', 'A-0228', '黒毛和種', '去勢', '肉牛_肥育', '2024-02-20', '2024-02-22', 88, 1, 'A-09', '出荷予定', 1, '出荷予定5/22'),
  ('3012-0215', 'A-0215', '交雑種',   '去勢', '肉牛_肥育', '2023-12-05', '2023-12-07', 90, 1, 'A-15', '肥育中', 3, '');

SELECT '個体・母牛・分娩テーブル作成・サンプルデータ投入 完了' AS result;
