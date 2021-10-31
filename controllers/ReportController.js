const path = require('path');
const fs = require('fs');

class ReportGenerator {
    constructor(){

    }

    setDataConnector(dataConnector){
        this.dataConnector = dataConnector;
        
        return this;
    }

    forSpecificDate(targetDate){
        this.targetDate = targetDate;

        return this;
    }

    forToday(){
        this.targetDate = new Date();

        return this;
    }

    setReportType(reportType){
        this.reportType = reportType;

        reportType = reportType.toLowerCase();
        reportType = reportType.substr(0, 1).toUpperCase() + reportType.substr(1);

        this.reportGenerator = new (require(`../generators/${reportType}OutputController`))();

        return this;
    }

    getReportTypeExtension(){
        let ext = '';
        switch (this.reportType){
            case 'json':
                ext = 'json';
                break;
            case 'html':
                ext = 'html';
                break;
            case 'text':
            default:
                ext = 'txt';
                break;
        }

        return ext;
    }

    saveDataToFile(){

        let filePath = path.join(__dirname, '..', `output/${this.targetDate.toISOString().split('T')[0]}.${this.getReportTypeExtension()}`);
        fs.writeFileSync(filePath, this.data);
    }

    async build(){
        const _this = this;
        
        let dataRetrievalDelegate = new _this.dataConnector();
        await dataRetrievalDelegate.fetch();

        _this.data = _this.reportGenerator.generate(dataRetrievalDelegate, this.targetDate);
        _this.saveDataToFile();

        return _this.data;
    }

}

module.exports = ReportGenerator;