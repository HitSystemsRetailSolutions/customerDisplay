<template>
  <div class="customer-display" :class="{ 'connected': connected }">
    <!-- Subtle Background Overlay -->
    <div class="bg-overlay"></div>
    
    <header class="header">
      <div class="brand">
        <div class="logo-icon" :class="{ 'no-bg': logoTpv }">
          <img v-if="logoTpv" :src="`data:image/${logoTpv.extension};base64,${logoTpv.archivo}`" class="hit-logo-img" />
          <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <div class="brand-text">
          <h1>{{ parametros?.nombreTienda || parametros?.nombreEmpresa || 'Mi Pedido' }}</h1>
          <p>{{ (parametros?.nombreTienda || parametros?.nombreEmpresa) ? 'Visor de Cliente' : 'Bienvenidos' }}</p>
        </div>
      </div>
      <div class="status-badge" :class="connected ? 'online' : 'offline'">
        <span class="dot"></span>
        {{ connected ? 'En Línea' : 'Reconectando' }}
      </div>
    </header>

    <main class="content-grid">
      <section class="items-list-container" ref="cartList">
        <div class="section-header">
          <h2>Artículos</h2>
          <span class="count-badge">{{ currentTicket.lista.length }}</span>
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
                  <div v-if="item.promocion && item.promocion.grupos && item.promocion.grupos.length > 0" class="item-sub-list promo-items">
                    <template v-for="(grupo, gIdx) in item.promocion.grupos" :key="'group-' + gIdx">
                      <div v-for="(pItem, pIdx) in grupo" :key="'pitem-' + gIdx + '-' + pIdx" class="sub-entry">
                        <svg class="sub-bullet promo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h3>Esperando artículos</h3>
            <p>La información de su ticket aparecerá aquí.</p>
          </div>
        </div>
      </section>

      <aside class="summary-panel">
        <div class="summary-card">
          <div class="summary-row header-row">
            <span>RESUMEN</span>
          </div>
          
          <!-- Summary details removed as requested (VAT breakdown) -->

          <div class="divider"></div>

          <div class="total-box">
            <span class="total-label">TOTAL A PAGAR</span>
            <div class="total-amount-wrapper">
              <span class="amount">{{ totalPrecio.toFixed(2) }}</span>
              <span class="currency">€</span>
            </div>
          </div>

          <div class="footer-msg">
            <p>Gracias por su visita</p>
          </div>
        </div>
      </aside>
    </main>

    <!-- Branded Footer with Clock -->
    <footer class="footer-bar">
      <div class="footer-clock">{{ currentTime }}</div>
      <div class="footer-branding">
        <span>Desarrollado por</span>
        <img src="/img/logo-hitsystems.png" alt="Hit Systems" class="hit-logo" onerror="this.style.display='none'" />
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { io } from "socket.io-client"

export default {
  name: 'App',
  setup() {
    const connected = ref(false)
    const currentTicket = ref({ lista: [] })
    const cartList = ref(null)
    const currentTime = ref('')
    const parametros = ref(null)
    const logoTpv = ref(null)

    const updateClock = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }

    const totalPrecio = computed(() => {
      if (!currentTicket.value || !currentTicket.value.lista) return 0;
      return currentTicket.value.lista.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    })

    const orderedList = computed(() => {
      if (!currentTicket.value || !currentTicket.value.lista) return [];
      return [...currentTicket.value.lista].reverse();
    })
    watch(
      () => currentTicket.value.lista.length,
      () => {
        nextTick(() => {
          if (cartList.value) {
            const scrollArea = cartList.value.querySelector('.scroll-area');
            if (scrollArea) {
              // Now we scroll to the TOP because newest items are there
              scrollArea.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }
          }
        });
      }
    )

    let socket;
    let clockInterval;

    onMounted(() => {
      updateClock()
      clockInterval = setInterval(updateClock, 1000)

      const socketUrl = "ws://" + window.location.hostname + ":5051";
      socket = io(socketUrl, {
        reconnectionDelayMax: 10000,
        transports: ['websocket']
      });

      socket.on("connect", () => {
        connected.value = true;
        socket.emit("cargarParametros");
        socket.emit("cargarLogoTpv");
      });

      socket.on("disconnect", () => {
        connected.value = false;
      });

      socket.on("cargarParametros", (data) => {
        parametros.value = data;
      });

      socket.on("cargarLogoTpv", (data) => {
        logoTpv.value = data;
      });

      socket.on("cargarCestas", (arrayCestas) => {
        if (!arrayCestas || arrayCestas.length === 0) {
          currentTicket.value = { lista: [] };
          return;
        }
        
        let targetCesta = null;
        const directSales = arrayCestas.filter(c => c.modo === 'VENTA' && (c.indexMesa === null || c.indexMesa === undefined));
        
        if (directSales.length > 0) {
           targetCesta = directSales.sort((a,b) => b.timestamp - a.timestamp)[0];
        } else {
           targetCesta = arrayCestas
             .filter(c => c.lista && c.lista.length > 0)
             .sort((a,b) => b.timestamp - a.timestamp)[0];
        }

        if (targetCesta) {
          currentTicket.value = targetCesta;
        } else {
          currentTicket.value = { lista: [] };
        }
      });
    })

    onUnmounted(() => {
      if (socket) socket.disconnect()
      if (clockInterval) clearInterval(clockInterval)
    })

    return {
      connected,
      currentTicket,
      orderedList,
      totalPrecio,
      cartList,
      currentTime,
      parametros,
      logoTpv
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

:root {
  --primary: #f59e0b;
  --secondary: #fbbf24;
  --accent: #ef4444;
  --bg: #fffbeb;
  --card-bg: rgba(255, 255, 255, 0.98);
  --glass-border: rgba(245, 158, 11, 0.2);
  --text-main: #451a03;
  --text-muted: #92400e;
  --hit-blue: #0ea5e9;
  --hit-blue-light: #38bdf8;
}

body {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  background-color: var(--bg);
  color: var(--text-main);
  overflow: hidden;
  height: 100vh;
}

.customer-display {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: var(--bg);
  z-index: -1;
}

/* Header */
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
  gap: 1.25rem;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--hit-blue), var(--hit-blue-light));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.logo-icon.no-bg {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  width: auto;
  height: 52px;
}

.logo-icon svg { width: 28px; height: 28px; }

.hit-logo-img {
  max-width: 150px;
  height: 100%;
  object-fit: contain;
}

.brand-text h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--text-main);
}

.brand-text p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.status-badge.online {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.offline {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.status-badge.online .dot {
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0% { transform: scale(0.95); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(0.95); opacity: 1; }
}

/* Main Layout */
.content-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  padding: 2rem 3rem;
  overflow: hidden;
}

.items-list-container {
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.08);
}

.section-header {
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-main);
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
  padding: 1.5rem 2rem;
  scrollbar-width: none;
}
.scroll-area::-webkit-scrollbar { display: none; }

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255,255,255,0.03);
  border-radius: 20px;
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.item-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: var(--glass-border);
  transform: scale(1.01);
}

.item-qty-circle {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(56, 189, 248, 0.1));
  color: var(--hit-blue);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  border: 1px solid rgba(14, 165, 233, 0.2);
}

.item-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.item-main-content {
  flex: 1;
}

.item-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-main);
}

.item-price-unit {
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.item-subtotal {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary);
  white-space: nowrap;
}

/* Redesigned Integrated Sub-lists (Supplements & Promo Items) */
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
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.header-row {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 3px;
  color: var(--primary);
  margin-bottom: 2rem;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.detail-line {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 1rem;
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

/* Responsive adjustments */
@media (max-width: 1200px) {
  .amount { font-size: 4.5rem; }
  .content-grid { grid-template-columns: 1fr 340px; padding: 1.5rem; }
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
  .amount { font-size: 4rem; }
  .scroll-area { max-height: calc(100vh - 350px); }
  .detail-line, .divider, .header-row, .footer-msg { display: none; }
  .summary-details { margin-bottom: 0.5rem; }
}

@media (max-width: 480px) {
  .header { padding: 1rem 1.5rem; }
  .brand-text h1 { font-size: 1.2rem; }
  .logo-icon { width: 36px; height: 36px; }
  .logo-icon svg { width: 20px; height: 20px; }
  .amount { font-size: 3rem; }
  .content-grid { padding: 1rem; }
  .item-name { font-size: 1.1rem; }
  .item-qty-circle { width: 36px; height: 36px; font-size: 1rem; }
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

.footer-icons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  opacity: 0.5;
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
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.2));
}

.hit-text {
  font-weight: 800;
  color: #38bdf8; /* Blue consistent with HitSystems branding */
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
</style>


