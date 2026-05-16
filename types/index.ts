// types/index.ts — 共通型定義
export type CattleStatus = '育成中'|'肥育中'|'繁殖中'|'泌乳中'|'出荷予定'|'出荷済'|'死廃'
export type CowStatus    = '妊娠中'|'授精待ち'|'空胎中'|'分娩後'
export type Sex          = '雌'|'去勢'|'雄'

export interface Cattle {
  id: number; ear_tag_no: string; farm_id?: string
  breed: string; sex: Sex; cattle_type: string
  date_of_birth: string; intro_date?: string
  intro_weight_kg?: number; intro_price?: number; origin?: string
  barn_id?: number; barn_name?: string; stall_no?: string
  status: CattleStatus; staff_id?: number; staff_name?: string
  note?: string; created_at: string; updated_at: string
}

export interface Cow {
  id: number; ear_tag_no: string; farm_id?: string
  breed?: string; date_of_birth?: string; status: CowStatus
  parity: number; bull_id?: number; bull_name?: string
  last_insem_date?: string; expected_birth?: string
  barn_id?: number; stall_no?: string; note?: string
}

export interface Bull {
  id: number; name: string; reg_no?: string; breed?: string
  type: string; owner?: string; bms?: string; note?: string
}

export interface BirthRecord {
  id: number; cow_id: number; cow_ear_tag?: string
  bull_id?: number; bull_name?: string; insem_date?: string
  birth_date: string; calf_ear_tag: string; calf_sex?: Sex
  calf_weight_kg?: number; dystocia: boolean
  staff_id?: number; note?: string; created_at: string
}

export interface WeightRecord {
  id: number; cattle_id: number; measured_at: string
  weight_kg: number; adg_kg?: number; bcs?: number
  staff_id?: number; note?: string
}

export interface HealthRecord {
  id: number; cattle_id: number; record_date: string
  record_type: string; temperature?: number; diagnosis?: string
  treatment?: string; medicine?: string; cost?: number
  vet_name?: string; next_checkup?: string; created_at: string
}

export interface CalfSale {
  id: number; ear_tag_no: string; mother_ear_tag?: string
  birth_record_id?: number; breed?: string; sex?: Sex
  date_of_birth?: string; age_days?: number; weight_kg?: number
  market?: string; sale_date?: string; price?: number
  buyer?: string; status: string; created_at: string
}

export interface WeatherData {
  current: { temp: number; apparent: number; humidity: number; wind: number; code: number }
  daily: Array<{ date: string; max: number; min: number; rain: number; code: number }>
}
