// constant.ts
export const HZ = "漢字";
export const BH = "總筆畫數";
export const BS = "部首餘筆";
export const SW = "說文";
export const GYHZ = "匯纂";
export const KX = "康熙";
export const HD = "漢大";
export const LF = "兩分";
export const ZX = "字形描述";
export const WBH = "五筆畫";
export const VA = "異體字";
export const VS = "字形變體";
export const FL = "分類";

export const MAP = " \uD83C\uDF0F ";
export const IS_FAVORITE = "is_favorite";
export const VARIANTS = "variants";
export const COMMENT = "comment";
export const INDEX = "索引";
export const LANGUAGE = "語言";
export const LABEL = "簡稱";

export const SG = "鄭張";
export const BA = "白-沙";
export const GY = "廣韻";
export const ZYYY = "中原音韻";
export const DGY = "東干語";
export const CMN = "普通話";
export const HK = "香港";
export const TW = "臺灣";
export const KOR = "朝鮮";
export const VI = "越南";
export const JA_GO = "日語吳音";
export const JA_KAN = "日語漢音";
export const JA_OTHER = "日語其他";
export const JA_ = "日語";
export const WB_ = "五筆";
 
export const FQ = "分區";
export const COLOR = "顏色";
export const ORDER = "排序";
export const FIRST_FQ = "地圖集二分區";
export const PROVINCE = "省";
export const RECOMMEND = "推薦人";
export const EDITOR = "維護人";
 
export enum SEARCH_TYPE {
    HZ, YIN, YI, DICTIONARY,
}

export enum FILTER {
    ALL, ISLAND, HZ, CURRENT, RECOMMEND, CUSTOM, DIVISION, AREA, EDITOR
}

export const COL_ALL_LANGUAGES = 1000;
export const ALL_LANGUAGES = "*";

export const TABLE_NAME = "mcpdict";
export const TABLE_INFO = "info"; 
export const EDITOR_COLUMNS = ["作者", "錄入人", "維護人"]; 
 
 