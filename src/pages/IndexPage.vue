<template>
  <transition
    appear
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
    mode="out-in"
  >
    <q-page class="bg-grey-2 q-pa-md">
      <div class="header-container q-mb-xl">
        <div class="row items-center justify-between no-wrap">
          <div class="col">
            <h1 class="text-h4 text-weight-bolder q-ma-none letter-spacing-tight">
              World <span class="text-primary">Clock</span>
            </h1>
            <div class="text-caption text-grey-6 text-uppercase q-ml-xs">Global Time Sync</div>
          </div>

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
            <q-btn
              fab-mini
              color="primary"
              icon="add"
              @click="showAddDialog = true"
              class="shadow-3 add-btn"
            />
          </div>
        </div>
      </div>

      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        mode="out-in"
      >
        <div v-if="!showAnalog" :key="'digital'" class="column q-gutter-y-md">
          <q-card v-for="loc in locations" :key="loc.zone" class="clock-card shadow-1">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 text-weight-bold">{{ loc.city }}</div>
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  color="grey-7"
                  icon="close"
                  class="absolute-top-right q-ma-xs"
                  @click="removeClock(loc)"
                />
                <div class="text-subtitle2 text-grey-7">{{ formatOffset(loc.zone) }}</div>
              </div>
              <div class="col-auto text-right">
                <div class="text-h4 font-mono text-primary">{{ formatTime(loc.zone) }}</div>
                <div class="text-caption text-grey-6">{{ formatDate(loc.zone) }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div v-else :key="'analog'" class="row q-col-gutter-lg justify-center">
          <div v-for="loc in locations" :key="loc.zone" class="col-6 col-sm-4 col-md-3">
            <q-card class="analog-grid-card text-center q-pa-md shadow-2 relative-position">
              <q-btn
                flat
                round
                dense
                size="xs"
                color="grey-6"
                icon="close"
                class="absolute-top-right q-ma-xs"
                @click="removeClock(loc)"
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
              <div class="text-caption text-grey-7">{{ formatTimeShort(loc.zone) }}</div>
            </q-card>
          </div>
        </div>
      </transition>

      <q-dialog v-model="showAddDialog">
        <q-card style="min-width: 320px; border-radius: 15px">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Add New City</div>
          </q-card-section>
          <q-card-section class="q-pt-lg">
            <q-select
              filled
              v-model="newCity"
              use-input
              input-debounce="0"
              label="Search Timezone"
              :options="timezoneOptions"
              @filter="filterFn"
              behavior="menu"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn flat label="Cancel" color="grey-7" v-close-popup />
            <q-btn
              unelevated
              label="Add Clock"
              color="primary"
              @click="addLocation"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showDeleteDialog">
        <q-card style="min-width: 320px; border-radius: 15px">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Delete City</div>
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Do you want to remove {{ selectedCity }} city?</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" v-close-popup />
            <q-btn flat label="Delete" color="red" @click="confirmRemoveClock" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { DateTime } from 'luxon'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const showDeleteDialog = ref(false)
const selectedZone = ref('')
const selectedCity = ref('')
const currentTime = ref(DateTime.now())
const showAddDialog = ref(false)
const showAnalog = ref(false)
const newCity = ref(null)

const majorCities = [
  'Africa/Abidjan',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Africa/Nairobi',
  'America/Anchorage',
  'America/Argentina/Buenos_Aires',
  'America/Bogota',
  'America/Caracas',
  'America/Chicago',
  'America/Denver',
  'America/Halifax',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/New_York',
  'America/Phoenix',
  'America/Santiago',
  'America/Sao_Paulo',
  'America/St_Johns',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Baghdad',
  'Asia/Bangkok',
  'Asia/Colombo',
  'Asia/Dhaka',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Istanbul',
  'Asia/Jakarta',
  'Asia/Jerusalem',
  'Asia/Kabul',
  'Asia/Karachi',
  'Asia/Kathmandu',
  'Asia/Kolkata',
  'Asia/Manila',
  'Asia/Riyadh',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Taipei',
  'Asia/Tashkent',
  'Asia/Tehran',
  'Asia/Tokyo',
  'Atlantic/Reykjavik',
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Darwin',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Pacific/Fiji',
  'Pacific/Guam',
  'Pacific/Honolulu',
  'Pacific/Pago_Pago',
  'Europe/Amsterdam',
  'Europe/Athens',
  'Europe/Belgrade',
  'Europe/Berlin',
  'Europe/Brussels',
  'Europe/Bucharest',
  'Europe/Budapest',
  'Europe/Copenhagen',
  'Europe/Dublin',
  'Europe/Helsinki',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Oslo',
  'Europe/Paris',
  'Europe/Prague',
  'Europe/Riga',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Tallinn',
  'Europe/Vienna',
  'Europe/Vilnius',
  'Europe/Warsaw',
  'Europe/Zurich',
  'Pacific/Auckland',
  'Pacific/Honolulu',
]

const allTimezones = Intl.supportedValuesOf('timeZone')
const timezoneOptions = ref(majorCities)

// --- Persistence ---
const saved = localStorage.getItem('world-clocks')
const locations = ref(
  saved
    ? JSON.parse(saved)
    : [
        { city: 'Local Time', zone: DateTime.now().zoneName },
        { city: 'New York', zone: 'America/New_York' },
        { city: 'London', zone: 'Europe/London' },
      ],
)

watch(
  locations,
  (val) => {
    localStorage.setItem('world-clocks', JSON.stringify(val))
  },
  { deep: true },
)

// --- Timer ---
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = DateTime.now()
  }, 1000)
})
onUnmounted(() => {
  clearInterval(timer)
})

// --- Logic ---
const addLocation = () => {
  if (newCity.value) {
    const cityName = newCity.value.split('/').pop().replace(/_/g, ' ')
    if (!locations.value.find((l) => l.zone === newCity.value)) {
      locations.value.push({ city: cityName, zone: newCity.value })
    }
    newCity.value = null
  }
}

const removeClock = (loc) => {
  if (DateTime.now().zoneName === loc.zone) {
    $q.notify({
      message: 'Local time can not be deleted',
      color: 'negative',
      position: 'bottom',
      timeout: 1000,
    })
    return
  }
  showDeleteDialog.value = true
  selectedZone.value = loc.zone
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
const filterFn = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    timezoneOptions.value =
      val === ''
        ? majorCities
        : allTimezones.filter((v) => v.toLowerCase().indexOf(needle) > -1).slice(0, 10)
  })
}

// --- Formatting & Styles ---
const formatTime = (z) => currentTime.value.setZone(z).toFormat('HH:mm:ss')
const formatTimeShort = (z) => currentTime.value.setZone(z).toFormat('HH:mm')
const formatDate = (z) => currentTime.value.setZone(z).toFormat('ccc, LLL dd')
const formatOffset = (z) => {
  const loc = currentTime.value.setZone(z)
  return `${loc.offsetNameShort} (UTC ${loc.toFormat('ZZ')})`
}
const getNumberStyle = (n) => {
  const angle = n * 30 * (Math.PI / 180)
  return {
    position: 'absolute',
    top: `${50 - Math.cos(angle) * 40}%`,
    left: `${50 + Math.sin(angle) * 40}%`,
    transform: 'translate(-50%, -50%)',
    fontSize: '10px',
    fontWeight: 'bold',
  }
}
const getHourStyle = (z) => ({
  transform: `translateX(-50%) rotate(${(currentTime.value.setZone(z).hour % 12) * 30 + currentTime.value.setZone(z).minute * 0.5}deg)`,
})
const getMinStyle = (z) => ({
  transform: `translateX(-50%) rotate(${currentTime.value.setZone(z).minute * 6}deg)`,
})
const getSecStyle = (z) => ({
  transform: `translateX(-50%) rotate(${currentTime.value.setZone(z).second * 6}deg)`,
})
</script>

<style scoped>
.letter-spacing-tight {
  letter-spacing: -1.5px;
}
.header-container {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.add-btn {
  transition: transform 0.2s ease;
}
.add-btn:active {
  transform: scale(0.9);
}
.clock-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.03);
}
.font-mono {
  font-family: 'monospace';
  letter-spacing: 1px;
}
.analog-grid-card {
  border-radius: 20px;
  background: white;
  min-height: 220px;
}
.analog-clock {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: white;
  border: 4px solid #2c3e50;
  position: relative;
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
  background: #95a5a6;
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
</style>
