// Reprend le contenu de SuperAdminView (comptes marchands, graphique, grille lots)
// Redirige vers la page existante pour éviter la duplication de code.
import { useApp } from "../../contexts/AppContext.jsx";
import { SuperAdminView } from "../SuperAdminView.jsx";

export const TabParametres = ({isMobile}) => {
  const {state, dispatch} = useApp();
  return <SuperAdminView isMobile={isMobile} state={state} dispatch={dispatch}/>;
};
