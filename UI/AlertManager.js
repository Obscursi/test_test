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
}

export function showVictoryScreen() {
    ./.showTab('victoire'); place the file where showTab is
}*/