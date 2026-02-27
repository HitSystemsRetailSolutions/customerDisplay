<template>
  <div class="customer-display" :class="{ 'connected': connected }">
    <!-- Subtle Background Overlay -->
    <div class="bg-overlay"></div>
    
    <!-- ==================== WELCOME SCREEN ==================== -->
    <transition name="screen-fade">
      <WelcomeScreen
        v-if="uiState === 'WELCOME'"
        :logoTpv="logoTpv"
        :parametros="parametros"
        :currentTime="currentTime"
      />
    </transition>

    <!-- ==================== TICKET (NORMAL) SCREEN ==================== -->
    <transition name="screen-fade">
      <TicketScreen
        v-if="uiState === 'TICKET'"
        :logoTpv="logoTpv"
        :parametros="parametros"
        :connected="connected"
        :currentTime="currentTime"
        :totalUnidades="totalUnidades"
        :orderedList="orderedList"
        :totalPrecio="totalPrecio"
        :currentTicket="currentTicket"
      />
    </transition>

    <!-- ==================== PAYMENT SCREEN ==================== -->
    <transition name="screen-fade">
      <PaymentScreen
        v-if="uiState === 'PAYMENT'"
        :logoTpv="logoTpv"
        :currentTime="currentTime"
        :modalPago="modalPago"
      />
    </transition>

    <!-- ==================== THANK YOU SCREEN ==================== -->
    <transition name="screen-fade">
      <ThankYouScreen
        v-if="uiState === 'THANK_YOU'"
        :currentTime="currentTime"
        :logoTpv="logoTpv"
      />
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { io } from "socket.io-client"
import { useI18n } from 'vue-i18n'
import WelcomeScreen from './components/WelcomeScreen.vue'
import TicketScreen from './components/TicketScreen.vue'
import PaymentScreen from './components/PaymentScreen.vue'
import ThankYouScreen from './components/ThankYouScreen.vue'

export default {
  name: 'App',
  components: {
    WelcomeScreen,
    TicketScreen,
    PaymentScreen,
    ThankYouScreen
  },
  setup() {
    const { locale } = useI18n()
    const connected = ref(false)
    const currentTicket = ref({ lista: [] })
    const currentTime = ref('')
    const parametros = ref(null)
    const logoTpv = ref(null)

    // Modal de cobro
    const modalPago = ref({
      activo: false,
      total: 0,
      metodoPago: null // null | 'EFECTIVO' | 'TARJETA'
    })

    // Estados de UI: 'WELCOME' | 'TICKET' | 'PAYMENT' | 'THANK_YOU'
    const uiState = ref('WELCOME')
    let thankYouTimeout = null

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

    const totalUnidades = computed(() => {
      if (!currentTicket.value || !currentTicket.value.lista) return 0;
      return currentTicket.value.lista.reduce((sum, item) => sum + (item.unidades || 0), 0);
    })

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
        if (data && data.idiomaTienda) {
          locale.value = data.idiomaTienda.toLowerCase();
        }
      });

      socket.on("cargarLogoTpv", (data) => {
        logoTpv.value = data;
      });

      socket.on("cargarCestas", (arrayCestas) => {
        if (!arrayCestas || arrayCestas.length === 0) {
          currentTicket.value = { lista: [] };
          if (uiState.value === 'TICKET') uiState.value = 'WELCOME';
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
          if (targetCesta.lista && targetCesta.lista.length > 0) {
            // Cancelar el timeout de agradecimiento si de repente marcan un articulo
            if (thankYouTimeout) {
              clearTimeout(thankYouTimeout);
              thankYouTimeout = null;
            }
            // Forzar a TICKET para asegurarse de que muestre el nuevo articulo a menos que estemos pagando
            if (uiState.value !== 'PAYMENT') {
              uiState.value = 'TICKET';
            }
          } else if (uiState.value === 'TICKET') {
            uiState.value = 'WELCOME';
          }
        } else {
          currentTicket.value = { lista: [] };
          if (uiState.value === 'TICKET') uiState.value = 'WELCOME';
        }
      });

      // Modal de cobro: muestra pantalla de pago
      socket.on("modalCobro", ({ total, metodoPago } = {}) => {
        if (thankYouTimeout) {
          clearTimeout(thankYouTimeout);
          thankYouTimeout = null;
        }
        uiState.value = 'PAYMENT';
        modalPago.value = {
          activo: true,
          total: typeof total === 'number' ? total : (parseFloat(total) || 0),
          metodoPago: metodoPago || null
        };
      });

      // Cierra el modal de cobro y decide la siguiente pantalla
      socket.on("cerrarModalCobro", ({ pagado } = {}) => {
        modalPago.value.activo = false;
        if (pagado) {
          uiState.value = 'THANK_YOU';
          // A los 5 segundos vuelve a WELCOME
          thankYouTimeout = setTimeout(() => {
            if (uiState.value === 'THANK_YOU') {
              uiState.value = 'WELCOME';
              currentTicket.value = { lista: [] }; // vaciar visualmente
            }
            thankYouTimeout = null;
          }, 5000);
        } else {
          // Si el cobro se canceló (pagado = false o undefined)
          uiState.value = (currentTicket.value.lista && currentTicket.value.lista.length > 0) ? 'TICKET' : 'WELCOME';
        }
      });
    })

    onUnmounted(() => {
      if (socket) socket.disconnect()
      if (clockInterval) clearInterval(clockInterval)
      if (thankYouTimeout) clearTimeout(thankYouTimeout)
    })

    return {
      connected,
      currentTicket,
      orderedList,
      totalPrecio,
      totalUnidades,
      currentTime,
      parametros,
      logoTpv,
      modalPago,
      uiState
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
  --bg: #fef3c7;
  --card-bg: rgba(255, 255, 255, 0.98);
  --glass-border: rgba(245, 158, 11, 0.2);
  --text-main: #aa4d17ff;
  --text-muted: #78350f;
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

.screen-fade-enter-active,
.screen-fade-leave-active {
  transition: opacity 0.4s ease;
}
.screen-fade-enter-from,
.screen-fade-leave-to {
  opacity: 0;
}
</style>
