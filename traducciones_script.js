const fs = require("fs");
const path = require("path");

const keyValues = [];
const rootDir = path.join(__dirname, "src");

let fetch;

async function loadFetch() {
  if (!fetch) {
    fetch = (await import("node-fetch")).default;
  }
}

/**
 * @param {*} dir
 * Indica el directorio en el que empezara a buscar, en este caso en src
 */
function extractKeys(dir) {
  /**
   * Está función lo que hace, es recorrer cada archivo del proyecto
   * buscando esto -> $t('traduccion_key', 'valor_de_la_traduccion_key'), y cuando lo encuentra
   * lo añade a un array de objectos que sigue esta estructura:
   * [
   *  {
   *    key: 'key',
   *    value: 'valor_de_la_key'
   *  },
   *  {
   *    key: 'key_2',
   *    value: 'valor_de_la_key_2'
   *  },
   *  etc...
   * ]
   * y después los envía al BackEnd para después enviarlos al SantaAna.
   * En cada proyecto tienes la explicación de que hace esa parte del código.
   */
  const files = fs.readdirSync(dir);
  const seenKeys = new Set();
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      extractKeys(filePath);
    } else if (stats.isFile() && path.extname(file) === ".vue") {
      const data = fs.readFileSync(filePath, "utf8");

      /**
       * EXPLICACIÓN DEL REGEX:
       * \b           -> Límite de palabra (evita que detecte 'concat')
       * \$?t         -> Busca 't' con un '$' opcional delante
       * \s*\(        -> Paréntesis de apertura con posibles espacios
       * (['"])(.*?)\1 -> Primer argumento entre comillas (captura el contenido)
       * \s*,\s* -> Coma rodeada de posibles espacios
       * (['"])(.*?)\3 -> Segundo argumento entre comillas
       */
      const regex = /\b\$?t\s*\((['"])(.*?)\1\s*,\s*(['"])(.*?)\3(?:[\s\S]*?|)\)/g;

      let match;
      while ((match = regex.exec(data)) !== null) {
        const fullKey = match[2]; // Ej: "checkout.error_registering_debt_sale"
        const value = match[4];   // Ej: "No se ha podido registrar..."

        // Separamos por el primer punto encontrado
        const dotIndex = fullKey.indexOf('.');

        let group, key;

        if (dotIndex !== -1) {
          // Si hay punto, dividimos
          group = fullKey.substring(0, dotIndex);
          key = fullKey.substring(dotIndex + 1);
        } else {
          // Si no hay punto, grupo vacío (o uno por defecto) y la key es el texto completo
          group = '';
          key = fullKey;
        }

        const identifier = `${group}.${key}`;
        if (!seenKeys.has(identifier)) {
          seenKeys.add(identifier);
          keyValues.push({ group, key, value });
        }
      }
    }
  }

}

async function sendKeys() {
  await loadFetch();
  try {
    const response = await fetch("http://localhost:3000/traducciones/setTraduccionesKeys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(keyValues),
    });
    const data = await response.json();
    if (!data || !data.msg) {
      return;
    }
    if (data.error) {
      return;
    }
  } catch (err) {
    console.log(err);
  }
}

extractKeys(rootDir);
sendKeys();
