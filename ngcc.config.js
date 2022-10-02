module.exports = {
    packages: {
        'ng2-pdf-viewer': {
            ignorableDeepImportMatchers: [/pdfjs-dist/]
        },
        '@ckeditor/ckeditor5-angular': {
            ignorableDeepImportMatchers: [/@ckeditor\//]
        }
    }
}
