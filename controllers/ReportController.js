const path = require('path');
const fs = require('fs');

const uuid = require('uuid');

const Report = require('../models/Report').model;

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

    setAttributes(attributes){
        this.attributes = attributes;

        return this;
    }

    getReportTypeExtension(){
        let ext = '';
        switch (this.reportType){
            case 'json':
                ext = 'json';
                break;
            case 'html':
            case 'chart':
            case 'bulletin':
                ext = 'html';
                break;
            case 'text':
            case 'average':
            default:
                ext = 'txt';
                break;
        }

        return ext;
    }

    async saveDataToStore(uuid){

        let fileName = `output/${uuid}.${this.getReportTypeExtension()}`;

        await Report.deleteMany({
            date: this.targetDate.toISOString().split('T')[0] + 'T12:00:00Z',
            reportType: this.reportType,
            attributes: this.attributes
        });

        let report = new Report({
            date: this.targetDate.toISOString().split('T')[0] + 'T12:00:00Z',
            ext: this.getReportTypeExtension(),
            uuid: uuid,
            fileName: fileName,
            reportType: this.reportType,
            fileSize: this.data.length,
            reportContents: this.data,
            attributes: this.attributes
        });

        await report.save();

        return report;
    }

    async build(){
        const _this = this;
        
        let dataRetrievalDelegate = new _this.dataConnector();
        await dataRetrievalDelegate.fetch();

        _this.data = _this.reportGenerator.generate(dataRetrievalDelegate, this.targetDate, this.attributes);

        let fileSaveAction = await _this.saveDataToStore(uuid.v4());
        return fileSaveAction;
    }

}

module.exports = ReportGenerator;