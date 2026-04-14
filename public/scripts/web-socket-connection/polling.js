import { renderAccusationResult } from "../accusation/accusation_result.js";
import { fetchGameState } from "../api/fetch_service.js";
import { renderActions } from "../board.js";
import { disproveASuspicion } from "../disprove.js";
import { renderBoard } from "../render_board.js";
import { renderPlayers } from "../render_player.js";
import { renderPlayerCards } from "../render_player_cards.js";
import { suspicionBtnListener } from "../suspicion.js";
import { disableButtons, toggleActionButton } from "../utils/ui.js";
import { handleRedirectBasedOnGameState } from "../victory.js";

export const polling = (playerCardsContainer) => {
  let prevEtag = null;

  setInterval(async () => {
    const { etag, changed, gameConfig } = await fetchGameState(
      "/game",
      prevEtag,
    );
    prevEtag = etag;

    if (changed) {
      disableButtons(gameConfig);
      handleRedirectBasedOnGameState(gameConfig);
      renderBoard(gameConfig);
      renderPlayers(gameConfig);
      renderPlayerCards(gameConfig.currentPlayer.hand, playerCardsContainer);
      suspicionBtnListener(gameConfig);
      gameConfig.hasSuspected && disproveASuspicion(gameConfig);
      toggleActionButton(gameConfig);
      renderActions(gameConfig);
      if (gameConfig.shouldShowAccusationResult) {
        renderAccusationResult(gameConfig);
      }
    }
  }, 1000);
};
