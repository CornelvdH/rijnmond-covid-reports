const path = require('path');
const fs = require('fs');

const GenericOutputController = require('../generators/GenericOutputController');
const GenericDataConnector = require('./GenericDataConnector');

const ReportController = require('./ReportController');

class ReportTypeApiUtil {
    constructor(){

    }

    getGenerators(){
        let filePath = path.join(__dirname, '..', 'generators');
        let files = fs.readdirSync(filePath);

        let generators = [];

        for (const file of files) {
            if(path.extname(file) == '.js'){
                const fileNameWithoutExt = file.replace(path.extname(file), '');
                const _ref = require(`${filePath}/${fileNameWithoutExt}`);

                if(_ref.prototype instanceof GenericOutputController){
                    let generatorData = _ref.describe();
                    generatorData.reportType = fileNameWithoutExt.replace('OutputController', '').toLowerCase();
                    generatorData.name = fileNameWithoutExt;

                    generators.push(generatorData);
                }
                
            }
        }
        
        return generators;

    }

    getDataConnectors(){
        let filePath = path.join(__dirname, '..', 'controllers');
        let files = fs.readdirSync(filePath);

        let connectors = [];

        for (const file of files) {
            if(path.extname(file) == '.js'){
                const fileNameWithoutExt = file.replace(path.extname(file), '');
                const _ref = require(`${filePath}/${fileNameWithoutExt}`);

                if(_ref.prototype instanceof GenericDataConnector){

                    let reflectedClass = new _ref();
                    let connectorData = {};

                    connectorData.attributes = reflectedClass;
                    connectorData.reportType = fileNameWithoutExt.replace('DataConnector', '').toLowerCase();
                    connectorData.name = fileNameWithoutExt;

                    connectors.push(connectorData);
                }
                
            }
        }
        
        return connectors;

    }

    hasRequiredParams(body){
        return body.hasOwnProperty('dataConnector') && body.hasOwnProperty('date') && body.hasOwnProperty('reportType');
    }

    initReportController(body){
        let dataConnector = require(`./${body.dataConnector}`);
        const reportController = new ReportController();

        reportController.setDataConnector(dataConnector);
        reportController.forSpecificDate(new Date(body.date));
        reportController.setReportType(body.reportType);
        
        if(body.attributes){
            reportController.setAttributes(body.attributes);
        }

        return reportController;
    }

    async runDefaults(){

        const apiUtil = new ReportTypeApiUtil();

        let amountOfDays = 6; // last week
        let date = new Date();

        for(let i = amountOfDays; i >= 0; i--){
            let reportController = null;

            let currentDate = new Date(date);
            currentDate.setDate(currentDate.getDate() - i);

            currentDate.setHours(12);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);
            
            reportController = apiUtil.initReportController({
                dataConnector: "CsvDataConnector",
                date: currentDate.toISOString(),
                reportType: "chart",
                attributes: [{
                    type: "CASE_REPORT",
                    daysBefore: 120
                }]
            });

            await reportController.build();

            reportController = apiUtil.initReportController({
                dataConnector: "CsvDataConnector",
                date: currentDate.toISOString(),
                reportType: "text",
                attributes: []
            });

            await reportController.build();

            reportController = apiUtil.initReportController({
                dataConnector: "CsvDataConnector",
                date: currentDate.toISOString(),
                reportType: "average",
                attributes: []
            });

            await reportController.build();

            reportController = apiUtil.initReportController({
                dataConnector: "CsvDataConnector",
                date: currentDate.toISOString(),
                reportType: "bulletin",
                attributes: []
            });

            await reportController.build();
            
        }
    }
}

module.exports = ReportTypeApiUtil;