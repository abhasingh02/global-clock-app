<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4 text-weight-bold">World Clock</div>

      <div class="row q-gutter-x-sm items-center">
        <q-btn-toggle
          v-model="showAnalog"
          push
          glossy
          toggle-color="primary"
          :options="[
            { label: 'Analog', value: true },
            { label: 'Digital', value: false },
          ]"
        />

        <q-btn round color="primary" icon="add" @click="showAddDialog = true" />
      </div>
    </div>

    <div class="q-mt-md">
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        mode="out-in"
      >
        <div v-if="!showAnalog" :key="'digital'" class="column q-gutter-y-md">
          <q-card v-for="loc in locations" :key="loc.zone" class="clock-card shadow-2">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">{{ loc.city }}</div>
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  color="grey-7"
                  icon="close"
                  class="absolute-top-right q-ma-xs"
                  @click="removeClock(loc.zone)"
                />
                <div class="text-subtitle2 text-grey-7">{{ formatOffset(loc.zone) }}</div>
              </div>

              <div class="col-auto text-right">
                <div class="text-h4 font-mono">{{ formatTime(loc.zone) }}</div>
                <div class="text-caption text-grey-6">{{ formatDate(loc.zone) }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div v-else :key="'analog'" class="row q-col-gutter-lg justify-center">
          <div v-for="loc in locations" :key="loc.zone" class="col-6 col-sm-4 col-md-3">
            <q-card class="analog-grid-card text-center q-pa-md shadow-3 relative-position">
              <q-btn
                flat
                round
                dense
                size="xs"
                color="grey-7"
                icon="close"
                class="absolute-top-right q-ma-xs"
                @click="removeClock(loc.zone)"
              />

              <div class="analog-clock q-mx-auto q-mb-md">
                <div class="clock-face">
                  <div v-for="n in 12" :key="n" class="number" :style="getNumberStyle(n)">
                    {{ n }}
                  </div>
                  <div class="hand hour-hand" :style="getHourStyle(loc.zone)"></div>
                  <div class="hand min-hand" :style="getMinStyle(loc.zone)"></div>
                  <div class="hand sec-hand" :style="getSecStyle(loc.zone)"></div>
                  <div class="center-dot"></div>
                </div>
              </div>

              <div class="text-subtitle1 text-weight-bold">{{ loc.city }}</div>
              <div class="text-caption text-grey-6">
                {{ formatTime(loc.zone) }}
              </div>
            </q-card>
          </div>
        </div>
      </transition>
    </div>

    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 300px">
        <q-card-section><div class="text-h6">Add City</div></q-card-section>
        <q-card-section>
          <q-select
            filled
            v-model="newCity"
            use-input
            input-debounce="0"
            label="Search City or Region"
            :options="timezoneOptions"
            @filter="filterFn"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Add" color="primary" @click="addLocation" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 300px">
        <q-card-section
          ><div class="text-h6">Do you want to remove {{ selectedCity }} city?</div></q-card-section
        >

        <q-card-actions align="right">
          <q-btn flat label="No" color="primary" v-close-popup />
          <q-btn flat label="Yes" color="red" @click="confirmRemoveClock" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { DateTime } from 'luxon'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// --- State & Initialization ---
const showDeleteDialog = ref(false)
const selectedZone = ref('')
const selectedCity = ref('')
const currentTime = ref(DateTime.now())
const showAddDialog = ref(false)
const showAnalog = ref(false)
const newCity = ref(null)
const majorCities = [
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Africa/Nairobi',
  'America/Argentina/Buenos_Aires',
  'America/Bogota',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/New_York',
  'America/Phoenix',
  'America/Santiago',
  'America/Sao_Paulo',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Bangkok',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Istanbul',
  'Asia/Jakarta',
  'Asia/Jerusalem',
  'Asia/Kolkata',
  'Asia/Manila',
  'Asia/Riyadh',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Taipei',
  'Asia/Tokyo',
  'Atlantic/Reykjavik',
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/Brussels',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Vienna',
  'Europe/Warsaw',
  'Europe/Zurich',
  'Pacific/Auckland',
  'Pacific/Honolulu',
]

const allTimezones = Intl.supportedValuesOf('timeZone')
const timezoneOptions = ref(majorCities)

// Persistence: Load from LocalStorage or use defaults
const saved = localStorage.getItem('world-clocks')
const locations = ref(
  saved
    ? JSON.parse(saved)
    : [
        { city: 'Local Time', zone: DateTime.now().zoneName },
        { city: 'New York', zone: 'America/New_York' },
        { city: 'London', zone: 'Europe/London' },
        { city: 'Tokyo', zone: 'Asia/Tokyo' },
      ],
)

// Persistence: Watch and Save
watch(
  locations,
  (newVal) => {
    localStorage.setItem('world-clocks', JSON.stringify(newVal))
  },
  { deep: true },
)

// --- Timer Logic ---
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = DateTime.now()
  }, 1000)
})
onUnmounted(() => {
  clearInterval(timer)
})

// --- Analog Style Helpers ---
const getNumberStyle = (n) => {
  const angle = n * 30 * (Math.PI / 180)
  const radius = 40
  return {
    position: 'absolute',
    top: `${50 - Math.cos(angle) * radius}%`,
    left: `${50 + Math.sin(angle) * radius}%`,
    transform: 'translate(-50%, -50%)',
    fontSize: '10px',
    fontWeight: 'bold',
  }
}
const getHourStyle = (zone) => {
  const time = currentTime.value.setZone(zone)
  const deg = (time.hour % 12) * 30 + time.minute * 0.5
  return { transform: `translateX(-50%) rotate(${deg}deg)` }
}
const getMinStyle = (zone) => {
  const time = currentTime.value.setZone(zone)
  const deg = time.minute * 6
  return { transform: `translateX(-50%) rotate(${deg}deg)` }
}
const getSecStyle = (zone) => {
  const time = currentTime.value.setZone(zone)
  const deg = time.second * 6
  return { transform: `translateX(-50%) rotate(${deg}deg)` }
}

// --- Interaction Logic ---
const filterFn = (val, update) => {
  update(() => {
    if (val === '') {
      timezoneOptions.value = majorCities
    } else {
      const needle = val.toLowerCase()
      timezoneOptions.value = allTimezones
        .filter((v) => v.toLowerCase().indexOf(needle) > -1)
        .slice(0, 20)
    }
  })
}

const addLocation = () => {
  console.log('newCity', newCity)

  if (newCity.value) {
    const cityName = newCity.value.split('/').pop().replace(/_/g, ' ')
    if (!locations.value.find((l) => l.zone === newCity.value)) {
      locations.value.push({ city: cityName, zone: newCity.value })
    } else {
      $q.notify({ message: 'City already in list', color: 'warning' })
    }
    newCity.value = null
  }
}

const removeClock = (zone) => {
  if (DateTime.now().zoneName === zone) {
    $q.notify({
      message: 'Local time can not be deleted',
      color: 'negative',
      position: 'bottom',
      timeout: 1000,
    })
    return
  }
  showDeleteDialog.value = true
  selectedZone.value = zone
  selectedCity.value = selectedZone.value.split('/').pop().replace(/_/g, ' ')
}
const confirmRemoveClock = () => {
  locations.value = locations.value.filter((loc) => loc.zone !== selectedZone.value)
  $q.notify({
    message: `Clock for ${selectedCity.value} removed`,
    color: 'negative',
    icon: 'delete',
    position: 'bottom',
    timeout: 1000,
  })
}

// --- Formatting Helpers ---
const formatTime = (zone) => currentTime.value.setZone(zone).toFormat('HH:mm:ss')
const formatDate = (zone) => currentTime.value.setZone(zone).toFormat('ccc, LLL dd')
const formatOffset = (zone) => {
  const localized = currentTime.value.setZone(zone)
  return `${localized.offsetNameShort} (UTC ${localized.toFormat('ZZ')})`
}
</script>

<style scoped>
.clock-card {
  border-radius: 12px;
}
.font-mono {
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
}
.analog-grid-card {
  border-radius: 18px;
  background: #fdfdfd;
  min-height: 220px;
}
.analog-clock {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 60%, #ecf0f1);
  border: 4px solid #2c3e50;
  position: relative;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}
.clock-face {
  position: relative;
  width: 100%;
  height: 100%;
}
.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom;
  border-radius: 4px;
}
.hour-hand {
  width: 4px;
  height: 28px;
  background: #2c3e50;
  z-index: 3;
}
.min-hand {
  width: 3px;
  height: 38px;
  background: #7f8c8d;
  z-index: 2;
}
.sec-hand {
  width: 2px;
  height: 45px;
  background: #e74c3c;
  z-index: 1;
}
.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: #2c3e50;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
.clock-card {
  border-radius: 12px;
}
.font-mono {
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
}

/* Analog Clock Styling */
.analog-grid-card {
  border-radius: 16px;
  min-height: 200px;
}
.analog-clock {
  width: 100px;
  height: 100px;
  border: 3px solid #2c3e50;
  border-radius: 50%;
  position: relative;
  background: white;
}
.clock-face {
  position: relative;
  width: 100%;
  height: 100%;
}
.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom;
  background: #2c3e50;
  border-radius: 4px;
}
.hour-hand {
  width: 4px;
  height: 25px;
  z-index: 3;
}
.min-hand {
  width: 3px;
  height: 35px;
  z-index: 2;
  background: #7f8c8d;
}
.sec-hand {
  width: 1px;
  height: 40px;
  z-index: 1;
  background: #e74c3c;
}
.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: #2c3e50;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
.marker {
  position: absolute;
  background: #bdc3c7;
}
.m-12,
.m-6 {
  width: 2px;
  height: 6px;
  left: 49%;
}
.m-12 {
  top: 2px;
}
.m-6 {
  bottom: 2px;
}
.m-3,
.m-9 {
  width: 6px;
  height: 2px;
  top: 49%;
}
.m-3 {
  right: 2px;
}
.m-9 {
  left: 2px;
}

.analog-grid-card {
  border-radius: 18px;
  background: #fdfdfd;
}

.analog-clock {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 60%, #ecf0f1);
  border: 4px solid #2c3e50;
  position: relative;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.clock-face {
  position: relative;
  width: 100%;
  height: 100%;
}

.number {
  color: #2c3e50;
}

.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom;
  border-radius: 4px;
}

/* Hour */
.hour-hand {
  width: 4px;
  height: 28px;
  background: #2c3e50;
  z-index: 3;
}

/* Minute */
.min-hand {
  width: 3px;
  height: 38px;
  background: #7f8c8d;
  z-index: 2;
}

/* Second */
.sec-hand {
  width: 2px;
  height: 45px;
  background: #e74c3c;
  z-index: 1;
}

/* Center */
.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: #2c3e50;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
</style>
