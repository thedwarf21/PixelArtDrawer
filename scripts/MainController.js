const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;
const BASE_ZOOM_RATIO = 1;

/**
 * Controller principal de l'app web
 *
 * @class      MainController (name)
 */
class MainController {
	constructor() {
		this.scope = {
			width: GRID_WIDTH,
			height: GRID_HEIGHT,
			color: "#000000",
			color_pick_mode: false,
			hot_new_draw: true
		};
		this.scope.pixel_grid = new PixelGrid(GRID_WIDTH, GRID_HEIGHT, BASE_ZOOM_RATIO);
		document.getElementById("drawing-zone").appendChild(this.scope.pixel_grid);

		// Application automatique du redimensionnement
		new RS_Binding({
			object: this.scope,
			property: "width"
		}).addBinding(document.getElementById("width"), "value", "change", ()=> { this.resizeGrid(); });
		new RS_Binding({
			object: this.scope,
			property: "height"
		}).addBinding(document.getElementById("height"), "value", "change", ()=> { this.resizeGrid(); });

		// Syncronisation du champ pour la couleur du pinceau
		new RS_Binding({
			object: this.scope,
			property: "color"
		}).addBinding(document.getElementById("color"), "value", "change");
	}

	/** 
	 * Si confirmatioon utilisateur 
	 *   => redimensionne la grille graphique selon le paramétrage 
	 * Sinon
	 *   => réinitialise le paramétrage selon dimensions de la grille graphique
	 */
	resizeGrid() {
		if (!this.scope.hot_new_draw) {
			RS_Confirm("<p>Le redimensionnement de l'image implique, la génération d'un nouveau calque vierge. Si vous choisissez d'appliquer le redimensionnement, votre travail non sauvegardé sera irrémédiablement perdu</p><p>Souhaitez-vous poursuivre ?", 
						"Redimensionnement du dessin", "Redimensionner", "Annuler", ()=> {
				this.scope.pixel_grid.applyDimensions(this.scope.width, this.scope.height);
				this.scope.hot_new_draw = true;
			}, ()=> {
				this.scope.width = this.scope.pixel_grid.getWidth();
				this.scope.height = this.scope.pixel_grid.getHeight();
			});
		} else this.scope.pixel_grid.applyDimensions(this.scope.width, this.scope.height);
	}

	/** Active/désactive le mode "copie de couleur depuis un pixel" */
	toggleColorPick() {
		if (this.scope.color_pick_mode)
			this.endColorPick();
		else this.startColorPick();
	}

	/** Active le mode "copie de couleur depuis un pixel" */
	startColorPick() {
		document.getElementById("btn_color_pick_mode").classList.add("mode_activated");
		this.scope.color_pick_mode = true;
	}

	/** Désactive le mode "copie de couleur depuis un pixel" */
	endColorPick() {
		document.getElementById("btn_color_pick_mode").classList.remove("mode_activated");
		this.scope.color_pick_mode = false;
	}
}

/** Fonction d'initialisation, invoquée par l'événement onLoad du corps de la page. */
function onLoad() {
	document.currentController = new MainController();
}