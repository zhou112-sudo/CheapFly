/**
 * One-off generator for src/data/airportCatalog.json
 * Run: node scripts/build-airport-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "src/data/airportCatalog.json");

const cities = [];

function c(row) {
  cities.push(row);
}

// —— 中国主要城市 / 机场（可继续扩充）——
c({
  id: "beijing",
  name: "北京",
  nameEn: "Beijing",
  country: "中国",
  metroCode: "BJS",
  keywords: ["pek", "pkx", "首都", "大兴"],
  airports: [
    { code: "PEK", name: "首都", nameEn: "Capital", pickerName: "北京首都国际机场" },
    { code: "PKX", name: "大兴", nameEn: "Daxing", pickerName: "北京大兴国际机场" },
  ],
});
c({
  id: "shanghai",
  name: "上海",
  nameEn: "Shanghai",
  country: "中国",
  metroCode: "SHA",
  keywords: ["pvg", "sha", "浦东", "虹桥"],
  airports: [
    { code: "PVG", name: "浦东", nameEn: "Pudong", pickerName: "上海浦东国际机场" },
    { code: "SHA", name: "虹桥", nameEn: "Hongqiao", pickerName: "上海虹桥国际机场" },
  ],
});
c({
  id: "guangzhou",
  name: "广州",
  nameEn: "Guangzhou",
  country: "中国",
  metroCode: "CAN",
  keywords: ["can", "白云", "baiyun"],
  airports: [{ code: "CAN", name: "白云", nameEn: "Baiyun", pickerName: "广州白云国际机场" }],
});
c({
  id: "shenzhen",
  name: "深圳",
  nameEn: "Shenzhen",
  country: "中国",
  metroCode: "SZX",
  keywords: ["szx", "宝安", "baoan"],
  airports: [{ code: "SZX", name: "宝安", nameEn: "Baoan", pickerName: "深圳宝安国际机场" }],
});
c({
  id: "chengdu",
  name: "成都",
  nameEn: "Chengdu",
  country: "中国",
  metroCode: "CTU",
  keywords: ["ctu", "tfu", "双流", "天府"],
  airports: [
    { code: "CTU", name: "双流", nameEn: "Shuangliu", pickerName: "成都双流国际机场" },
    { code: "TFU", name: "天府", nameEn: "Tianfu", pickerName: "成都天府国际机场" },
  ],
});
c({
  id: "hangzhou",
  name: "杭州",
  nameEn: "Hangzhou",
  country: "中国",
  metroCode: "HGH",
  keywords: ["hgh", "萧山"],
  airports: [{ code: "HGH", name: "萧山", nameEn: "Xiaoshan", pickerName: "杭州萧山国际机场" }],
});
c({
  id: "nanjing",
  name: "南京",
  nameEn: "Nanjing",
  country: "中国",
  metroCode: "NKG",
  keywords: ["nkg", "禄口"],
  airports: [{ code: "NKG", name: "禄口", nameEn: "Lukou", pickerName: "南京禄口国际机场" }],
});
c({
  id: "wuhan",
  name: "武汉",
  nameEn: "Wuhan",
  country: "中国",
  metroCode: "WUH",
  keywords: ["wuh", "天河"],
  airports: [{ code: "WUH", name: "天河", nameEn: "Tianhe", pickerName: "武汉天河国际机场" }],
});
c({
  id: "xian",
  name: "西安",
  nameEn: "Xi'an",
  country: "中国",
  metroCode: "SIA",
  keywords: ["xiy", "咸阳", "xian"],
  airports: [{ code: "XIY", name: "咸阳", nameEn: "Xianyang", pickerName: "西安咸阳国际机场" }],
});
c({
  id: "chongqing",
  name: "重庆",
  nameEn: "Chongqing",
  country: "中国",
  metroCode: "CKG",
  keywords: ["ckg", "江北"],
  airports: [{ code: "CKG", name: "江北", nameEn: "Jiangbei", pickerName: "重庆江北国际机场" }],
});
c({
  id: "qingdao",
  name: "青岛",
  nameEn: "Qingdao",
  country: "中国",
  metroCode: "TAO",
  keywords: ["tao", "胶东"],
  airports: [{ code: "TAO", name: "胶东", nameEn: "Jiaodong", pickerName: "青岛胶东国际机场" }],
});
c({
  id: "xiamen",
  name: "厦门",
  nameEn: "Xiamen",
  country: "中国",
  metroCode: "XMN",
  keywords: ["xmn", "高崎"],
  airports: [{ code: "XMN", name: "高崎", nameEn: "Gaoqi", pickerName: "厦门高崎国际机场" }],
});
c({
  id: "kunming",
  name: "昆明",
  nameEn: "Kunming",
  country: "中国",
  metroCode: "KMG",
  keywords: ["kmg", "长水"],
  airports: [{ code: "KMG", name: "长水", nameEn: "Changshui", pickerName: "昆明长水国际机场" }],
});
c({
  id: "sanya",
  name: "三亚",
  nameEn: "Sanya",
  country: "中国",
  metroCode: "SYX",
  keywords: ["syx", "凤凰"],
  airports: [{ code: "SYX", name: "凤凰", nameEn: "Fenghuang", pickerName: "三亚凤凰国际机场" }],
});
c({
  id: "haerbin",
  name: "哈尔滨",
  nameEn: "Harbin",
  country: "中国",
  metroCode: "HRB",
  keywords: ["hrb", "太平"],
  airports: [{ code: "HRB", name: "太平", nameEn: "Taiping", pickerName: "哈尔滨太平国际机场" }],
});
c({
  id: "changchun",
  name: "长春",
  nameEn: "Changchun",
  country: "中国",
  metroCode: "CGQ",
  keywords: ["cgq", "龙嘉"],
  airports: [{ code: "CGQ", name: "龙嘉", nameEn: "Longjia", pickerName: "长春龙嘉国际机场" }],
});
c({
  id: "shenyang",
  name: "沈阳",
  nameEn: "Shenyang",
  country: "中国",
  metroCode: "SHE",
  keywords: ["she", "桃仙"],
  airports: [{ code: "SHE", name: "桃仙", nameEn: "Taoxian", pickerName: "沈阳桃仙国际机场" }],
});
c({
  id: "dalian",
  name: "大连",
  nameEn: "Dalian",
  country: "中国",
  metroCode: "DLC",
  keywords: ["dlc", "周水子"],
  airports: [{ code: "DLC", name: "周水子", nameEn: "Zhoushuizi", pickerName: "大连周水子国际机场" }],
});
c({
  id: "jinan",
  name: "济南",
  nameEn: "Jinan",
  country: "中国",
  metroCode: "TNA",
  keywords: ["tna", "遥墙"],
  airports: [{ code: "TNA", name: "遥墙", nameEn: "Yaoqiang", pickerName: "济南遥墙国际机场" }],
});
c({
  id: "zhengzhou",
  name: "郑州",
  nameEn: "Zhengzhou",
  country: "中国",
  metroCode: "CGO",
  keywords: ["cgo", "新郑"],
  airports: [{ code: "CGO", name: "新郑", nameEn: "Xinzheng", pickerName: "郑州新郑国际机场" }],
});
c({
  id: "tianjin",
  name: "天津",
  nameEn: "Tianjin",
  country: "中国",
  metroCode: "TSN",
  keywords: ["tsn", "滨海"],
  airports: [{ code: "TSN", name: "滨海", nameEn: "Binhai", pickerName: "天津滨海国际机场" }],
});
c({
  id: "taiyuan",
  name: "太原",
  nameEn: "Taiyuan",
  country: "中国",
  metroCode: "TYN",
  keywords: ["tyn", "武宿"],
  airports: [{ code: "TYN", name: "武宿", nameEn: "Wusu", pickerName: "太原武宿国际机场" }],
});
c({
  id: "shijiazhuang",
  name: "石家庄",
  nameEn: "Shijiazhuang",
  country: "中国",
  metroCode: "SJW",
  keywords: ["sjw", "正定"],
  airports: [{ code: "SJW", name: "正定", nameEn: "Zhengding", pickerName: "石家庄正定国际机场" }],
});
c({
  id: "hefei",
  name: "合肥",
  nameEn: "Hefei",
  country: "中国",
  metroCode: "HFE",
  keywords: ["hfe", "新桥"],
  airports: [{ code: "HFE", name: "新桥", nameEn: "Xinqiao", pickerName: "合肥新桥国际机场" }],
});
c({
  id: "nanchang",
  name: "南昌",
  nameEn: "Nanchang",
  country: "中国",
  metroCode: "KHN",
  keywords: ["khn", "昌北"],
  airports: [{ code: "KHN", name: "昌北", nameEn: "Changbei", pickerName: "南昌昌北国际机场" }],
});
c({
  id: "fuzhou",
  name: "福州",
  nameEn: "Fuzhou",
  country: "中国",
  metroCode: "FOC",
  keywords: ["foc", "长乐"],
  airports: [{ code: "FOC", name: "长乐", nameEn: "Changle", pickerName: "福州长乐国际机场" }],
});
c({
  id: "nanning",
  name: "南宁",
  nameEn: "Nanning",
  country: "中国",
  metroCode: "NNG",
  keywords: ["nng", "吴圩"],
  airports: [{ code: "NNG", name: "吴圩", nameEn: "Wuxu", pickerName: "南宁吴圩国际机场" }],
});
c({
  id: "haikou",
  name: "海口",
  nameEn: "Haikou",
  country: "中国",
  metroCode: "HAK",
  keywords: ["hak", "美兰"],
  airports: [{ code: "HAK", name: "美兰", nameEn: "Meilan", pickerName: "海口美兰国际机场" }],
});
c({
  id: "changsha",
  name: "长沙",
  nameEn: "Changsha",
  country: "中国",
  metroCode: "CSX",
  keywords: ["csx", "黄花"],
  airports: [{ code: "CSX", name: "黄花", nameEn: "Huanghua", pickerName: "长沙黄花国际机场" }],
});
c({
  id: "guiyang",
  name: "贵阳",
  nameEn: "Guiyang",
  country: "中国",
  metroCode: "KWE",
  keywords: ["kwe", "龙洞堡"],
  airports: [{ code: "KWE", name: "龙洞堡", nameEn: "Longdongbao", pickerName: "贵阳龙洞堡国际机场" }],
});
c({
  id: "lanzhou",
  name: "兰州",
  nameEn: "Lanzhou",
  country: "中国",
  metroCode: "LHW",
  keywords: ["lhw", "中川"],
  airports: [{ code: "LHW", name: "中川", nameEn: "Zhongchuan", pickerName: "兰州中川国际机场" }],
});
c({
  id: "yinchuan",
  name: "银川",
  nameEn: "Yinchuan",
  country: "中国",
  metroCode: "INC",
  keywords: ["inc", "河东"],
  airports: [{ code: "INC", name: "河东", nameEn: "Hedong", pickerName: "银川河东国际机场" }],
});
c({
  id: "xining",
  name: "西宁",
  nameEn: "Xining",
  country: "中国",
  metroCode: "XNN",
  keywords: ["xnn", "曹家堡"],
  airports: [{ code: "XNN", name: "曹家堡", nameEn: "Caojiabao", pickerName: "西宁曹家堡国际机场" }],
});
c({
  id: "huhehaote",
  name: "呼和浩特",
  nameEn: "Hohhot",
  country: "中国",
  metroCode: "HET",
  keywords: ["het", "白塔"],
  airports: [{ code: "HET", name: "白塔", nameEn: "Baita", pickerName: "呼和浩特白塔国际机场" }],
});
c({
  id: "wulumuqi",
  name: "乌鲁木齐",
  nameEn: "Urumqi",
  country: "中国",
  metroCode: "URC",
  keywords: ["urc", "地窝堡"],
  airports: [{ code: "URC", name: "地窝堡", nameEn: "Diwopu", pickerName: "乌鲁木齐地窝堡国际机场" }],
});
c({
  id: "lasa",
  name: "拉萨",
  nameEn: "Lhasa",
  country: "中国",
  metroCode: "LXA",
  keywords: ["lxa", "贡嘎"],
  airports: [{ code: "LXA", name: "贡嘎", nameEn: "Gonggar", pickerName: "拉萨贡嘎国际机场" }],
});
c({
  id: "wenzhou",
  name: "温州",
  nameEn: "Wenzhou",
  country: "中国",
  metroCode: "WNZ",
  keywords: ["wnz", "龙湾"],
  airports: [{ code: "WNZ", name: "龙湾", nameEn: "Longwan", pickerName: "温州龙湾国际机场" }],
});
c({
  id: "ningbo",
  name: "宁波",
  nameEn: "Ningbo",
  country: "中国",
  metroCode: "NGB",
  keywords: ["ngb", "栎社"],
  airports: [{ code: "NGB", name: "栎社", nameEn: "Lishe", pickerName: "宁波栎社国际机场" }],
});
c({
  id: "wuxi",
  name: "无锡",
  nameEn: "Wuxi",
  country: "中国",
  metroCode: "WUX",
  keywords: ["wux", "硕放"],
  airports: [{ code: "WUX", name: "硕放", nameEn: "Shuofang", pickerName: "苏南硕放国际机场" }],
});
c({
  id: "zhuhai",
  name: "珠海",
  nameEn: "Zhuhai",
  country: "中国",
  metroCode: "ZUH",
  keywords: ["zuh", "金湾"],
  airports: [{ code: "ZUH", name: "金湾", nameEn: "Jinwan", pickerName: "珠海金湾国际机场" }],
});
c({
  id: "quanzhou",
  name: "泉州",
  nameEn: "Quanzhou",
  country: "中国",
  metroCode: "JJN",
  keywords: ["jjn", "晋江"],
  airports: [{ code: "JJN", name: "晋江", nameEn: "Jinjiang", pickerName: "泉州晋江国际机场" }],
});
c({
  id: "yantai",
  name: "烟台",
  nameEn: "Yantai",
  country: "中国",
  metroCode: "YNT",
  keywords: ["ynt", "蓬莱"],
  airports: [{ code: "YNT", name: "蓬莱", nameEn: "Penglai", pickerName: "烟台蓬莱国际机场" }],
});
c({
  id: "weihai",
  name: "威海",
  nameEn: "Weihai",
  country: "中国",
  metroCode: "WEH",
  keywords: ["weh", "大水泊"],
  airports: [{ code: "WEH", name: "大水泊", nameEn: "Dashuipo", pickerName: "威海大水泊国际机场" }],
});
c({
  id: "guilin",
  name: "桂林",
  nameEn: "Guilin",
  country: "中国",
  metroCode: "KWL",
  keywords: ["kwl", "两江"],
  airports: [{ code: "KWL", name: "两江", nameEn: "Liangjiang", pickerName: "桂林两江国际机场" }],
});
c({
  id: "lijiang",
  name: "丽江",
  nameEn: "Lijiang",
  country: "中国",
  metroCode: "LJG",
  keywords: ["ljg", "三义"],
  airports: [{ code: "LJG", name: "三义", nameEn: "Sanyi", pickerName: "丽江三义国际机场" }],
});
c({
  id: "xishuangbanna",
  name: "西双版纳",
  nameEn: "Xishuangbanna",
  country: "中国",
  metroCode: "JHG",
  keywords: ["jhg", "嘎洒"],
  airports: [{ code: "JHG", name: "嘎洒", nameEn: "Gasa", pickerName: "西双版纳嘎洒国际机场" }],
});
c({
  id: "zhangjiajie",
  name: "张家界",
  nameEn: "Zhangjiajie",
  country: "中国",
  metroCode: "DYG",
  keywords: ["dyg", "荷花"],
  airports: [{ code: "DYG", name: "荷花", nameEn: "Hehua", pickerName: "张家界荷花国际机场" }],
});
c({
  id: "huangshan",
  name: "黄山",
  nameEn: "Huangshan",
  country: "中国",
  metroCode: "TXN",
  keywords: ["txn", "屯溪"],
  airports: [{ code: "TXN", name: "屯溪", nameEn: "Tunxi", pickerName: "黄山屯溪国际机场" }],
});
c({
  id: "mianyang",
  name: "绵阳",
  nameEn: "Mianyang",
  country: "中国",
  metroCode: "MIG",
  keywords: ["mig", "南郊"],
  airports: [{ code: "MIG", name: "南郊", nameEn: "Nanjiao", pickerName: "绵阳南郊机场" }],
});
c({
  id: "yichang",
  name: "宜昌",
  nameEn: "Yichang",
  country: "中国",
  metroCode: "YIH",
  keywords: ["yih", "三峡"],
  airports: [{ code: "YIH", name: "三峡", nameEn: "Sanxia", pickerName: "宜昌三峡机场" }],
});
c({
  id: "huizhou",
  name: "惠州",
  nameEn: "Huizhou",
  country: "中国",
  metroCode: "HUZ",
  keywords: ["huz", "平潭"],
  airports: [{ code: "HUZ", name: "平潭", nameEn: "Pingtan", pickerName: "惠州平潭机场" }],
});
c({
  id: "zhongwei",
  name: "中卫",
  nameEn: "Zhongwei",
  country: "中国",
  metroCode: "ZHY",
  keywords: ["zhy", "沙坡头"],
  airports: [{ code: "ZHY", name: "沙坡头", nameEn: "Shapotou", pickerName: "中卫沙坡头机场" }],
});
c({
  id: "yanan",
  name: "延安",
  nameEn: "Yan'an",
  country: "中国",
  metroCode: "ENY",
  keywords: ["eny", "南泥湾", "yanan"],
  airports: [{ code: "ENY", name: "南泥湾", nameEn: "Nanniwan", pickerName: "延安南泥湾机场" }],
});
c({
  id: "handan",
  name: "邯郸",
  nameEn: "Handan",
  country: "中国",
  metroCode: "HDG",
  keywords: ["hdg"],
  airports: [{ code: "HDG", name: "邯郸", nameEn: "Handan", pickerName: "邯郸机场" }],
});
c({
  id: "baotou",
  name: "包头",
  nameEn: "Baotou",
  country: "中国",
  metroCode: "BAV",
  keywords: ["bav", "二里半"],
  airports: [{ code: "BAV", name: "二里半", nameEn: "Erliban", pickerName: "包头东河机场" }],
});
c({
  id: "qionghai",
  name: "琼海",
  nameEn: "Qionghai",
  country: "中国",
  metroCode: "BAR",
  keywords: ["bar", "博鳌", "boao"],
  airports: [{ code: "BAR", name: "博鳌", nameEn: "Boao", pickerName: "琼海博鳌国际机场" }],
});

// —— 国际主要枢纽（示例级覆盖，可继续扩充）——
c({
  id: "newyork",
  name: "纽约",
  nameEn: "New York",
  country: "美国",
  metroCode: "NYC",
  keywords: ["jfk", "ewr", "lga", "肯尼迪", "纽瓦克", "拉瓜迪亚"],
  airports: [
    { code: "JFK", name: "肯尼迪", nameEn: "Kennedy", pickerName: "约翰·F·肯尼迪国际机场" },
    { code: "EWR", name: "纽瓦克", nameEn: "Newark", pickerName: "纽瓦克自由国际机场" },
    { code: "LGA", name: "拉瓜迪亚", nameEn: "LaGuardia", pickerName: "纽约拉瓜迪亚机场" },
  ],
});
c({
  id: "losangeles",
  name: "洛杉矶",
  nameEn: "Los Angeles",
  country: "美国",
  metroCode: "LAX",
  keywords: ["lax"],
  airports: [{ code: "LAX", name: "洛杉矶", nameEn: "Los Angeles", pickerName: "洛杉矶国际机场" }],
});
c({
  id: "sanfrancisco",
  name: "旧金山",
  nameEn: "San Francisco",
  country: "美国",
  metroCode: "SFO",
  keywords: ["sfo", "oak", "sjc", "奥克兰", "圣何塞"],
  airports: [
    { code: "SFO", name: "旧金山", nameEn: "San Francisco", pickerName: "旧金山国际机场" },
    { code: "OAK", name: "奥克兰", nameEn: "Oakland", pickerName: "奥克兰国际机场" },
    { code: "SJC", name: "圣何塞", nameEn: "San Jose", pickerName: "圣何塞国际机场" },
  ],
});
c({
  id: "chicago",
  name: "芝加哥",
  nameEn: "Chicago",
  country: "美国",
  metroCode: "CHI",
  keywords: ["ord", "mdw", "奥黑尔", "中途岛"],
  airports: [
    { code: "ORD", name: "奥黑尔", nameEn: "OHare", pickerName: "芝加哥奥黑尔国际机场" },
    { code: "MDW", name: "中途岛", nameEn: "Midway", pickerName: "芝加哥中途国际机场" },
  ],
});
c({
  id: "seattle",
  name: "西雅图",
  nameEn: "Seattle",
  country: "美国",
  metroCode: "SEA",
  keywords: ["sea"],
  airports: [{ code: "SEA", name: "西雅图", nameEn: "Seattle", pickerName: "西雅图-塔科马国际机场" }],
});
c({
  id: "boston",
  name: "波士顿",
  nameEn: "Boston",
  country: "美国",
  metroCode: "BOS",
  keywords: ["bos", "洛根"],
  airports: [{ code: "BOS", name: "洛根", nameEn: "Logan", pickerName: "波士顿洛根国际机场" }],
});
c({
  id: "miami",
  name: "迈阿密",
  nameEn: "Miami",
  country: "美国",
  metroCode: "MIA",
  keywords: ["mia"],
  airports: [{ code: "MIA", name: "迈阿密", nameEn: "Miami", pickerName: "迈阿密国际机场" }],
});
c({
  id: "washington",
  name: "华盛顿",
  nameEn: "Washington",
  country: "美国",
  metroCode: "WAS",
  keywords: ["iad", "dca", "杜勒斯", "里根"],
  airports: [
    { code: "IAD", name: "杜勒斯", nameEn: "Dulles", pickerName: "华盛顿杜勒斯国际机场" },
    { code: "DCA", name: "里根", nameEn: "Reagan", pickerName: "罗纳德·里根华盛顿国家机场" },
  ],
});
c({
  id: "london",
  name: "伦敦",
  nameEn: "London",
  country: "英国",
  metroCode: "LON",
  keywords: ["lhr", "lgw", "stn", "希思罗", "盖特威克"],
  airports: [
    { code: "LHR", name: "希思罗", nameEn: "Heathrow", pickerName: "伦敦希思罗机场" },
    { code: "LGW", name: "盖特威克", nameEn: "Gatwick", pickerName: "伦敦盖特威克机场" },
    { code: "STN", name: "斯坦斯特德", nameEn: "Stansted", pickerName: "伦敦斯坦斯特德机场" },
  ],
});
c({
  id: "paris",
  name: "巴黎",
  nameEn: "Paris",
  country: "法国",
  metroCode: "PAR",
  keywords: ["cdg", "ory", "戴高乐", "奥利"],
  airports: [
    { code: "CDG", name: "戴高乐", nameEn: "Charles de Gaulle", pickerName: "巴黎夏尔·戴高乐机场" },
    { code: "ORY", name: "奥利", nameEn: "Orly", pickerName: "巴黎奥利机场" },
  ],
});
c({
  id: "frankfurt",
  name: "法兰克福",
  nameEn: "Frankfurt",
  country: "德国",
  metroCode: "FRA",
  keywords: ["fra", "美因"],
  airports: [{ code: "FRA", name: "美因", nameEn: "Frankfurt Airport", pickerName: "法兰克福机场" }],
});
c({
  id: "amsterdam",
  name: "阿姆斯特丹",
  nameEn: "Amsterdam",
  country: "荷兰",
  metroCode: "AMS",
  keywords: ["ams", "史基浦", "schiphol"],
  airports: [{ code: "AMS", name: "史基浦", nameEn: "Schiphol", pickerName: "阿姆斯特丹史基浦机场" }],
});
c({
  id: "rome",
  name: "罗马",
  nameEn: "Rome",
  country: "意大利",
  metroCode: "ROM",
  keywords: ["fco", "cia"],
  airports: [
    { code: "FCO", name: "菲乌米奇诺", nameEn: "Fiumicino", pickerName: "罗马菲乌米奇诺机场" },
    { code: "CIA", name: "钱皮诺", nameEn: "Ciampino", pickerName: "罗马钱皮诺机场" },
  ],
});
c({
  id: "madrid",
  name: "马德里",
  nameEn: "Madrid",
  country: "西班牙",
  metroCode: "MAD",
  keywords: ["mad", "巴拉哈斯"],
  airports: [{ code: "MAD", name: "巴拉哈斯", nameEn: "Barajas", pickerName: "马德里巴拉哈斯机场" }],
});
c({
  id: "tokyo",
  name: "东京",
  nameEn: "Tokyo",
  country: "日本",
  metroCode: "TYO",
  keywords: ["nrt", "hnd", "成田", "羽田"],
  airports: [
    { code: "NRT", name: "成田", nameEn: "Narita", pickerName: "东京成田国际机场" },
    { code: "HND", name: "羽田", nameEn: "Haneda", pickerName: "东京羽田机场" },
  ],
});
c({
  id: "osaka",
  name: "大阪",
  nameEn: "Osaka",
  country: "日本",
  metroCode: "OSA",
  keywords: ["kix", "itm", "关西", "伊丹"],
  airports: [
    { code: "KIX", name: "关西", nameEn: "Kansai", pickerName: "大阪关西国际机场" },
    { code: "ITM", name: "伊丹", nameEn: "Itami", pickerName: "大阪伊丹机场" },
  ],
});
c({
  id: "seoul",
  name: "首尔",
  nameEn: "Seoul",
  country: "韩国",
  metroCode: "SEL",
  keywords: ["icn", "gmp", "仁川", "金浦"],
  airports: [
    { code: "ICN", name: "仁川", nameEn: "Incheon", pickerName: "首尔仁川国际机场" },
    { code: "GMP", name: "金浦", nameEn: "Gimpo", pickerName: "首尔金浦国际机场" },
  ],
});
c({
  id: "singapore",
  name: "新加坡",
  nameEn: "Singapore",
  country: "新加坡",
  metroCode: "SIN",
  keywords: ["sin", "樟宜", "changi"],
  airports: [{ code: "SIN", name: "樟宜", nameEn: "Changi", pickerName: "新加坡樟宜机场" }],
});
c({
  id: "bangkok",
  name: "曼谷",
  nameEn: "Bangkok",
  country: "泰国",
  metroCode: "BKK",
  keywords: ["bkk", "dmk", "素万那普", "廊曼"],
  airports: [
    { code: "BKK", name: "素万那普", nameEn: "Suvarnabhumi", pickerName: "曼谷素万那普机场" },
    { code: "DMK", name: "廊曼", nameEn: "Don Mueang", pickerName: "曼谷廊曼国际机场" },
  ],
});
c({
  id: "kualalumpur",
  name: "吉隆坡",
  nameEn: "Kuala Lumpur",
  country: "马来西亚",
  metroCode: "KUL",
  keywords: ["kul"],
  airports: [{ code: "KUL", name: "吉隆坡", nameEn: "KLIA", pickerName: "吉隆坡国际机场" }],
});
c({
  id: "sydney",
  name: "悉尼",
  nameEn: "Sydney",
  country: "澳大利亚",
  metroCode: "SYD",
  keywords: ["syd"],
  airports: [{ code: "SYD", name: "金斯福德", nameEn: "Kingsford Smith", pickerName: "悉尼金斯福德·史密斯机场" }],
});
c({
  id: "melbourne",
  name: "墨尔本",
  nameEn: "Melbourne",
  country: "澳大利亚",
  metroCode: "MEL",
  keywords: ["mel", "图拉马林"],
  airports: [{ code: "MEL", name: "图拉马林", nameEn: "Tullamarine", pickerName: "墨尔本机场" }],
});
c({
  id: "dubai",
  name: "迪拜",
  nameEn: "Dubai",
  country: "阿联酋",
  metroCode: "DXB",
  keywords: ["dxb", "dwc"],
  airports: [
    { code: "DXB", name: "迪拜", nameEn: "Dubai International", pickerName: "迪拜国际机场" },
    { code: "DWC", name: "阿勒马克图姆", nameEn: "Al Maktoum", pickerName: "迪拜阿勒马克图姆国际机场" },
  ],
});
c({
  id: "toronto",
  name: "多伦多",
  nameEn: "Toronto",
  country: "加拿大",
  metroCode: "YTO",
  keywords: ["yyz", "yhm"],
  airports: [
    { code: "YYZ", name: "皮尔逊", nameEn: "Pearson", pickerName: "多伦多皮尔逊国际机场" },
    { code: "YHM", name: "汉密尔顿", nameEn: "Hamilton", pickerName: "约翰·C·芒罗汉密尔顿国际机场" },
  ],
});
c({
  id: "vancouver",
  name: "温哥华",
  nameEn: "Vancouver",
  country: "加拿大",
  metroCode: "YVR",
  keywords: ["yvr"],
  airports: [{ code: "YVR", name: "温哥华", nameEn: "Vancouver", pickerName: "温哥华国际机场" }],
});
c({
  id: "auckland",
  name: "奥克兰",
  nameEn: "Auckland",
  country: "新西兰",
  metroCode: "AKL",
  keywords: ["akl"],
  airports: [{ code: "AKL", name: "奥克兰", nameEn: "Auckland", pickerName: "奥克兰机场" }],
});

/** 中国地级市所属省份（用于省份关键词搜索，不单独渲染为可选项） */
const PROVINCE_BY_ID = {
  beijing: "北京",
  shanghai: "上海",
  tianjin: "天津",
  chongqing: "重庆",
  guangzhou: "广东",
  shenzhen: "广东",
  zhuhai: "广东",
  huizhou: "广东",
  chengdu: "四川",
  mianyang: "四川",
  hangzhou: "浙江",
  ningbo: "浙江",
  wenzhou: "浙江",
  nanjing: "江苏",
  wuxi: "江苏",
  wuhan: "湖北",
  yichang: "湖北",
  xian: "陕西",
  yanan: "陕西",
  qingdao: "山东",
  jinan: "山东",
  yantai: "山东",
  weihai: "山东",
  xiamen: "福建",
  fuzhou: "福建",
  quanzhou: "福建",
  kunming: "云南",
  lijiang: "云南",
  xishuangbanna: "云南",
  haikou: "海南",
  sanya: "海南",
  qionghai: "海南",
  haerbin: "黑龙江",
  changchun: "吉林",
  shenyang: "辽宁",
  dalian: "辽宁",
  zhengzhou: "河南",
  taiyuan: "山西",
  shijiazhuang: "河北",
  handan: "河北",
  hefei: "安徽",
  huangshan: "安徽",
  nanchang: "江西",
  nanning: "广西",
  guilin: "广西",
  changsha: "湖南",
  zhangjiajie: "湖南",
  guiyang: "贵州",
  lanzhou: "甘肃",
  yinchuan: "宁夏",
  zhongwei: "宁夏",
  xining: "青海",
  huhehaote: "内蒙古",
  baotou: "内蒙古",
  wulumuqi: "新疆",
  lasa: "西藏",
};

/** 非中国国家名的英文/别名检索词（与 `country` 中文展示并存） */
const COUNTRY_SEARCH_ALIASES = {
  美国: "united states america usa us",
  英国: "united kingdom uk britain england great britain",
  法国: "france french",
  德国: "germany german deutschland",
  日本: "japan japanese",
  韩国: "south korea korea republic of korea",
  泰国: "thailand thai",
  新加坡: "singapore",
  马来西亚: "malaysia",
  澳大利亚: "australia australian",
  阿联酋: "united arab emirates uae",
  加拿大: "canada",
  新西兰: "new zealand nz",
  荷兰: "netherlands holland dutch",
  意大利: "italy italian",
  西班牙: "spain spanish",
};

for (const city of cities) {
  if (city.country === "中国") {
    const p = PROVINCE_BY_ID[city.id];
    if (p) city.province = p;
  } else {
    const extra = COUNTRY_SEARCH_ALIASES[city.country];
    if (extra) city.countryEn = extra;
  }
}

const catalog = {
  version: 2,
  description:
    "Curated airport catalog for frontend location search. Chinese cities include province for regional search; non-China cities may include countryEn aliases. Extend via this script or edit airportCatalog.json.",
  cities,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
const ap = cities.reduce((n, x) => n + x.airports.length, 0);
console.log(`Wrote ${outPath} (${cities.length} cities, ${ap} airports)`);
