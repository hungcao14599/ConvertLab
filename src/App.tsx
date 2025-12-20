import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Unit = {
  id: string
  label: string
  toBase: (value: number) => number
  fromBase: (value: number) => number
  hint?: string
}

type Category = {
  id: string
  name: string
  tagline: string
  accent: string
  note?: string
  units: Unit[]
}

const currencyRates: Record<string, number> = {
  usd: 1,
  vnd: 25300,
  eur: 0.92,
  gbp: 0.79,
  jpy: 145.6,
  sgd: 1.34,
}

const categories: Category[] = [
  {
    id: 'currency',
    name: 'Tiền tệ',
    tagline: 'Tỉ giá tham khảo · gốc USD',
    accent: '#6ba3ff',
    note: 'Tỉ giá chỉ mang tính tham khảo (01/2025). Nhập thủ công nếu bạn cần độ chính xác tuyệt đối.',
    units: [
      { id: 'usd', label: 'USD · Đô la Mỹ', toBase: (v) => v / currencyRates.usd, fromBase: (v) => v * currencyRates.usd },
      { id: 'vnd', label: 'VND · Đồng Việt Nam', toBase: (v) => v / currencyRates.vnd, fromBase: (v) => v * currencyRates.vnd },
      { id: 'eur', label: 'EUR · Euro', toBase: (v) => v / currencyRates.eur, fromBase: (v) => v * currencyRates.eur },
      { id: 'gbp', label: 'GBP · Bảng Anh', toBase: (v) => v / currencyRates.gbp, fromBase: (v) => v * currencyRates.gbp },
      { id: 'jpy', label: 'JPY · Yên Nhật', toBase: (v) => v / currencyRates.jpy, fromBase: (v) => v * currencyRates.jpy },
      { id: 'sgd', label: 'SGD · Đô la Singapore', toBase: (v) => v / currencyRates.sgd, fromBase: (v) => v * currencyRates.sgd },
    ],
  },
  {
    id: 'length',
    name: 'Chiều dài',
    tagline: 'Đo đạc - di chuyển',
    accent: '#5de1c0',
    units: [
      { id: 'm', label: 'Mét (m)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km', label: 'Kilômét (km)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'cm', label: 'Centimét (cm)', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: 'mm', label: 'Milimét (mm)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'ft', label: 'Foot (ft)', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'mi', label: 'Dặm (mile)', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    ],
  },
  {
    id: 'mass',
    name: 'Khối lượng',
    tagline: 'Nhà bếp - phòng lab',
    accent: '#f7c266',
    units: [
      { id: 'kg', label: 'Kilogram (kg)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'g', label: 'Gram (g)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'mg', label: 'Miligram (mg)', toBase: (v) => v / 1_000_000, fromBase: (v) => v * 1_000_000 },
      { id: 'lb', label: 'Pound (lb)', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      { id: 'oz', label: 'Ounce (oz)', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { id: 't', label: 'Tấn (t)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
  {
    id: 'temperature',
    name: 'Nhiệt độ',
    tagline: 'Celsius · Fahrenheit · Kelvin',
    accent: '#ff7ab8',
    units: [
      { id: 'c', label: 'Celsius (°C)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', label: 'Fahrenheit (°F)', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: 'k', label: 'Kelvin (K)', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    id: 'volume',
    name: 'Thể tích',
    tagline: 'Pha chế - đo lường',
    accent: '#8c85ff',
    units: [
      { id: 'l', label: 'Lít (L)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ml', label: 'Mililít (mL)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'm3', label: 'Mét khối (m³)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'gal', label: 'Gallon (US)', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { id: 'cup', label: 'Cup (US)', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
    ],
  },
  {
    id: 'data',
    name: 'Dữ liệu',
    tagline: 'Tốc độ mạng · lưu trữ',
    accent: '#62d6ff',
    units: [
      { id: 'b', label: 'Bit (b)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kb', label: 'Kilobit (Kb)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'mb', label: 'Megabit (Mb)', toBase: (v) => v * 1_000_000, fromBase: (v) => v / 1_000_000 },
      { id: 'kib', label: 'Kibibit (Kib)', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'byte', label: 'Byte (B)', toBase: (v) => v * 8, fromBase: (v) => v / 8 },
      { id: 'mbyte', label: 'Megabyte (MB)', toBase: (v) => v * 8_000_000, fromBase: (v) => v / 8_000_000 },
    ],
  },
  {
    id: 'speed',
    name: 'Vận tốc',
    tagline: 'Di chuyển & giao thông',
    accent: '#ffb347',
    units: [
      { id: 'ms', label: 'Mét/giây (m/s)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kmh', label: 'Kilômét/giờ (km/h)', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: 'mph', label: 'Dặm/giờ (mph)', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: 'knot', label: 'Hải lý/giờ (kn)', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    ],
  },
  {
    id: 'area',
    name: 'Diện tích',
    tagline: 'Bản đồ · xây dựng',
    accent: '#55c595',
    units: [
      { id: 'm2', label: 'Mét vuông (m²)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'cm2', label: 'Centimét vuông (cm²)', toBase: (v) => v / 10_000, fromBase: (v) => v * 10_000 },
      { id: 'km2', label: 'Kilômét vuông (km²)', toBase: (v) => v * 1_000_000, fromBase: (v) => v / 1_000_000 },
      { id: 'ha', label: 'Hecta (ha)', toBase: (v) => v * 10_000, fromBase: (v) => v / 10_000 },
      { id: 'ft2', label: 'Foot vuông (ft²)', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: 'in2', label: 'Inch vuông (in²)', toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
    ],
  },
  {
    id: 'time',
    name: 'Thời gian',
    tagline: 'Lập lịch · tính tiến độ',
    accent: '#6ba3ff',
    units: [
      { id: 's', label: 'Giây (s)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'min', label: 'Phút (min)', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: 'h', label: 'Giờ (h)', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: 'day', label: 'Ngày', toBase: (v) => v * 86_400, fromBase: (v) => v / 86_400 },
      { id: 'week', label: 'Tuần', toBase: (v) => v * 604_800, fromBase: (v) => v / 604_800 },
    ],
  },
  {
    id: 'energy',
    name: 'Năng lượng',
    tagline: 'Điện · calories',
    accent: '#e76f51',
    note: 'Calories nhỏ (cal) ~ năng lượng, 1 kcal = 1000 cal.',
    units: [
      { id: 'j', label: 'Joule (J)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kj', label: 'Kilojoule (kJ)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'wh', label: 'Watt-giờ (Wh)', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: 'kwh', label: 'Kilowatt-giờ (kWh)', toBase: (v) => v * 3_600_000, fromBase: (v) => v / 3_600_000 },
      { id: 'cal', label: 'Calorie nhỏ (cal)', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      { id: 'kcal', label: 'KiloCalorie (kcal)', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
    ],
  },
]

const defaultCategory = categories[0]
const defaultFromUnit = defaultCategory.units[0].id
const defaultToUnit = defaultCategory.units[1]?.id ?? defaultCategory.units[0].id

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return ''
  const abs = Math.abs(value)
  const precision = abs < 1 ? 6 : abs < 100 ? 4 : 2
  const fixed = value.toFixed(precision)
  return parseFloat(fixed).toString()
}

const convertValue = (value: number, fromId: string, toId: string, category: Category) => {
  const from = category.units.find((unit) => unit.id === fromId)
  const to = category.units.find((unit) => unit.id === toId)
  if (!from || !to) return NaN
  const base = from.toBase(value)
  return to.fromBase(base)
}

const quickValues = ['1', '10', '25', '100', '1000']

function App() {
  const [categoryId, setCategoryId] = useState(defaultCategory.id)
  const [fromUnit, setFromUnit] = useState(defaultFromUnit)
  const [toUnit, setToUnit] = useState(defaultToUnit)
  const [fromValue, setFromValue] = useState('1')
  const [toValue, setToValue] = useState(
    formatNumber(convertValue(1, defaultFromUnit, defaultToUnit, defaultCategory))
  )

  const currentCategory = useMemo(
    () => categories.find((category) => category.id === categoryId) ?? defaultCategory,
    [categoryId]
  )

  useEffect(() => {
    const nextFrom = currentCategory.units[0]?.id ?? ''
    const nextTo = currentCategory.units[1]?.id ?? currentCategory.units[0]?.id ?? ''
    setFromUnit(nextFrom)
    setToUnit(nextTo)
    const numeric = parseFloat(fromValue)
    if (Number.isNaN(numeric)) {
      setToValue('')
      return
    }
    const result = convertValue(numeric, nextFrom, nextTo, currentCategory)
    setToValue(formatNumber(result))
  }, [currentCategory])

  useEffect(() => {
    const numeric = parseFloat(fromValue)
    if (Number.isNaN(numeric)) {
      setToValue('')
      return
    }
    const result = convertValue(numeric, fromUnit, toUnit, currentCategory)
    setToValue(formatNumber(result))
  }, [fromUnit, toUnit, currentCategory, fromValue])

  const handleFromValueChange = (value: string) => {
    setFromValue(value)
    const numeric = parseFloat(value)
    if (Number.isNaN(numeric)) {
      setToValue('')
      return
    }
    const result = convertValue(numeric, fromUnit, toUnit, currentCategory)
    setToValue(formatNumber(result))
  }

  const handleToValueChange = (value: string) => {
    setToValue(value)
    const numeric = parseFloat(value)
    if (Number.isNaN(numeric)) {
      setFromValue('')
      return
    }
    const result = convertValue(numeric, toUnit, fromUnit, currentCategory)
    setFromValue(formatNumber(result))
  }

  const swapUnits = () => {
    const nextFrom = toUnit
    const nextTo = fromUnit
    setFromUnit(nextFrom)
    setToUnit(nextTo)
    const numeric = parseFloat(fromValue)
    if (Number.isNaN(numeric)) {
      setToValue('')
      return
    }
    const result = convertValue(numeric, nextFrom, nextTo, currentCategory)
    setToValue(formatNumber(result))
  }

  return (
    <div className="page">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="app-shell">
        <header className="hero">
          <p className="eyebrow">ConvertLab · React + Vite + TypeScript</p>
          <h1>Chuyển đổi đơn vị & tiền tệ siêu nhanh</h1>
          <p className="lede">
            Một giao diện gọn gàng, chạy được cả offline cho các loại đơn vị phổ biến. Tỉ giá
            tiền tệ là tham khảo gần đây, đủ để ước lượng nhanh.
          </p>
          <div className="pill-row">
            <span className="pill">Hoạt động tức thì</span>
            <span className="pill">Chọn phạm vi & đổi chiều dễ dàng</span>
            <span className="pill">Sẵn sàng cho mobile IOS và Android</span>
          </div>
        </header>

        <section className="card">
          <div className="card-head">
            <div>
              <p className="label">Danh mục</p>
              <h2>Chọn phạm vi cần đổi</h2>
            </div>
            <span className="tagline" style={{ color: currentCategory.accent }}>
              {currentCategory.tagline}
            </span>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category ${category.id === categoryId ? 'active' : ''}`}
                style={
                  category.id === categoryId
                    ? { background: category.accent, borderColor: category.accent }
                    : { borderColor: category.accent }
                }
                onClick={() => setCategoryId(category.id)}
              >
                <div className="category-dot" style={{ background: category.accent }} />
                <div className="category-label">
                  <span>{category.name}</span>
                  <small>{category.tagline}</small>
                </div>
              </button>
            ))}
          </div>

          <div className="converter">
            <div className="field">
              <label>Nhập giá trị</label>
              <div className="input-row">
                <input
                  type="number"
                  value={fromValue}
                  onChange={(event) => handleFromValueChange(event.target.value)}
                  placeholder="0"
                  inputMode="decimal"
                />
                <select value={fromUnit} onChange={(event) => setFromUnit(event.target.value)}>
                  {currentCategory.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="quick-row">
                <span className="label">Giá trị nhanh</span>
                <div className="quick-buttons">
                  {quickValues.map((value) => (
                    <button key={value} onClick={() => handleFromValueChange(value)}>
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="swap-area">
              <button className="swap" onClick={swapUnits} aria-label="Đổi chiều đơn vị">
                ↕️
              </button>
              <p>Đổi chiều</p>
            </div>

            <div className="field">
              <label>Kết quả</label>
              <div className="input-row">
                <input
                  type="number"
                  value={toValue}
                  onChange={(event) => handleToValueChange(event.target.value)}
                  placeholder="0"
                  inputMode="decimal"
                />
                <select value={toUnit} onChange={(event) => setToUnit(event.target.value)}>
                  {currentCategory.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="hint">Chỉnh tay giá trị kết quả để đổi ngược.</p>
            </div>
          </div>

          <div className="meta">
            <div className="meta-card">
              <p className="label">Ghi chú</p>
              <p>{currentCategory.note ?? 'Đổi chéo mọi đơn vị trong danh mục đã chọn.'}</p>
            </div>
            <div className="meta-card">
              <p className="label">Mẹo nhanh</p>
              <ul>
                <li>Nhấn vào giá trị nhanh để đổ số tức thì.</li>
                <li>Nhập vào ô kết quả để đổi chiều trong một chạm.</li>
                <li>Chọn danh mục khác mà không mất giá trị đang nhập.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
