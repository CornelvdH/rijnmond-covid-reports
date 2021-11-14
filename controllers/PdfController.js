const htmlToPdf = require('html-pdf-node');
const options = { format: "A4" };

class PdfController {
    static async buildPdfFromReport(report){
        let file = {
            content: report.reportContents
        }

        if(report.reportType !== 'html'){
            file.content = `<pre>${file.content}</pre>`;
        }
        

        let output = await htmlToPdf.generatePdf(file, options);
        return output;
    }
}

module.exports = PdfController;