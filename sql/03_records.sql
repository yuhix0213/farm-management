-- ============================================================
--  牧場管理システム  DB初期化 SQL
--  ファイル 03: 体重・健康・子牛販売テーブル
--  ※ 01_masters.sql → 02_cattle.sql を先に実行すること
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+09:00';

-- ── 体重記録 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weight_records (
  id          INT          NOT NULL AUTO_INCREMENT,
  cattle_id   INT          NOT NULL                        COMMENT '個体ID',
  measured_at DATE         NOT NULL                        COMMENT '測定日',
  weight_kg   DECIMAL(6,1) NOT NULL                        COMMENT '体重(kg)',
  adg_kg      DECIMAL(4,2) NULL                            COMMENT '日増体量(kg/日)',
  bcs         TINYINT      NULL                            COMMENT 'ボディコンディションスコア(1-5)',
  staff_id    INT          NULL                            COMMENT '担当スタッフID',
  note        TEXT         NULL                            COMMENT '備考',
  PRIMARY KEY (id),
  UNIQUE KEY uq_weight_cattle_date (cattle_id, measured_at),
  INDEX idx_weight_date (measured_at),
  CONSTRAINT fk_weight_cattle FOREIGN KEY (cattle_id) REFERENCES cattle(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_weight_staff  FOREIGN KEY (staff_id)  REFERENCES staff(id)  ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_bcs CHECK (bcs IS NULL OR (bcs BETWEEN 1 AND 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='体重測定記録';

-- ── 健康記録 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_records (
  id           INT          NOT NULL AUTO_INCREMENT,
  cattle_id    INT          NOT NULL                        COMMENT '個体ID',
  record_date  DATE         NOT NULL                        COMMENT '記録日',
  record_type  ENUM('定期健診','疾病治療','ワクチン','予防処置','去勢手術')
               NOT NULL                                     COMMENT '種別',
  temperature  DECIMAL(3,1) NULL                            COMMENT '体温(℃)',
  diagnosis    VARCHAR(200) NULL                            COMMENT '診断内容',
  treatment    TEXT         NULL                            COMMENT '処置内容',
  medicine     VARCHAR(200) NULL                            COMMENT '使用薬品',
  cost         INT          NULL                            COMMENT '費用(円)',
  vet_name     VARCHAR(50)  NULL                            COMMENT '担当獣医師',
  next_checkup DATE         NULL                            COMMENT '次回健診予定日',
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_health_cattle (cattle_id),
  INDEX idx_health_date   (record_date),
  CONSTRAINT fk_health_cattle FOREIGN KEY (cattle_id) REFERENCES cattle(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='健康・診療記録';

-- ── 子牛販売台帳 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calf_sales (
  id              INT          NOT NULL AUTO_INCREMENT,
  ear_tag_no      VARCHAR(20)  NOT NULL                    COMMENT '子牛耳標番号',
  mother_ear_tag  VARCHAR(20)  NULL                        COMMENT '母牛耳標番号',
  birth_record_id INT          NULL                        COMMENT '分娩記録ID',
  breed           VARCHAR(50)  NULL                        COMMENT '品種',
  sex             ENUM('雌','去勢','雄') NULL               COMMENT '性別',
  date_of_birth   DATE         NULL                        COMMENT '生年月日',
  age_days        SMALLINT     NULL                        COMMENT '日齢',
  weight_kg       DECIMAL(5,1) NULL                        COMMENT '体重(kg)',
  market          VARCHAR(100) NULL                        COMMENT '販売市場名',
  sale_date       DATE         NULL                        COMMENT '上場日',
  price           INT          NULL                        COMMENT '落札額(円)',
  buyer           VARCHAR(100) NULL                        COMMENT '落札者',
  status          VARCHAR(20)  NOT NULL DEFAULT '登録済'   COMMENT '状態（登録済/予定/完了）',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_calf_ear_tag (ear_tag_no),
  INDEX idx_sale_date   (sale_date),
  INDEX idx_sale_status (status),
  CONSTRAINT fk_calf_birth FOREIGN KEY (birth_record_id) REFERENCES birth_records(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='子牛販売台帳';

-- ============================================================
--  サンプルデータ（プレテスト用・必要に応じて削除）
-- ============================================================

-- 体重記録サンプル
INSERT INTO weight_records (cattle_id, measured_at, weight_kg, adg_kg, bcs, staff_id) VALUES
  (1, '2026-04-30', 487, 0.62, 3, 1),
  (1, '2026-05-16', 510, 0.24, 3, 1),
  (2, '2026-04-30', 519, 0.90, 3, 1),
  (2, '2026-05-16', 542, 0.96, 3, 1),
  (3, '2026-05-15', 498, 0.95, 3, 1),
  (4, '2026-05-14', 561, 0.81, 3, 3);

-- 健康記録サンプル
INSERT INTO health_records (cattle_id, record_date, record_type, temperature, diagnosis, treatment, medicine, cost, vet_name, next_checkup) VALUES
  (1, '2026-05-16', '疾病治療', 39.8, '発熱（原因調査中）', '解熱剤投与', 'メタカム', 3200, '田中獣医師', '2026-05-19'),
  (2, '2026-04-15', 'ワクチン',  38.4, '定期ワクチン接種', '牛RSウイルスワクチン', 'ボビリスRSV', 1800, '田中獣医師', '2026-10-15');

-- 子牛販売台帳サンプル
INSERT INTO calf_sales (ear_tag_no, mother_ear_tag, breed, sex, date_of_birth, age_days, weight_kg, market, sale_date, price, buyer, status) VALUES
  ('3012-0301', '3012-0092', 'ホルスタイン×黒毛和種', '雄',   '2026-02-28', 76,  92,  '網走家畜市場', '2026-05-15', 385000, '○○牧場', '完了'),
  ('3012-0302', '3012-0118', 'ホルスタイン',           '雌',   '2026-03-10', 66,  84,  '北見家畜市場', '2026-05-20', NULL,   NULL,     '予定'),
  ('3012-0303', '3012-0092', 'ホルスタイン×黒毛和種', '去勢', '2026-01-15', 121, 118, '網走家畜市場', '2026-04-28', 412000, '△△農場', '完了'),
  ('3012-0304', '3012-0118', '黒毛和種',               '雌',   '2026-03-25', 52,  71,  '網走家畜市場', '2026-05-22', NULL,   NULL,     '予定'),
  ('3012-0305', '3012-0092', 'ホルスタイン',           '雄',   '2026-04-02', 44,  63,  '未定',         NULL,         NULL,   NULL,     '登録済');

SELECT '体重・健康・子牛販売テーブル作成・サンプルデータ投入 完了' AS result;
