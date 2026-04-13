/**
 * Token opaco para invitaciones: nombre + pases (+ mesa opcional) cifrados (AES-256-GCM).
 * Formato JSON: v1 solo n,p | v2 añade m (número o texto corto). encryptPayload siempre emite v2.
 * Objetivo: que en la URL no vaya el nombre ni los pases en claro y que una
 * persona sin conocimientos técnicos no pueda alterarlos editando la barra de
 * direcciones. La clave puede estar en el JS del sitio (incluso pública): quien
 * sepa usar la consola o un script puede generar otro token; eso ya exige otro nivel.
 * La clave debe coincidir aquí y en invite-token-generador.html (o en window.INVITANDING_INVITE_SECRET).
 */
(function (global) {
  /** Misma cadena en generador y demo; puedes cambiarla por evento si quieres. */
  var INVITE_TOKEN_SECRET_DEFAULT =
    "invitanding-invite-key-CAMBIAR-en-produccion-minimo-24-caracteres";

  function getSecret() {
    return (
      (typeof global.INVITANDING_INVITE_SECRET === "string" && global.INVITANDING_INVITE_SECRET) ||
      INVITE_TOKEN_SECRET_DEFAULT
    );
  }

  function base64UrlEncode(u8) {
    var bin = "";
    for (var i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function base64UrlDecode(str) {
    var b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    var pad = b64.length % 4;
    if (pad === 2) b64 += "==";
    else if (pad === 3) b64 += "=";
    else if (pad !== 0) throw new Error("token");
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var j = 0; j < bin.length; j++) out[j] = bin.charCodeAt(j);
    return out;
  }

  function getAesKey(secret) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret)).then(function (raw) {
      return crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: 256 }, false, [
        "encrypt",
        "decrypt",
      ]);
    });
  }

  function normalizeMesa(mRaw) {
    if (mRaw == null || mRaw === "") return null;
    var ms = String(mRaw).trim();
    if (!ms) return null;
    if (/^\d{1,3}$/.test(ms)) {
      var n = parseInt(ms, 10);
      return isNaN(n) ? null : n;
    }
    return ms.slice(0, 24);
  }

  /**
   * @returns {Promise<string>} token para poner en ?t=
   * Payload v2: { v:2, n, p, m } — m opcional (número mesa o texto corto).
   */
  function encryptPayload(secret, payload) {
    var obj = {
      v: 2,
      n: String(payload.n || "").trim(),
      p: Math.min(99, Math.max(1, parseInt(payload.p, 10) || 1)),
      m: normalizeMesa(payload.m),
    };
    var plain = new TextEncoder().encode(JSON.stringify(obj));
    return getAesKey(secret).then(function (key) {
      var iv = crypto.getRandomValues(new Uint8Array(12));
      return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, plain).then(function (ctBuf) {
        var ct = new Uint8Array(ctBuf);
        var combined = new Uint8Array(iv.length + ct.length);
        combined.set(iv, 0);
        combined.set(ct, iv.length);
        return base64UrlEncode(combined);
      });
    });
  }

  /**
   * @returns {Promise<{ n: string, p: number, m: number|string|null }>}
   */
  function decryptPayload(secret, tokenStr) {
    if (!tokenStr || typeof tokenStr !== "string") throw new Error("empty");
    var combined = base64UrlDecode(tokenStr.trim());
    if (combined.length < 13) throw new Error("short");
    var iv = combined.slice(0, 12);
    var ct = combined.slice(12);
    return getAesKey(secret).then(function (key) {
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ct);
    }).then(function (plainBuf) {
      var text = new TextDecoder().decode(plainBuf);
      var data = JSON.parse(text);
      var n = typeof data.n === "string" ? data.n.trim() : "";
      var p = parseInt(data.p, 10);
      if (isNaN(p) || p < 1) p = 1;
      if (p > 99) p = 99;
      var m = null;
      if (data.v === 2) {
        if (typeof data.m === "number" && !isNaN(data.m)) m = data.m;
        else if (typeof data.m === "string" && data.m.trim()) m = data.m.trim().slice(0, 24);
      } else if (data.v === 1) {
        m = null;
      } else {
        throw new Error("version");
      }
      return { n: n || "Invitado/a", p: p, m: m };
    });
  }

  global.InviteToken = {
    encryptPayload: encryptPayload,
    decryptPayload: decryptPayload,
    getDefaultSecret: function () {
      return INVITE_TOKEN_SECRET_DEFAULT;
    },
    getSecret: getSecret,
  };
})(typeof window !== "undefined" ? window : globalThis);
