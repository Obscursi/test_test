import uiManagerInstance from './UIManager.js';
import { ENIGMA_STATUS } from '../Utils/Constant.js';
import { SCREEN_IDS } from '../Utils/Constant.js';

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


export function showVictoryScreen() {
    uiManagerInstance.tabManager.showTab(SCREEN_IDS.VICTORY);
}


/**
 * Fin de partie perdue : on ouvre l'onglet de défaite (comme l'écran de victoire, il n'a pas de
 * bouton dans la navigation) puis on coupe tous les accès au jeu.
 */
export function showDefeatScreen() {
    uiManagerInstance.tabManager.tabs[SCREEN_IDS.DEFEAT].status = ENIGMA_STATUS.AVAILABLE;
    uiManagerInstance.tabManager.showTab(SCREEN_IDS.DEFEAT);
    uiManagerInstance.tabManager.lockInterfaceForEndOfGame();
}


/**
 * Announce to the team that they unlocked a new object in a new location
 *
 * @param {string} reward - the location of the object they got
 * @returns {Promise<void>} resolved when clicked on it
 */
export function showRewardAlert(reward) {
    return new Promise(resolve => {
        const modal = document.getElementById('reward-modal');
        const messageBox = document.getElementById('reward-message');
        const okBtn = document.getElementById('reward-ok-btn');

        if (!modal || !messageBox || !okBtn) {
            console.log("DEBUG showRewardAlert : la modale des objets est introuvable");
            resolve();
            return;
        }

        messageBox.textContent = reward;
        modal.classList.remove('hidden');

        const close = () => {
            modal.classList.add('hidden');
            okBtn.removeEventListener('click', close);
            resolve();
        };

        okBtn.addEventListener('click', close);
    });
}


/**
 * Demande au joueur de confirmer une réponse tapée à la main avant de la valider pour de bon.
 * Sert de garde-fou contre les fautes de frappe qui déclencheraient une pénalité pour rien
 * (le cooldown de L'accusation, une tentative perdue sur l'énigme finale...).
 * @param {string} message - récapitule ce que le joueur s'apprête à valider
 * @returns {Promise<boolean>} true si le joueur confirme, false s'il préfère modifier sa réponse
 */
export function showConfirmAlert(message) {
    return new Promise(resolve => {
        const modal = document.getElementById('confirm-modal');
        const messageBox = document.getElementById('confirm-message');
        const confirmBtn = document.getElementById('confirm-ok-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');

        if (!modal || !messageBox || !confirmBtn || !cancelBtn) {
            console.log("DEBUG showConfirmAlert : la modale de confirmation est introuvable, on valide directement");
            resolve(true);
            return;
        }

        messageBox.textContent = message;
        modal.classList.remove('hidden');

        const close = (result) => {
            modal.classList.add('hidden');
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            resolve(result);
        };

        const onConfirm = () => close(true);
        const onCancel = () => close(false);

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
    });
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