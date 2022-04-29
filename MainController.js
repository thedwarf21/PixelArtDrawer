const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;

class MainController {
	constructor() {
		this.scope = {
			width: GRID_WIDTH,
			height: GRID_HEIGHT,
			color: "#000000",
			color_pick_mode: false
		};
		this.scope.pixel_grid = new PixelGrid(GRID_WIDTH, GRID_HEIGHT);
		document.getElementById("drawing-zone").appendChild(this.scope.pixel_grid);

		// Application automatique du redimensionnement
		new RS_Binding({
			object: this.scope,
			property: "width"
		}).addBinding(document.getElementById("width"), "value", "change", ()=> {
			this.scope.pixel_grid.applyDimensions(this.scope.width, this.scope.height);
		});
		new RS_Binding({
			object: this.scope,
			property: "height"
		}).addBinding(document.getElementById("height"), "value", "change", ()=> {
			this.scope.pixel_grid.applyDimensions(this.scope.width, this.scope.height);
		});

		// Syncronisation du champ pour la couleur du pinceau
		new RS_Binding({
			object: this.scope,
			property: "color"
		}).addBinding(document.getElementById("color"), "value", "change");
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

function onLoad() {
	document.currentController = new MainController();
}