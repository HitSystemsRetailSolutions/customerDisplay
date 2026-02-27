<template>
  <div class="normal-screen">
    <header class="header">
      <div class="brand">
        <div class="logo-icon" :class="{ 'no-bg': logoTpv }">
          <img v-if="logoTpv" :src="`data:image/${logoTpv.extension};base64,${logoTpv.archivo}`" class="hit-logo-img" />
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <div class="brand-text">
          <h1>{{ parametros?.nombreTienda || parametros?.nombreEmpresa || $t("visor.myOrder", "Mi Pedido") }}</h1>
          <p>
            {{
              parametros?.nombreTienda || parametros?.nombreEmpresa
                ? $t("visor.customerDisplay", "Visor de Cliente")
                : $t("visor.welcome", "Bienvenidos")
            }}
          </p>
        </div>
      </div>
      <div class="status-badge" :class="connected ? 'online' : 'offline'">
        <span class="dot"></span>
        {{ connected ? $t("visor.online", "En Línea") : $t("visor.reconnecting", "Reconectando") }}
      </div>
    </header>

    <main class="content-grid">
      <section class="items-list-container" ref="cartList">
        <div class="section-header">
          <h2>{{ $t("visor.articles", "Artículos") }}</h2>
          <span class="count-badge">{{ totalUnidades }}</span>
        </div>

        <div class="scroll-area">
          <transition-group name="list-stagger" tag="div" class="items-grid">
            <div v-for="item in orderedList" :key="item.instanceId || item.idArticulo" class="item-card">
              <div class="item-qty-circle">{{ item.unidades }}</div>
              <div class="item-info">
                <div class="item-main-content">
                  <h3 class="item-name">{{ item.nombre }}</h3>

                  <!-- Enhanced Integrated Supplements -->
                  <div v-if="item.arraySuplementos && item.arraySuplementos.length > 0" class="item-sub-list">
                    <div v-for="(sup, sIdx) in item.arraySuplementos" :key="'sup-' + sIdx" class="sub-entry">
                      <svg class="sub-bullet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                      </svg>
                      {{ sup.nombre }}
                    </div>
                  </div>

                  <!-- Integrated Promotion Items -->
                  <div
                    v-if="item.promocion && item.promocion.grupos && item.promocion.grupos.length > 0"
                    class="item-sub-list promo-items">
                    <template v-for="(grupo, gIdx) in item.promocion.grupos">
                      <div v-for="(pItem, pIdx) in grupo" :key="'pitem-' + gIdx + '-' + pIdx" class="sub-entry">
                        <svg
                          class="sub-bullet promo"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span class="p-qty" v-if="pItem.unidades > 1">{{ pItem.unidades }}x</span> {{ pItem.nombre }}
                      </div>
                    </template>
                  </div>
                </div>
                <div class="item-subtotal">{{ item.subtotal.toFixed(2) }} €</div>
              </div>
            </div>
          </transition-group>

          <div v-if="currentTicket.lista.length === 0" class="empty-state">
            <div class="empty-illustration">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h3>{{ $t("visor.waitingForItems", "Esperando artículos") }}</h3>
            <p>{{ $t("visor.ticketInfoWillAppearHere", "La información de su ticket aparecerá aquí.") }}</p>
          </div>
        </div>
      </section>

      <aside class="summary-panel">
        <div class="summary-card">
          <div class="summary-row header-row">
            <span>{{ $t("visor.summary", "RESUMEN") }}</span>
          </div>

          <div class="divider"></div>

          <div class="total-box">
            <span class="total-label">{{ $t("visor.totalToPay", "TOTAL A PAGAR") }}</span>
            <div class="total-amount-wrapper">
              <span class="amount">{{ totalPrecio.toFixed(2) }}</span>
              <span class="currency">€</span>
            </div>
          </div>

          <div class="footer-msg">
            <p>{{ $t("visor.thankYouForVisiting", "Gracias por su visita") }}</p>
          </div>
        </div>
      </aside>
    </main>

    <!-- Branded Footer with Clock -->
    <footer class="footer-bar">
      <div class="footer-clock">{{ currentTime }}</div>
      <div class="footer-branding">
        <span>{{ $t("visor.developedBy", "Desarrollado por") }}</span>
        <img src="/img/logo-hitsystems.png" alt="Hit Systems" class="hit-logo" onerror="this.style.display='none'" />
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, watch, nextTick } from "vue";

export default {
  name: "TicketScreen",
  props: {
    logoTpv: Object,
    parametros: Object,
    connected: Boolean,
    currentTime: String,
    totalUnidades: Number,
    orderedList: Array,
    totalPrecio: Number,
    currentTicket: Object,
  },
  setup(props) {
    const cartList = ref(null);

    // Scroll to top when items are added to the cart
    watch(
      () => props.currentTicket.lista.length,
      () => {
        nextTick(() => {
          if (cartList.value) {
            const scrollArea = cartList.value.querySelector(".scroll-area");
            if (scrollArea) {
              scrollArea.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }
          }
        });
      },
    );

    return {
      cartList,
    };
  },
};
</script>

<style scoped>
.normal-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* Header Refinements */
.header {
  height: 80px;
  padding: 0 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-bottom: 3px solid var(--hit-blue);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.brand-text h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.brand-text p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Status Badge */
.status-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.25rem;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: relative;
}

.online .dot {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  animation: pulse 2s infinite;
}

.offline .dot {
  background: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.online {
  color: #10b981;
}
.offline {
  color: #ef4444;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

/* Main Content Grid */
.content-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  padding: 2rem 3rem;
  overflow: hidden;
}

/* Items List Styling */
.items-list-container {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--glass-border);
}

.section-header {
  padding: 1.5rem 2rem;
  border-bottom: 2px solid var(--glass-border);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fdfdfd;
}

.section-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.count-badge {
  background: var(--primary);
  padding: 0.2rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: white;
  font-weight: 700;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  scroll-behavior: smooth;
}

.scroll-area::-webkit-scrollbar {
  display: none;
}

.scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.items-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Individual Item Card */
.item-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.item-qty-circle {
  min-width: 36px;
  height: 36px;
  padding: 0 6px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(56, 189, 248, 0.1));
  color: var(--hit-blue);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  border: 1px solid rgba(14, 165, 233, 0.2);
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-qty-circle {
  font-size: clamp(0.8rem, 2.5vw, 1.1rem);
  max-width: 70px;
}

.item-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}

.item-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-main);
}

.item-subtotal {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary);
  white-space: nowrap;
}

.item-sub-list {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sub-entry {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--text-muted);
  font-weight: 500;
}

.sub-bullet {
  width: 12px;
  height: 12px;
  color: var(--primary);
  opacity: 0.6;
}

.sub-bullet.promo {
  color: #fbbf24;
}

.p-qty {
  font-weight: 700;
  color: var(--text-main);
  font-size: 0.85rem;
  margin-right: 4px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
}

.empty-illustration {
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

/* Summary Panel */
.summary-panel {
  display: flex;
  flex-direction: column;
}

.summary-card {
  background: white;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  padding: 2.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.header-row {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 3px;
  color: var(--primary);
  margin-bottom: 2rem;
}

.divider {
  height: 2px;
  background: var(--glass-border);
  margin-bottom: 2.5rem;
}

.total-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.total-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.total-amount-wrapper {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.currency {
  font-size: 2.5rem;
  color: var(--primary);
  font-weight: 300;
}

.amount {
  font-size: 6rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -2px;
  color: var(--text-main);
}

.footer-msg {
  text-align: center;
  margin-top: auto;
}

.footer-msg p {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

/* Footer Bar */
.footer-bar {
  background: #f1f5f9;
  color: #475569;
  padding: 0.75rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  letter-spacing: 1px;
  border-top: 1px solid #e2e8f0;
}

.footer-clock {
  font-size: 1.25rem;
  color: var(--primary);
}

.footer-branding {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.hit-logo {
  height: 28px;
  width: auto;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.2));
}

.hit-text {
  font-weight: 800;
  color: #38bdf8;
}

.logo-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--hit-blue), var(--hit-blue-light));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.2);
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

.logo-icon svg {
  width: 24px;
  height: 24px;
}

/* Transitions */
.list-stagger-enter-active {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
.list-stagger-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.95);
}
.list-stagger-move {
  transition: transform 0.4s ease;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .amount {
    font-size: 4.5rem;
  }
  .content-grid {
    grid-template-columns: 1fr 340px;
    padding: 1.5rem;
  }
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
    overflow-y: auto;
    padding-bottom: 200px;
  }
  .summary-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: auto;
    z-index: 100;
  }
  .summary-card {
    border-radius: 24px 24px 0 0;
    padding: 1.5rem 2rem;
  }
  .amount {
    font-size: 4rem;
  }
  .scroll-area {
    max-height: calc(100vh - 350px);
  }
  .detail-line,
  .divider,
  .header-row,
  .footer-msg {
    display: none;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 1rem 1.5rem;
  }
  .brand-text h1 {
    font-size: 1.2rem;
  }
  .logo-icon {
    width: 36px;
    height: 36px;
  }
  .logo-icon svg {
    width: 20px;
    height: 20px;
  }
  .amount {
    font-size: 3rem;
  }
  .content-grid {
    padding: 1rem;
  }
  .item-name {
    font-size: 1.1rem;
  }
  .item-qty-circle {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
}
</style>
