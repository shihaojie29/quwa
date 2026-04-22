<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    subtitle?: string;
    origin?: string;
    destination?: string;
    meta?: string;
  }>(),
  {
    eyebrow: "Travel journal",
    subtitle: "",
    origin: "",
    destination: "",
    meta: "",
  },
);
</script>

<template>
  <view class="hero-ticket">
    <view class="hero-ticket__main">
      <view class="hero-ticket__stamp">
        <text class="hero-ticket__stamp-icon">✈</text>
        <text class="hero-ticket__stamp-text">JAPAN</text>
      </view>
      <text class="hero-ticket__serial">QUWA TRAVEL JOURNAL</text>
      <text class="hero-ticket__eyebrow">{{ eyebrow }}</text>
      <text class="hero-ticket__title">{{ title }}</text>
      <text v-if="subtitle" class="hero-ticket__subtitle">{{ subtitle }}</text>
      <view v-if="origin || destination || meta" class="hero-ticket__route">
        <text v-if="origin" class="hero-ticket__place">{{ origin }}</text>
        <text v-if="origin && destination" class="hero-ticket__dash">to</text>
        <text v-if="destination" class="hero-ticket__place">{{ destination }}</text>
        <text v-if="meta && (origin || destination)" class="hero-ticket__separator">/</text>
        <text v-if="meta" class="hero-ticket__meta">{{ meta }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.hero-ticket {
  position: relative;
  min-height: 214px;
  overflow: hidden;
  color: #fffdf8;
  background: var(--journal-hero-gradient, linear-gradient(155deg, #b85438 0%, #c96040 45%, #e09850 100%));
  border-radius: 0 0 28px 28px;
  box-shadow: 0 12px 30px rgba(201, 96, 64, 0.26);
  transform: translateZ(0);
}

.hero-ticket::before,
.hero-ticket::after {
  position: absolute;
  bottom: -16px;
  width: 32px;
  height: 32px;
  content: "";
  background: var(--journal-bg, #f3e9d8);
  border-radius: 50%;
}

.hero-ticket::before {
  left: -16px;
}

.hero-ticket::after {
  right: -16px;
}

.hero-ticket__main {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 214px;
  flex-direction: column;
  justify-content: flex-end;
  padding: 26px 22px 24px;
  overflow: hidden;
}

.hero-ticket__main::before {
  position: absolute;
  top: -18px;
  right: 18px;
  width: 124px;
  height: 124px;
  content: "";
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
}

.hero-ticket__main::after {
  position: absolute;
  top: 72px;
  right: -24px;
  width: 122px;
  height: 1px;
  content: "";
  border-top: 1px dashed rgba(255, 255, 255, 0.28);
  transform: rotate(-16deg);
}

.hero-ticket__stamp {
  position: absolute;
  top: 18px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(255, 255, 255, 0.36);
  border-radius: 50%;
}

.hero-ticket__stamp-icon {
  font-size: 16px;
  line-height: 1;
}

.hero-ticket__stamp-text {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 1px;
}

.hero-ticket__serial {
  position: absolute;
  top: 24px;
  left: 22px;
  color: rgba(255, 255, 255, 0.52);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
}

.hero-ticket__eyebrow {
  color: rgba(255, 255, 255, 0.68);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.hero-ticket__title {
  display: block;
  margin-top: 6px;
  color: #ffffff;
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 1px;
  line-height: 0.92;
}

.hero-ticket__subtitle {
  display: block;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  line-height: 1.4;
}

.hero-ticket__route {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  align-items: center;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed rgba(255, 255, 255, 0.34);
}

.hero-ticket__place {
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}

.hero-ticket__dash,
.hero-ticket__separator,
.hero-ticket__meta {
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
}
</style>
