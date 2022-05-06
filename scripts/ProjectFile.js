/**
 * Classe permettant de sauvegarder / charger un projet pixel art
 *
 * @class      ProjectFile (name)
 */
class ProjectFile {

    /**
     * Fonction créant un Blob et en lançant le téléchargement automatiquement
     *
     * @param      {string}  text_content  Contenu du fichier
     * @param      {string}  mime_type     Type mime du fichier
     * @param      {string}  filename      Nom du fichier
     */
    static autoDownload(text_content, mime_type, filename) {

        // Création d'un fichier virtuel, encapsulé dans un blob
        let blob = new Blob([text_content], { type: mime_type });

        // Création d'un lien pointant sur le blob ainsi créé
        let link = document.createElement("a");
        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        link.style.visibility = "hidden";
        document.body.appendChild(link);

        // Simulation du click : on supprime ensuite le lien du DOM
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
        }, 100);
    }
    
    /** Export de l'image au format SVG */
    static exportSvg() { ProjectFile.autoDownload(document.currentController.scope.pixel_grid.getSvgCode(), "image/svg+xml", "pixelart_image.svg"); }

    /**
     * Fonction permettant d'enregistrer un projet pixel art (format JSON)
     *
     * @param      {object}  object  Objet définissant le contenu de la sauvegarde
     */
    static save(object) { ProjectFile.autoDownload(JSON.stringify(object), "application/json", "new_pixelart_project.json"); }

    /**
     * Chargement d'un fichier de sauvegarde
     *
     * @param      {Function}  fn   Fonction à exécuter, et recevant en paramètre l'objet JS issu du parsing du fichier JSON
     */
    static load(fn) {
        var file = document.getElementById("file_selector").files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                let file_content = JSON.parse(evt.target.result);
                if (fn && file_content) {
                    document.currentController.scope.hot_new_draw = false;
                    fn(file_content);
                }
            }
            reader.onerror = function (evt) { RS_Toast.show("Lecture du fichier impossible", 1500); }
        }
    }
}