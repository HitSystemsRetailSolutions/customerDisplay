<template>
  <div class="payment-screen">
    <div class="payment-bg-anim"></div>

    <div class="payment-content">
      <!-- Header of payment screen -->
      <div class="payment-header">
        <div class="logo-icon payment-logo" :class="{ 'no-bg': logoTpv }">
          <img v-if="logoTpv" :src="`data:image/${logoTpv.extension};base64,${logoTpv.archivo}`" class="hit-logo-img" />
          <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <h2 class="payment-title">TOTAL A PAGAR</h2>
      </div>

      <!-- Big price -->
      <div class="payment-price-wrap">
        <span class="payment-amount">{{ modalPago.total.toFixed(2) }}</span>
        <span class="payment-currency">€</span>
      </div>

      <!-- Payment method options -->
      <p class="payment-question">¿Cómo desea pagar?</p>
      <div class="payment-methods">
        <div class="method-card" :class="{ 'active': modalPago.metodoPago === 'EFECTIVO' }">
          <div class="method-icon">
            <!-- Cash icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <circle cx="12" cy="12" r="2"/>
              <path d="M6 12h.01M18 12h.01"/>
            </svg>
          </div>
          <span>Efectivo</span>
        </div>
        <div class="method-card" :class="{ 'active': modalPago.metodoPago === 'TARJETA' }">
          <div class="method-icon">
            <!-- Card icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
              <line x1="6" y1="15" x2="10" y2="15"/>
            </svg>
          </div>
          <span>Tarjeta</span>
        </div>
      </div>
    </div>

    <!-- Footer clock -->
    <div class="payment-footer">
      <div class="footer-clock">{{ currentTime }}</div>
      <div class="footer-branding">
        <span>Desarrollado por</span>
        <img src="/img/logo-hitsystems.png" alt="Hit Systems" class="hit-logo" onerror="this.style.display='none'" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentScreen',
  props: {
    logoTpv: {
      type: Object,
      default: null
    },
    currentTime: {
      type: String,
      required: true
    },
    modalPago: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.payment-screen {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background: var(--bg);
  overflow: hidden;
}

.payment-bg-anim {
  display: none;
}

.payment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  padding: 3rem 2rem;
  position: relative;
  z-index: 1;
  width: 100%;
}

.payment-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.payment-logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--hit-blue), var(--hit-blue-light));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 20px rgba(14, 165, 233, 0.25);
}

.payment-logo svg { width: 34px; height: 34px; }

.payment-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 4px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.payment-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  animation: priceIn 0.5s cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes priceIn {
  from { opacity: 0; transform: scale(0.85) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.payment-amount {
  font-size: clamp(6rem, 18vw, 14rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -4px;
  color: var(--text-main);
  text-shadow: 0 4px 24px rgba(170, 77, 23, 0.15);
}

.payment-currency {
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 300;
  color: var(--primary);
}

.payment-question {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.payment-methods {
  display: flex;
  gap: 2rem;
}

.method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 3rem;
  border-radius: 24px;
  border: 2px solid var(--glass-border);
  background: var(--card-bg);
  color: rgba(170, 77, 23, 0.35);
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: default;
  min-width: 160px;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.06);
}

.method-card.active {
  border-color: var(--primary);
  background: white;
  color: var(--text-main);
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.2), 0 8px 32px rgba(245, 158, 11, 0.12);
  transform: scale(1.04);
}

.method-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.method-card.active .method-icon {
  background: rgba(245, 158, 11, 0.15);
}

.method-icon svg {
  width: 30px;
  height: 30px;
  stroke: currentColor;
}

.method-card.active .method-icon svg {
  stroke: var(--primary);
  filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.5));
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

@media (max-width: 480px) {
  .payment-amount { letter-spacing: -2px; }
}
</style>
