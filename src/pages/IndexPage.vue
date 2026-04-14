<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4 text-weight-bold">World Clock</div>
      <q-btn round color="primary" icon="add" @click="showAddDialog = true" />
    </div>

    <div class="column q-gutter-y-md">
      <q-card v-for="loc in locations" :key="loc.zone" class="clock-card shadow-2">
        <q-card-section row class="items-center no-wrap">
          <div class="row items-center full-width">
            <div class="col">
              <div class="text-h6">{{ loc.city }}</div>
              <div class="text-subtitle2 text-grey-7">
                {{ formatOffset(loc.zone) }}
              </div>
            </div>

            <div class="col-auto text-right">
              <div class="text-h4 font-mono">
                {{ formatTime(loc.zone) }}
              </div>
              <div class="text-caption text-grey-6">
                {{ formatDate(loc.zone) }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Add City</div>
        </q-card-section>
        <q-card-section>
          <q-select
            filled
            v-model="newCity"
            use-input
            input-debounce="0"
            label="Search City or Region"
            :options="timezoneOptions"
            @filter="filterFn"
            hint="Type to search (e.g. 'New York')"
            style="padding-bottom: 20px"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results found </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Add" color="primary" @click="addLocation" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { DateTime } from 'luxon'

// --- State ---
const currentTime = ref(DateTime.now())
const showAddDialog = ref(false)
const newCity = ref(null)

// Curated list of 50 major global cities for the initial dropdown view
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

// The full list of 400+ timezones for the search feature
const allTimezones = Intl.supportedValuesOf('timeZone')
const timezoneOptions = ref(majorCities)

// Initial locations displayed on the dashboard
const locations = ref([
  { city: 'Local Time', zone: DateTime.now().zoneName },
  { city: 'New York', zone: 'America/New_York' },
  { city: 'London', zone: 'Europe/London' },
  { city: 'Tokyo', zone: 'Asia/Tokyo' },
])

// --- Logic ---

// Keeps the clocks ticking every second
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = DateTime.now()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

// Handles the autocomplete search in the QSelect
const filterFn = (val, update) => {
  update(() => {
    if (val === '') {
      timezoneOptions.value = majorCities
    } else {
      const needle = val.toLowerCase()
      timezoneOptions.value = allTimezones
        .filter((v) => v.toLowerCase().indexOf(needle) > -1)
        .slice(0, 20) // Performance boost: only render top 20 matches
    }
  })
}

// Adds a new city to the dashboard list
const addLocation = () => {
  if (newCity.value) {
    const cityName = newCity.value.split('/').pop().replace(/_/g, ' ')

    if (!locations.value.find((l) => l.zone === newCity.value)) {
      locations.value.push({
        city: cityName,
        zone: newCity.value,
      })
    }
    newCity.value = null
  }
}

// --- Formatting Helpers ---
const formatTime = (zone) => {
  return currentTime.value.setZone(zone).toFormat('HH:mm:ss')
}

const formatDate = (zone) => {
  return currentTime.value.setZone(zone).toFormat('cccc, LLL dd')
}

const formatOffset = (zone) => {
  const localized = currentTime.value.setZone(zone)
  return `${localized.offsetNameShort} (UTC ${localized.toFormat('ZZ')})`
}
</script>

<style scoped>
.clock-card {
  border-radius: 12px;
  transition: transform 0.2s;
}
.clock-card:active {
  transform: scale(0.98);
}
.font-mono {
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
}
</style>
