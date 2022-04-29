/**
 * Classe permettant de générer et de gérer la grille de pixels
 *
 * @class      PixelGrid (name)
 */
const PIXEL_CSS_SIZE = '5vw';
class PixelGrid extends HTMLDivElement {

	#grid_width;
	#grid_height;
	#elts_pixel;

	/**
	 * Constructeur de la classe
	 *
	 * @param      {number}  width   Largeur de la grille, en pixels
	 * @param      {number}  height  Hauteur de la grille, en pixels
	 */
	constructor(width, height) {
		super();
		this.classList.add("pixels-grid");
		this.applyDimensions(width, height);
	}

	/**
	 * Vide la grille avant de créer les pixels pour alimenter son contenu
	 *
	 * @param      {number}  width   Largeur de la grille, en pixels
	 * @param      {number}  height  Hauteur de la grille, en pixels
	 */
	applyDimensions(width, height) {
		this.#grid_width = width;
		this.#grid_height = height;
		this.#elts_pixel = [];
		this.innerHTML = "";
		this.style.gridTemplateColumns = `repeat(${width}, ${PIXEL_CSS_SIZE})`;
		for (let i = 0; i < width * height; i++)
			this.#addNewPixel(i);
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
		else this.#elts_pixel[index].style.backgroundColor = scope.color;
	}

	/** Fonction appelée lors d'un clic droit sur un pixel */
	#pixelRightClicked(event, index) {
		event.preventDefault();
		this.#elts_pixel[index].style.backgroundColor = "transparent";
	}
}
customElements.define('js-pixel-grid', PixelGrid, { extends: 'div' });

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