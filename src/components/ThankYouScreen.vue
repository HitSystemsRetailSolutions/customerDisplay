<template>
  <div class="thankyou-screen">
    <div class="thankyou-content">
      <div class="success-checkmark">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h1 class="welcome-title">{{ $t('visor.thankYouForVisiting','¡Gracias por su visita!') }}</h1>
      <p class="welcome-subtitle">{{ $t('visor.weHopeToSeeYouSoon','Esperamos verle pronto de nuevo.') }}</p>
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
  name: 'ThankYouScreen',
  props: {
    currentTime: {
      type: String,
      required: true
    },
    logoTpv: {
      type: Object,
      default: null
    }
  }
}
</script>

<style scoped>
.thankyou-screen {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  background-image: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 60%);
}

.thankyou-content {
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

.success-checkmark {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
  margin-bottom: 3rem;
  animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  box-shadow: 0 0 0 20px rgba(34, 197, 94, 0.05);
}

.success-checkmark svg {
  width: 90px;
  height: 90px;
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  80% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

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

/* Responsive for 800x480 landscape display */
@media (max-width: 900px) and (max-height: 600px) and (orientation: landscape) {
  .thankyou-content {
    padding: 1.5rem;
  }
  .success-checkmark {
    width: 80px;
    height: 80px;
    margin-bottom: 1.5rem;
  }
  .success-checkmark svg {
    width: 45px;
    height: 45px;
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
