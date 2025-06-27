import type { Dynasty, Era, PeriodRange } from './historical-date'

// 主要朝代数据
export const DYNASTIES: Dynasty[] = [
  {
    name: '唐朝',
    startYear: 618,
    endYear: 907,
    periods: [
      { name: '初唐', description: '唐朝建立初期', startYear: 618, endYear: 679 },
      { name: '盛唐', description: '开元盛世时期', startYear: 680, endYear: 755 },
      { name: '中唐', description: '安史之乱后', startYear: 756, endYear: 840 },
      { name: '晚唐', description: '唐朝衰落期', startYear: 841, endYear: 907 }
    ]
  },
  {
    name: '宋朝',
    startYear: 960,
    endYear: 1279,
    periods: [
      { name: '北宋', description: '北宋时期', startYear: 960, endYear: 1127 },
      { name: '南宋', description: '南宋时期', startYear: 1127, endYear: 1279 }
    ]
  },
  {
    name: '明朝',
    startYear: 1368,
    endYear: 1644,
    periods: [
      { name: '明初', description: '明朝建立初期', startYear: 1368, endYear: 1424 },
      { name: '明中期', description: '明朝中期', startYear: 1425, endYear: 1566 },
      { name: '明末', description: '明朝衰落期', startYear: 1567, endYear: 1644 }
    ]
  },
  {
    name: '清朝',
    startYear: 1644,
    endYear: 1912,
    periods: [
      { name: '清初', description: '清朝建立初期', startYear: 1644, endYear: 1722 },
      { name: '清中期', description: '康乾盛世', startYear: 1723, endYear: 1840 },
      { name: '清末', description: '鸦片战争后', startYear: 1841, endYear: 1912 }
    ]
  }
]

// 常用年号数据（唐朝为主）
export const ERAS: Era[] = [
  { name: '武德', emperor: '李渊', dynasty: '唐朝', startYear: 618, endYear: 626 },
  { name: '贞观', emperor: '李世民', dynasty: '唐朝', startYear: 627, endYear: 649 },
  { name: '永徽', emperor: '李治', dynasty: '唐朝', startYear: 650, endYear: 655 },
  { name: '显庆', emperor: '李治', dynasty: '唐朝', startYear: 656, endYear: 661 },
  { name: '龙朔', emperor: '李治', dynasty: '唐朝', startYear: 661, endYear: 663 },
  { name: '麟德', emperor: '李治', dynasty: '唐朝', startYear: 664, endYear: 665 },
  { name: '乾封', emperor: '李治', dynasty: '唐朝', startYear: 666, endYear: 668 },
  { name: '总章', emperor: '李治', dynasty: '唐朝', startYear: 668, endYear: 670 },
  { name: '咸亨', emperor: '李治', dynasty: '唐朝', startYear: 670, endYear: 674 },
  { name: '上元', emperor: '李治', dynasty: '唐朝', startYear: 674, endYear: 676 },
  { name: '仪凤', emperor: '李治', dynasty: '唐朝', startYear: 676, endYear: 679 },
  { name: '调露', emperor: '李治', dynasty: '唐朝', startYear: 679, endYear: 680 },
  { name: '永隆', emperor: '李治', dynasty: '唐朝', startYear: 680, endYear: 681 },
  { name: '开耀', emperor: '李治', dynasty: '唐朝', startYear: 681, endYear: 682 },
  { name: '永淳', emperor: '李治', dynasty: '唐朝', startYear: 682, endYear: 683 },
  { name: '弘道', emperor: '李治', dynasty: '唐朝', startYear: 683, endYear: 684 },
  { name: '嗣圣', emperor: '李显', dynasty: '唐朝', startYear: 684, endYear: 684 },
  { name: '文明', emperor: '武则天', dynasty: '唐朝', startYear: 684, endYear: 684 },
  { name: '光宅', emperor: '武则天', dynasty: '唐朝', startYear: 684, endYear: 684 },
  { name: '垂拱', emperor: '武则天', dynasty: '唐朝', startYear: 685, endYear: 688 },
  { name: '永昌', emperor: '武则天', dynasty: '唐朝', startYear: 689, endYear: 689 },
  { name: '载初', emperor: '武则天', dynasty: '唐朝', startYear: 689, endYear: 690 },
  { name: '天授', emperor: '武则天', dynasty: '武周', startYear: 690, endYear: 692 },
  { name: '如意', emperor: '武则天', dynasty: '武周', startYear: 692, endYear: 692 },
  { name: '长寿', emperor: '武则天', dynasty: '武周', startYear: 692, endYear: 694 },
  { name: '延载', emperor: '武则天', dynasty: '武周', startYear: 694, endYear: 694 },
  { name: '证圣', emperor: '武则天', dynasty: '武周', startYear: 695, endYear: 695 },
  { name: '天册万岁', emperor: '武则天', dynasty: '武周', startYear: 695, endYear: 696 },
  { name: '万岁登封', emperor: '武则天', dynasty: '武周', startYear: 696, endYear: 696 },
  { name: '万岁通天', emperor: '武则天', dynasty: '武周', startYear: 696, endYear: 697 },
  { name: '神功', emperor: '武则天', dynasty: '武周', startYear: 697, endYear: 697 },
  { name: '圣历', emperor: '武则天', dynasty: '武周', startYear: 698, endYear: 700 },
  { name: '久视', emperor: '武则天', dynasty: '武周', startYear: 700, endYear: 701 },
  { name: '大足', emperor: '武则天', dynasty: '武周', startYear: 701, endYear: 701 },
  { name: '长安', emperor: '武则天', dynasty: '武周', startYear: 701, endYear: 704 },
  { name: '神龙', emperor: '李显', dynasty: '唐朝', startYear: 705, endYear: 707 },
  { name: '景龙', emperor: '李显', dynasty: '唐朝', startYear: 707, endYear: 710 },
  { name: '唐隆', emperor: '李重茂', dynasty: '唐朝', startYear: 710, endYear: 710 },
  { name: '景云', emperor: '李旦', dynasty: '唐朝', startYear: 710, endYear: 712 },
  { name: '太极', emperor: '李旦', dynasty: '唐朝', startYear: 712, endYear: 712 },
  { name: '延和', emperor: '李旦', dynasty: '唐朝', startYear: 712, endYear: 712 },
  { name: '先天', emperor: '李隆基', dynasty: '唐朝', startYear: 712, endYear: 713 },
  { name: '开元', emperor: '李隆基', dynasty: '唐朝', startYear: 713, endYear: 741 },
  { name: '天宝', emperor: '李隆基', dynasty: '唐朝', startYear: 742, endYear: 756 },
  { name: '至德', emperor: '李亨', dynasty: '唐朝', startYear: 756, endYear: 758 },
  { name: '乾元', emperor: '李亨', dynasty: '唐朝', startYear: 758, endYear: 760 },
  { name: '上元', emperor: '李亨', dynasty: '唐朝', startYear: 760, endYear: 761 },
  { name: '宝应', emperor: '李豫', dynasty: '唐朝', startYear: 762, endYear: 763 },
  { name: '广德', emperor: '李豫', dynasty: '唐朝', startYear: 763, endYear: 764 },
  { name: '永泰', emperor: '李豫', dynasty: '唐朝', startYear: 765, endYear: 766 }
]

// 模糊历史区间定义
export const PERIOD_RANGES: PeriodRange[] = [
  {
    name: '神龙政变前后',
    description: '武则天退位，中宗复位时期',
    startDate: '0704-01-01',
    endDate: '0706-12-31',
    dynasty: '唐朝'
  },
  {
    name: '开元盛世',
    description: '唐玄宗统治的繁荣时期',
    startDate: '0713-01-01',
    endDate: '0741-12-31',
    dynasty: '唐朝'
  },
  {
    name: '天宝年间',
    description: '安史之乱前的最后繁荣',
    startDate: '0742-01-01',
    endDate: '0755-12-15',
    dynasty: '唐朝'
  },
  {
    name: '安史之乱',
    description: '唐朝由盛转衰的重要转折',
    startDate: '0755-12-16',
    endDate: '0763-02-17',
    dynasty: '唐朝'
  },
  {
    name: '安史之乱前',
    description: '安禄山起兵之前',
    startDate: '0750-01-01',
    endDate: '0755-12-15',
    dynasty: '唐朝'
  },
  {
    name: '安史之乱后',
    description: '叛乱平定后的重建时期',
    startDate: '0763-02-18',
    endDate: '0770-12-31',
    dynasty: '唐朝'
  },
  {
    name: '中唐前期',
    description: '代宗到德宗初期',
    startDate: '0762-01-01',
    endDate: '0790-12-31',
    dynasty: '唐朝'
  },
  {
    name: '唐朝中期',
    description: '安史之乱后的中兴时期',
    startDate: '0763-01-01',
    endDate: '0840-12-31',
    dynasty: '唐朝'
  }
]

// 农历月份名称
export const LUNAR_MONTHS = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月'
]

// 农历日期名称
export const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
] 