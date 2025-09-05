import { defineStore } from "pinia";
import { store } from "@/store";

export const useUserStore = defineStore('bird-user', {
  state: () => ({ /* 初始状态 */ }),
  getters: {
  },
  actions: {
  }
})

export function useUserStoreHook() {
  return useUserStore(store);
}