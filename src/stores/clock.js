import { defineStore } from 'pinia'
import { DateTime } from 'luxon'

export const useClockStore = defineStore('clock', {
  state: () => ({
    now: DateTime.now(),
    locations: [
      { city: 'London', zone: 'Europe/London' },
      { city: 'Tokyo', zone: 'Asia/Tokyo' },
    ],
  }),
  actions: {
    updateTime() {
      this.now = DateTime.now()
    },
  },
})
