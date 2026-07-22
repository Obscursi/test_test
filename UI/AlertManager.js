import uiManagerInstance from './UIManager.js';

export function showError(messageInfo) {
    const modal = document.getElementById('hardware-error-modal');
    const messageBox = document.getElementById('hardware-error-message');

    if (modal && messageBox) {
        // 1. On injecte le message spécifique (ex: "Caméra débranchée")
        messageBox.textContent = messageInfo;

        // 2. On retire la classe 'hidden' pour afficher l'écran
        modal.classList.remove('hidden');
    } else {
        // Sécurité de dernier recours si le HTML est introuvable
        console.error("ERREUR FATALE : ", messageInfo);
        alert("Erreur critique : " + messageInfo + "\n");
        window.location.href = window.location.href + '?timestamp=' + new Date().getTime()
    }
}


/*export function hideError() {
    const modal = document.getElementById('hardware-error-modal');
    if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
    }
}


export function showNotification(message) {
    uiManagerInstance.notificationBanner.innerText = message;
    uiManagerInstance.notificationBanner.style.display = "block";

    setTimeout(() => {
        this.notificationBanner.style.display = "none";
    }, 3000);
}*/

export function showVictoryScreen() {
    uiManagerInstance.tabManager.showTab('victoire');
}


/**
 * Affiche un pop-up d'indice stylisé au centre de l'écran
 * @param {string} message Le texte de l'indice à afficher
 */
export function showClueAlert(message) {
    // 1. Création du conteneur de fond (Overlay)
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999'; // Toujours au-dessus du reste

    // 2. Création de la boîte de dialogue
    const dialogBox = document.createElement('div');
    dialogBox.style.backgroundColor = '#1a1a1a';
    dialogBox.style.border = '2px solid #00ffcc'; // Couleur typique Sci-Fi
    dialogBox.style.padding = '30px';
    dialogBox.style.borderRadius = '8px';
    dialogBox.style.textAlign = 'center';
    dialogBox.style.color = 'white';
    dialogBox.style.fontFamily = 'Arial, sans-serif';
    dialogBox.style.boxShadow = '0 0 20px rgba(0, 255, 204, 0.5)';

    // 3. Contenu de la boîte
    const title = document.createElement('h2');
    title.innerText = '✨ INDICE DÉVERROUILLÉ';
    title.style.color = '#00ffcc';
    title.style.marginTop = '0';

    const text = document.createElement('p');
    text.innerText = message;
    text.style.fontSize = '18px';
    text.style.margin = '20px 0';

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'OK';
    closeBtn.style.padding = '10px 20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.backgroundColor = '#00ffcc';
    closeBtn.style.color = 'black';
    closeBtn.style.border = 'none';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.borderRadius = '4px';

    // 4. Logique de fermeture
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    // 5. Assemblage et affichage
    dialogBox.appendChild(title);
    dialogBox.appendChild(text);
    dialogBox.appendChild(closeBtn);
    overlay.appendChild(dialogBox);
    document.body.appendChild(overlay);
}