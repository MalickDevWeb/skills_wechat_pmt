/**
 * 🎨 Helpers Universels de Page & Rendu Visuel
 * waitForNextPaint, Toasts et indicateurs conformes WeChat Mini-Program
 */

/**
 * Garantit que l'état visuel passé en paramètre est physiquement peint par le thread
 * WebView avant qu'une tâche JS bloquante ou un appel API lourd ne s'exécute.
 * @param {Object} page Instance de la page (this)
 * @param {Object} [state={}] État à injecter dans setData
 * @returns {Promise<void>}
 */
export const waitForNextPaint = (page, state = {}) =>
  new Promise((resolve) => {
    const afterSetData = () => {
      if (typeof wx !== 'undefined' && typeof wx.nextTick === 'function') {
        wx.nextTick(resolve);
        return;
      }
      setTimeout(resolve, 0);
    };

    if (page && typeof page.setData === 'function') {
      page.setData(state, afterSetData);
      return;
    }

    afterSetData();
  });

/**
 * Affiche un toast d'alerte ou de confirmation
 * @param {string} message 
 * @param {'success'|'error'|'none'} [type='none'] 
 */
export const showToast = (message, type = 'none') => {
  const iconMap = {
    success: 'success',
    error: 'none',
    none: 'none'
  };

  wx.showToast({
    title: message,
    icon: iconMap[type] || 'none'
  });
};

/**
 * Affiche le masque de chargement natif
 * @param {string} [message='Chargement...'] 
 */
export const showLoading = (message = 'Chargement...') => {
  wx.showLoading({ title: message, mask: true });
};

/**
 * Masque le chargement natif
 */
export const hideLoading = () => {
  wx.hideLoading();
};

