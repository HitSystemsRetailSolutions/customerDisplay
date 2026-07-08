<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <div v-if="logoTpv" class="logo-icon welcome-logo" :class="{ 'no-bg': logoTpv }">
        <img :src="`data:image/${logoTpv.extension};base64,${logoTpv.archivo}`" class="hit-logo-img" />
      </div>
      <h1 class="welcome-title">{{ $t('visor.welcomeTo','Bienvenidos a') }}<br/>{{ displayName }}</h1>
      <p class="welcome-subtitle">{{ $t('visor.happyToServe','Estamos encantados de atenderle') }}</p>
    </div>
    <!-- Footer clock -->
    <div class="payment-footer">
      <div class="footer-clock">{{ currentTime }}</div>
      <div class="footer-branding">
        <span>{{ $t('visor.developedBy','Desarrollado por') }}</span>
        <img src="/img/logo-hitsystems.png" alt="Hit Systems" class="hit-logo" onerror="this.style.display='none'" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomeScreen',
  props: {
    logoTpv: {
      type: Object,
      default: null
    },
    parametros: {
      type: Object,
      default: null
    },
    currentTime: {
      type: String,
      required: true
    }
  },
  computed: {
    displayName() {
      if (this.parametros?.nombreEmpresa?.toLowerCase() === 'tena') return '365 Obrador';
      return this.parametros?.nombreTienda || this.parametros?.nombreEmpresa || this.$t('visor.restaurant', 'nuestro restaurante');
    }
  }
}
</script>

<style scoped>
.welcome-screen {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  background-image: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 60%);
}

.welcome-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem;
  animation: fadeInOut 0.8s ease-out both;
}

@keyframes fadeInOut {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-logo {
  width: 140px;
  height: 140px;
  margin-bottom: 3rem;
  box-shadow: 0 12px 40px rgba(14, 165, 233, 0.3);
  border-radius: 24px;
}

.welcome-logo svg {
  width: 80px;
  height: 80px;
}

.welcome-title {
  font-size: clamp(4rem, 8vw, 7rem);
  font-weight: 800;
  color: #8c3b0f;
  line-height: 1.15;
  margin: 0 0 1.5rem 0;
  letter-spacing: -2px;
  text-shadow: 0 2px 10px rgba(170, 77, 23, 0.1);
}

.welcome-subtitle {
  font-size: clamp(2rem, 4vw, 3.5rem);
  color: #b45309;
  font-weight: 600;
  opacity: 0.9;
  margin: 0;
}

/* Duplicated footer styles to keep components independent visually */
.payment-footer {
  width: 100%;
  background: white;
  color: var(--text-muted);
  padding: 0.75rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
}

.payment-footer .footer-clock {
  font-size: 1.25rem;
  color: var(--primary);
}

.payment-footer .footer-branding {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.7;
}

.hit-logo {
  height: 28px;
  width: auto;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.2));
}

.logo-icon {
  background: linear-gradient(135deg, var(--hit-blue), var(--hit-blue-light));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-icon.no-bg {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  width: auto;
  height: auto;
}

.hit-logo-img {
  max-width: 150px;
  height: 100%;
  object-fit: contain;
}

/* Responsive for 800x480 landscape display */
@media (max-width: 900px) and (max-height: 600px) and (orientation: landscape) {
  .welcome-content {
    padding: 1.5rem;
  }
  .welcome-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 1.5rem;
  }
  .welcome-logo svg {
    width: 40px;
    height: 40px;
  }
  .welcome-title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  .welcome-subtitle {
    font-size: 1.5rem;
  }
  .payment-footer {
    padding: 0.5rem 1.5rem;
  }
  .payment-footer .footer-clock {
    font-size: 1.1rem;
  }
  .hit-logo {
    height: 20px;
  }
}
</style>
