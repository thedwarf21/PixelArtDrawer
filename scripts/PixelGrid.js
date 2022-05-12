const BASE_PIXEL_SIZE = 5;
const CSS_UNIT = "vw";

const ZOOM_STEP = 0.1;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.3;

const SVG_PIXEL_SIZE = 10;


/**
 * Classe permettant de générer et de gérer la grille de pixels
 *
 * @class      PixelGrid (name)
 */
class PixelGrid extends HTMLDivElement {

	#grid_width;
	#grid_height;
	#zoom_ratio;
	#elts_pixel;

	/**
	 * Constructeur de la classe
	 *
	 * @param      {number}  width   Largeur de la grille, en pixels
	 * @param      {number}  height  Hauteur de la grille, en pixels
	 * @param      {number}  zoom    Niveau de zoom au foramt ratio
	 */
	constructor(width, height, zoom) {
		super();
		this.classList.add("pixels-grid");
		this.applyDimensions(width, height, zoom);

		// Gestion du niveau de zoom via 'mousewheel'
		window.addEventListener('mousewheel', (event)=> {
			if (event.deltaY > 0)
				this.zoomOut();
			else if (event.deltaY < 0)
				this.zoomIn();
		});
	}
	
	/** Mutateurs pour dimensionnement de la grille */
	getWidth() { return this.#grid_width; }
	getHeight() { return this.#grid_height; }

	/**
	 * Vide la grille avant de créer les pixels pour alimenter son contenu
	 *
	 * @param      {number}  width   Largeur de la grille, en pixels
	 * @param      {number}  height  Hauteur de la grille, en pixels
	 * @param      {number}  zoom    Niveau de zoom au foramt ratio
	 */
	applyDimensions(width, height, zoom) {
		this.#grid_width = width;
		this.#grid_height = height;
		if (zoom) 
			this.#zoom_ratio = zoom;
		this.applyZoom();

		this.#elts_pixel = [];
		this.innerHTML = "";
		for (let i = 0; i < width * height; i++)
			this.#addNewPixel(i);
	}

	/** Application du zoom */
	applyZoom() {
		let pixel_size = (BASE_PIXEL_SIZE * this.#zoom_ratio) + CSS_UNIT;
		this.style.gridTemplateColumns = `repeat(${this.#grid_width}, ${pixel_size})`;
		this.style.gridAutoRows = pixel_size;
	}

	/** Retourne l'objet nécessaire à la génération du fichier de sauvegarde */
	getProject() {
		let pixel_color_list = [];
		for (let pixel of this.#elts_pixel)
			pixel_color_list.push(pixel.style.backgroundColor);

		return {
			grid_width: this.#grid_width,
			grid_height: this.#grid_height,
			pixel_color_list: pixel_color_list
		};
	}

	/** Lit un objet (issu d'une sauvegarde JSON du projet) et met à jour l'interface */
	setProject(obj) {
		this.applyDimensions(obj.grid_width, obj.grid_height);
		document.currentController.scope.width = this.#grid_width;
		document.currentController.scope.height = this.#grid_height;
		for (let pixel of this.#elts_pixel)
			pixel.style.backgroundColor = obj.pixel_color_list.shift();
	}

	/** Augmente le niveau de zoom */
	zoomIn() {
		if (this.#zoom_ratio < MAX_ZOOM) {
			this.#zoom_ratio += ZOOM_STEP;
			this.applyZoom();
		} else RS_Toast.show("Niveau de zoom maximal déjà atteint...", 1500);
	}

	/** Réduit le niveau de zoom */
	zoomOut() {
		if (this.#zoom_ratio > MIN_ZOOM) {
			this.#zoom_ratio -= ZOOM_STEP;
			this.applyZoom();
		} else RS_Toast.show("Niveau de zoom minimal déjà atteint...", 1500);
	}

	/** Retourne le code SVG du dessin */
	getSvgCode() {
		let svg_code = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${SVG_PIXEL_SIZE * this.#grid_width}" height="${SVG_PIXEL_SIZE * this.#grid_height}">`;
		for (let y=0; y<this.#grid_height; y++) {
			for (let x=0; x<this.#grid_width; x++) {
				let pixel = this.#elts_pixel[y * this.#grid_width + x];
				if (pixel.style.backgroundColor)
					svg_code += `<rect x="${x * SVG_PIXEL_SIZE}" 
							y="${y * SVG_PIXEL_SIZE}" 
							width="${SVG_PIXEL_SIZE}" 
							height="${SVG_PIXEL_SIZE}" 
							style="fill:${pixel.style.backgroundColor}" />`;
			}
		}
		return svg_code + "</svg>";
	}

	/** Crée un nouveau pixel, et l'ajoute au contenu de la grille */
	#addNewPixel(index) {
		let pixel = document.createElement("DIV");
		pixel.classList.add("pixel");
		pixel.addEventListener("click", ()=> { this.#pixelClicked(index); });
		pixel.addEventListener("contextmenu", (e)=> { this.#pixelRightClicked(e, index); });
		this.#elts_pixel.push(pixel);
		this.appendChild(pixel);
	}

	/** Fonction appelée lors d'un clic sur un pixel */
	#pixelClicked(index) {
		let scope = document.currentController.scope;
		if (scope.color_pick_mode) {
			document.currentController.endColorPick();
			let pixel_color = this.#elts_pixel[index].style.backgroundColor;

			// Si l'utilisateur clique sur un pixel vierge, on affiche un toast d'avertissement, puis on sort
			if (pixel_color && pixel_color != "transparent") {

				// Si la longueur de la chaîne est > 7, c'est du format "rgb(red, green, blue)" => conversion en #rrggbb
				scope.color = pixel_color.length > 7
							? rgbToHex(pixel_color)
							: pixel_color;
			} else RS_Toast.show("Ce pixel n'a pas encore été colorisé : &nbsp; <b>action annulée</b>", 3000);
		}
		else  {
			this.#elts_pixel[index].style.backgroundColor = scope.color;
			scope.hot_new_draw = false;
		}
	}

	/** Fonction appelée lors d'un clic droit sur un pixel */
	#pixelRightClicked(event, index) {
		event.preventDefault();
		this.#elts_pixel[index].style.backgroundColor = "transparent";
	}
}
customElements.define('js-pixel-grid', PixelGrid, { extends: 'div' });

/**
 * Convertit une chaîne de caractère du format rgb(r, g, b) au foramt #RRGGBB
 *
 * @param      {string}  rgb_string  Couleur au format rbg(r, g, b)
 * @return     {string}  			 Couleur au format #RRGGBB		
 */
function rgbToHex(rgb_string) {
	let result = "#";
	let start_index = rgb_string.indexOf("(") + 1;
	let end_index = rgb_string.indexOf(")");
	let vals = rgb_string.substring(start_index, end_index).split(",");
	for (let val of vals) {
		let hex_val = parseInt(val).toString(16);
		result += hex_val.length == 2
				? hex_val
				: "0" + hex_val;
	}
	return result;
}
