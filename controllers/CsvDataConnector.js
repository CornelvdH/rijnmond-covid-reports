const axios = require('axios');
const csv = require('csv-parser');
const Readable = require('stream').Readable;

const GenericDataConnector = require('./GenericDataConnector');

class CsvDataConnector extends GenericDataConnector {
    constructor(){
        super();

        this.csvParseOptions = {separator: ';'};
        this.municipalityCodes = require('../config/municipality_codes.json');
        this.fetchUrl = 'https://data.rivm.nl/covid-19/COVID-19_aantallen_gemeente_cumulatief.csv'
    }

    async fetch(){
        const _this = this;

        let reportConfig = {
            method: 'get',
            url: _this.fetchUrl
        };
          
        let reportData = await axios(reportConfig).catch(err => console.log(err));

        _this.rawReportData = reportData.data;
        await _this.parseCsv();

        return _this;
    }

    async parseCsv(){
        const _this = this;
        const reportData = [];

        const readableStream = Readable.from(_this.rawReportData.split("\n"));
        let pipe = readableStream.pipe(csv(_this.csvParseOptions));

        pipe.on('data', function(data){
            if(_this.municipalityCodes.indexOf(data.Municipality_code) > -1){
                reportData.push(data);
            }
        });

        let streamEnd = new Promise(function(resolve, reject){
            pipe.on('end', () => {
                resolve();
            });
        });

        await streamEnd;

        _this.reportData = reportData;
        return _this.reportData;
    }

    getReportDataForSpecificDate(reportDate){
        const dateString = `${reportDate.toISOString().split('T')[0]} 10:00:00`;
        let filteredArray = this.reportData.filter(x => x.Date_of_report == dateString);
        filteredArray.sort(function(a, b){
            if(a.Municipality_name < b.Municipality_name) {
                return -1;
            }

            if(a.Municipality_name > b.Municipality_name) {
                return 1;
            }
        });

        return filteredArray;
    }

    getData(reportDate){
        if(reportDate){
            return this.getReportDataForSpecificDate(reportDate);
        } else {
            return this.reportData;
        }
        
    }

}

module.exports = CsvDataConnector;